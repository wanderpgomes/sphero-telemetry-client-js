"use strict";

var sphero = require('sphero');

var ws = require('nodejs-websocket');

var device = sphero('6909d327ac594614900ddb0daeb2ad40');

var wsConnection = ws.connect('ws://localhost:8080/sphero-data/bb8');



wsConnection.on('connect', function() {
    console.log('Sphero connected to WebSocket at ws://localhost:8080/sphero-data/bb8');
});

device.connect(function() {

    var locationConfigOptions = {
        flags: 0x01,
        x: 0x0000,
        y: 0x0000,
        yawTare: 0x0
    };

    device.configureLocator(locationConfigOptions, function(err, data) {
        console.log(err || 'Location reset');
    });

    var dataOptions = {
        n: 400,
        m: 1,
        mask1: 0x00000000,
        pcnt: 0,
        mask2: 0x0D800000
    };

    device.setDataStreaming(dataOptions);

    device.on("dataStreaming", function(data) {

        wsConnection.sendText(JSON.stringify(data));

        wsConnection.on("text", function (str) {
            var notification = JSON.parse(str);
            device.color(notification.color);
        });
    });

    device.setMotionTimeout(1000, function(err, data) {
        console.log(err || 'Motion timeout set to 1000 ms.');
    });

    device.color("green");
    device.roll(80, 0);

});

wsConnection.on('close', function() {
    console.log('Sphero disconnected from WebSocket at ws://localhost:8080/sphero-data/bb8');
});