"use strict";
exports.__esModule = true;
exports.parseToMessage = exports.parseToObject = void 0;
var client = require("./js/client");
var server = require("./js/server");
var authClient = require("./js/auth-client");
var authServer = require("./js/auth-server");
var mapClient = require("./idmap/client.json");
var mapServer = require("./idmap/server.json");
var mapAuthClient = require("./idmap/auth-client.json");
var mapAuthServer = require("./idmap/auth-server.json");
var revMapServer = {};
var revMapClient = {};
mapClient.forEach(function (x, i) { return (revMapClient[x] = i); });
mapServer.forEach(function (x, i) { return (revMapServer[x] = i); });
function parseToObject(pType, data) {
    var type = '';
    var packet;
    switch (pType) {
        case 'server':
            type = mapServer[data[0]];
            packet = server[type];
            break;
        case 'client':
            type = mapClient[data[0]];
            packet = client[type];
            break;
        case 'auth-server':
            type = mapAuthServer[data[0]];
            packet = authServer[type];
            break;
        case 'auth-client':
            type = mapAuthClient[data[0]];
            packet = authClient[type];
            break;
        default:
            return null;
    }
    if (type == undefined)
        return null;
    var rawData = data.slice(1);
    var message = packet.decode(rawData);
    var error = null;
    if (packet != undefined)
        error = packet.verify(message);
    else
        error = 'Invalid packet';
    if (error) {
        console.error('Invalid ' + pType + ' packet! Type: ' + type, error);
        return null;
    }
    return { data: packet.toObject(message, { defaults: true }), type: type };
}
exports.parseToObject = parseToObject;
function parseToMessage(pType, type, data) {
    var packet;
    var typeRaw = 0;
    if (pType == 'server') {
        typeRaw = revMapServer[type];
        if (typeRaw == undefined)
            return null;
        packet = server[type];
    }
    else {
        typeRaw = revMapClient[type];
        if (typeRaw == undefined)
            return null;
        packet = client[type];
        pType = 'client';
    }
    var error = null;
    if (packet != undefined)
        error = packet.verify(data);
    else
        error = 'Invalid packet';
    if (error) {
        console.error('Invalid ' + pType + ' packet! Type: ' + type, data, error);
        return null;
    }
    var message = packet.create(data);
    var encoded = packet.encode(message).finish();
    var out = new Uint8Array(1 + encoded.length);
    out.set([typeRaw]);
    out.set(encoded, 1);
    return out.buffer;
}
exports.parseToMessage = parseToMessage;
