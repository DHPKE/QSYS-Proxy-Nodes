/**
 * qsys-trigger.js
 *
 * A Q-SYS branded Node-RED node that replicates the behavior of the
 * Node-RED core "trigger" node (node-red/node-red - 89-trigger.js).
 *
 * When triggered, it can send a message, and then optionally a second
 * message, unless extended or reset.
 */

module.exports = function (RED) {
    "use strict";
    var mustache = require("mustache");

    function parseTime(str) {
        try {
            var l = str.split(":");
            var i = 0;
            var t = 0;
            if (l.length === 3) {
                t += parseInt(l[i++]) * 3600000;
                t += parseInt(l[i++]) * 60000;
                t += parseInt(l[i++]) * 1000;
                return t;
            }
        } catch (e) {
            // fall through
        }
        return NaN;
    }

    function getProperty(node, type, value, msg, callback) {
        if (type === "pay" || type === "payl") {
            callback(null, msg.payload);
        } else if (type === "nul") {
            callback(null, null);
        } else {
            RED.util.evaluateNodeProperty(value, type, node, msg, callback);
        }
    }

    function QSYSTriggerNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.op1 = config.op1 || "";
        this.op2 = config.op2 || "0";
        this.op1type = config.op1type;
        if (this.op1type === undefined) {
            this.op1type = "str";
        }
        this.op2type = config.op2type;
        if (this.op2type === undefined) {
            this.op2type = "str";
        }
        this.duration = parseFloat(config.duration);
        if (isNaN(this.duration)) {
            this.duration = 250;
        }
        this.extend = config.extend;
        this.overrideDelay = config.overrideDelay;
        this.units = config.units || "ms";
        var mult = 1;
        if (this.units === "s") { mult = 1000; }
        if (this.units === "min") { mult = 60000; }
        if (this.units === "hr") { mult = 3600000; }
        this.duration = this.duration * mult;
        this.bytopic = config.bytopic || "topic";
        this.reset = config.reset;
        this.outputs = config.outputs || 1;

        var node = this;
        node.op1type = node.op1type || "str";
        node.op2type = node.op2type || "str";
        var tsUnits = { "ms": 1, "s": 1000, "min": 60000, "hr": 3600000 };

        node.durationInt = this.duration;
        node.messages = {};
        node.tout = null;

        node.reset = function (topic) {
            if (topic === undefined) {
                for (var t in node.messages) {
                    if (node.messages.hasOwnProperty(t)) {
                        if (node.messages[t] !== -1) {
                            clearTimeout(node.messages[t]);
                        }
                    }
                }
                node.messages = {};
                node.status({});
            } else {
                if (node.messages.hasOwnProperty(topic)) {
                    if (node.messages[topic] !== -1) {
                        clearTimeout(node.messages[topic]);
                    }
                    delete node.messages[topic];
                    if (Object.keys(node.messages).length === 0) {
                        node.status({});
                    } else {
                        node.status({ fill: "blue", shape: "dot", text: Object.keys(node.messages).length + " topics" });
                    }
                }
            }
        };

        node.on("input", function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments); };
            done = done || function (err) { if (err) { node.error(err, msg); } };

            var topic = node.bytopic === "topic" ? (msg.topic || "_none_") : "_all_";

            if (node.reset !== "" && node.reset !== undefined) {
                // static reset value/handling is configured separately below with resetVal
            }

            // Handle reset via msg.reset property or configured reset value
            var resetVal = config.reset;
            var doReset = false;
            if (msg.hasOwnProperty("reset")) {
                doReset = true;
            } else if (resetVal !== undefined && resetVal !== "") {
                if (resetVal === "true" && msg.payload === true) { doReset = true; }
                else if (resetVal === "false" && msg.payload === false) { doReset = true; }
                else if (String(msg.payload) === resetVal) { doReset = true; }
            }

            if (doReset) {
                node.reset(node.bytopic === "topic" ? topic : undefined);
                done();
                return;
            }

            if (node.messages.hasOwnProperty(topic)) {
                if (node.extend === "true" || node.extend === true) {
                    if (node.messages[topic] !== -1) {
                        clearTimeout(node.messages[topic]);
                    } else {
                        done();
                        return;
                    }
                } else {
                    done();
                    return; // blocked - ignore while waiting
                }
            }

            function sendMsg(propType, propVal, outputIndex) {
                if (propType === "nul") { return; }
                getProperty(node, propType, propVal, msg, function (err, value) {
                    if (err) {
                        node.error(err, msg);
                        return;
                    }
                    var newMsg = RED.util.cloneMessage(msg);
                    if ((propType === "str" || propType === "val") && typeof value === "string") {
                        value = mustache.render(value, msg);
                    }
                    if (propType === "val" || propType === "str") {
                        if (value === "true") { value = true; }
                        else if (value === "false") { value = false; }
                        else if (value === "null") { value = null; }
                    }
                    newMsg.payload = value;
                    if (node.outputs === 2 && outputIndex === 2) {
                        send([null, newMsg]);
                    } else {
                        send(newMsg);
                    }
                });
            }

            // send the first message
            sendMsg(node.op1type, node.op1, 1);

            var duration = node.durationInt;
            if (node.overrideDelay && typeof msg.delay === "number") {
                duration = msg.delay;
            }

            if (node.op2type === "nul" && duration < 0) {
                // repeat forever with op1 until reset
                node.messages[topic] = setInterval(function () {
                    sendMsg(node.op1type, node.op1, 1);
                }, Math.abs(duration));
                node.status({ fill: "blue", shape: "dot", text: "repeating" });
                done();
                return;
            }

            if (duration === 0) {
                // wait to be reset - block until reset received
                node.messages[topic] = -1;
                node.status({ fill: "blue", shape: "dot", text: "blocked" });
                done();
                return;
            }

            node.status({ fill: "blue", shape: "dot", text: "active" });
            node.messages[topic] = setTimeout(function () {
                sendMsg(node.op2type, node.op2, 2);
                delete node.messages[topic];
                if (Object.keys(node.messages).length === 0) {
                    node.status({});
                }
                done();
            }, Math.abs(duration));
        });

        node.on("close", function () {
            node.reset();
        });
    }

    RED.nodes.registerType("qsys-trigger", QSYSTriggerNode);
};
