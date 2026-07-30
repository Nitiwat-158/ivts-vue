import api from '@/service/api'

export async function fetchVehicles(searchQuery = '', statusFilter = 'all', accountStatusFilter = 'all', page = 1, limit = 25) {
  const response = await api.ivtsOwnerVehicles('get-all', {
    search: searchQuery,
    document_status: statusFilter,
    account_status: accountStatusFilter,
    page,
    limit
  })
  
  if (response && response.data) {
    return {
      vehicles: response.data.data || [],
      total: response.data.total || 0,
      stats: response.data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 }
    }
  }
  return { vehicles: [], total: 0, stats: { total: 0, pending: 0, approved: 0, rejected: 0 } }
}

export async function approveVehicle(id) {
  const response = await api.ivtsOwnerVehicles('approve', { id })
  return response.data
}

export async function rejectVehicle(id, payload) {
  const response = await api.ivtsOwnerVehicles('reject', { id, payload })
  return response.data
}

export async function deleteVehicle(id) {
  const response = await api.ivtsOwnerVehicles('delete', { id })
  return response.data
}

export async function updateAccountStatus(id, status) {
  const response = await api.ivtsOwnerVehicles('account-status', { id, payload: { status } })
  return response.data
}

export async function exportVehicles(searchQuery = '', statusFilter = 'all', accountStatusFilter = 'all') {
  const response = await api.ivtsOwnerVehicles('export', {
    search: searchQuery,
    document_status: statusFilter,
    account_status: accountStatusFilter
  })
  return response.data
}

/**
 * Fetch vehicle registration requests (add/renew).
 * Uses GET /api/v1/ivts/requests with optional filters.
 */
export async function fetchRequests(filters = {}) {
  const response = await api.ivtsRequests('get-all', filters)
  if (response && response.data) {
    return {
      rows: response.data.data && response.data.data.rows ? response.data.data.rows : (response.data.data || []),
      total: response.data.data && response.data.data.total ? response.data.data.total : 0
    }
  }
  return { rows: [], total: 0 }
}

/**
 * Approve or reject a vehicle registration request.
 * Uses PUT /api/v1/ivts/requests/:id/review
 * @param {string} id - request _id
 * @param {'approved'|'rejected'} status
 */
export async function reviewRequest(id, status) {
  const response = await api.ivtsRequests('review', {
    id,
    payload: { request_status: status }
  })
  return response.data
}
