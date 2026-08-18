# qsys-trigger-node

A [Node-RED](https://nodered.org) node for Q-SYS flows that behaves **exactly** like the core [Trigger](https://flowfuse.com/node-red/core-nodes/trigger/) node.

## Features

- Sends a configurable first message when triggered.
- Optionally waits a configurable delay and then sends a second message.
- Supports "extend delay if new message arrives" (watchdog-timer style behavior).
- Supports "wait to be reset" mode (infinite delay, `duration = 0`).
- Supports "resend every" / repeat mode (negative duration with `nul` second message).
- Optional second output for the second message.
- Reset via `msg.reset` property or a configurable payload match.
- Per-topic (`msg.topic`) or global message handling.
- `msg.delay` override support for dynamic delay timing.
- Mustache template syntax (`{{payload}}`, `{{topic}}`, etc.) support for string payloads.
- Supports typed values for send properties: flow/global context, string, number, boolean, JSON, buffer, timestamp, environment variable, incoming payload, or nothing.

## Install

Copy the `qsys-trigger-node` folder into your Node-RED user directory's `node_modules`, or install locally:

```bash
cd ~/.node-red
npm install /path/to/qsys-trigger-node
```

Then restart Node-RED. The node will appear in the palette under the **Q-SYS** category as **qsys-trigger**.

## Usage

Identical to the core Trigger node:

1. **Send** — the message sent immediately when triggered.
2. **Then** — the delay (and units) to wait before sending the second message.
3. **Send** (second) — the message sent after the delay, unless reset or extended.
4. **Extend delay if new message arrives** — restarts the timer on each new input instead of ignoring it.
5. **Allow msg.delay to override delay** — lets an incoming `msg.delay` (ms) dynamically set the timeout.
6. **Reset if** — a payload value that will reset/cancel the current timer.
7. **Handling** — treat all messages the same, or track them individually by `msg.topic`.

## License

Apache-2.0
