'use strict';

var express = require('./config/express');
var app = express();
var http = require('http');
var https = require('https');
var fs = require('fs');
var cfg = require('./config/config');
var mongoose = require('mongoose');
var runtimeAccessSettings = require('./helpers/runtime-access-settings');
var runtimeAccessMonitor = require('./helpers/runtime-access-monitor');

/**
 * Get port from environment and store in Express.
 */
var port = cfg.host.port;

/**
 * Create HTTP server.
 */
var server = http.createServer(app);

/**
 * Socket.IO setup
 */
var io = require('socket.io')(server, {
    cors: {
        origin: function (origin, callback) {
            if (runtimeAccessSettings.isSocketOriginAllowed(origin)) {
                callback(null, true);
            } else {
                runtimeAccessMonitor.recordEvent({
                    source: 'socket-cors',
                    type: 'origin-check',
                    decision: 'denied',
                    origin: origin,
                    statusCode: 403,
                    message: 'Access denied by runtime socket origin policy.'
                });
                callback(new Error('Not allowed by socket CORS'));
            }
        },
        credentials: true
    }
});
require('./server/routes/socket.js')(io);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, function() {
    console.log(`🚀 Server running on port ${port}`);
});

server.on('error', onError);
server.on('listening', onListening);

// Graceful shutdown function
let isShuttingDown = false;
const shutdown = () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log('Gracefully shutting down...');

    server.close(async () => {
        console.log('Closed all HTTP connections');

        if (mongoose.connection && mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log('Closed MongoDB connection');
        }

        process.exit(0);
    });

    setTimeout(() => {
        console.error('Forcing shutdown');
        process.exit(1);
    }, 10000).unref();
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
}