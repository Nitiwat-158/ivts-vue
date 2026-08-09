'use strict';

const accountAccess = require('./account-access');
const Account = require('../../accounts/controller/account');

function normalizePermissionPath(path) {
    if (!path) return '';
    var normalized = String(path).trim();
    var queryIndex = normalized.indexOf('?');
    if (queryIndex !== -1) normalized = normalized.slice(0, queryIndex);
    var hashIndex = normalized.indexOf('#');
    if (hashIndex !== -1) normalized = normalized.slice(0, hashIndex);
    normalized = normalized.replace(/\/{2,}/g, '/');
    if (!normalized.startsWith('/')) normalized = '/' + normalized;
    if (normalized.length > 1 && normalized.endsWith('/')) {
        normalized = normalized.slice(0, -1);
    }
    return normalized;
}

function swapPermissionPlurality(path) {
    var normalized = normalizePermissionPath(path);
    if (!normalized) return '';
    if (normalized.indexOf('/permissions') !== -1) {
        return normalized.replace('/permissions', '/permission');
    }
    if (normalized.indexOf('/permission') !== -1) {
        return normalized.replace('/permission', '/permissions');
    }
    return '';
}

function buildCandidates(paths) {
    var items = Array.isArray(paths) ? paths : [paths];
    var set = new Set();
    items.forEach(function (item) {
        var normalized = normalizePermissionPath(item);
        if (!normalized) return;
        set.add(normalized);
        var alternate = swapPermissionPlurality(normalized);
        if (alternate) set.add(alternate);
    });
    return Array.from(set);
}

function deny(response, statusCode, payload) {
    return response.status(statusCode).json(Object.assign({
        status: false,
        code: statusCode === 401 ? 40100 : 40300,
        message: statusCode === 401 ? 'Unauthorized' : 'Forbidden'
    }, payload || {}));
}

function summarizePermissionData(permissionData) {
    var matrix = permissionData && permissionData.matrix ? permissionData.matrix : {};
    var effective = permissionData && Array.isArray(permissionData.effectivePermissions) ? permissionData.effectivePermissions : [];
    return {
        assignmentCount: Array.isArray(permissionData && permissionData.assignments) ? permissionData.assignments.length : 0,
        permissionCount: Array.isArray(permissionData && permissionData.permissions) ? permissionData.permissions.length : 0,
        matrixPaths: Object.keys(matrix),
        effectivePermissions: effective.map(function (item) {
            return item && item.path ? item.path : null;
        }).filter(Boolean)
    };
}

function logDeniedPermission(request, statusCode, requiredAction, candidates, evaluation, extra) {
    var accountId = request && request.body && request.body.accounts ? String(request.body.accounts) : null;
    var authAccountId = request && request.authAccount && request.authAccount._id ? String(request.authAccount._id) : null;
    var permissionData = evaluation && evaluation.permissionData ? evaluation.permissionData : null;
    var payload = {
        statusCode: statusCode,
        accountId: accountId,
        authAccountId: authAccountId,
        method: request && request.method ? request.method : null,
        path: request && request.originalUrl ? request.originalUrl : null,
        requiredAction: requiredAction,
        requiredPaths: candidates,
        source: evaluation && evaluation.source ? evaluation.source : 'unknown',
        matchedPath: evaluation && evaluation.matchedPath ? evaluation.matchedPath : '',
        permissionSummary: summarizePermissionData(permissionData)
    };
    if (extra && typeof extra === 'object') {
        payload.reason = extra.reason || null;
        payload.message = extra.message || null;
    }
    // eslint-disable-next-line no-console
    console.warn('Permission denied:', payload);
}

exports.requirePermission = function (paths, action, options) {
    var requiredAction = action || 'view';
    var candidates = buildCandidates(paths);
    var resolverOptions = options || {};

    return async function (request, response, next) {
        try {
            var accountId = request && request.body ? request.body.accounts : null;
            if (!accountId) {
                logDeniedPermission(request, 401, requiredAction, candidates, null, {
                    reason: 'missing_account_context',
                    message: 'Missing account context'
                });
                return deny(response, 401, {
                    message: 'Missing account context',
                    data: {
                        reason: 'missing_account_context'
                    }
                });
            }

            if (!candidates.length) {
                return next();
            }

            var targetAccountId = typeof resolverOptions.targetAccountId === 'function'
                ? resolverOptions.targetAccountId(request)
                : null;
            var evaluation = await accountAccess.evaluatePermission(accountId, candidates, requiredAction, {
                targetAccountId: targetAccountId
            });
            var permissionData = evaluation && evaluation.permissionData ? evaluation.permissionData : null;
            var allowed = !!(evaluation && evaluation.allowed);

            if (!allowed) {
                logDeniedPermission(request, 403, requiredAction, candidates, evaluation, {
                    reason: 'permission_denied',
                    message: resolverOptions.denyMessage || 'Forbidden'
                });
                return deny(response, 403, {
                    message: resolverOptions.denyMessage || 'Forbidden',
                    data: {
                        requiredAction: requiredAction,
                        requiredPaths: candidates,
                        source: evaluation && evaluation.source ? evaluation.source : 'unknown'
                    }
                });
            }

            if ((evaluation && evaluation.source) !== 'iam' && typeof resolverOptions.targetAccountId === 'function') {
                if (targetAccountId) {
                    var targetAccount = await Account.onQuery({ _id: targetAccountId });
                    var assignments = permissionData && permissionData.assignments ? permissionData.assignments : [];
                    var scoped = accountAccess.hasAssignmentScope(assignments, accountId, targetAccount);
                    if (!scoped) {
                        return deny(response, 403, {
                            data: {
                                reason: 'data_scope_denied',
                                requiredAction: requiredAction,
                                requiredPaths: candidates
                            }
                        });
                    }
                }
            }

            request.permissionCheck = {
                action: requiredAction,
                paths: candidates,
                source: evaluation && evaluation.source ? evaluation.source : 'unknown'
            };
            return next();
        } catch (err) {
            return response.status(500).json({
                status: false,
                code: 50000,
                message: 'Permission evaluation failed'
            });
        }
    };
};
