# PKE~Trigger — Q-SYS Plugin

A Q-SYS Designer plugin (`trigger.qplug`) that behaves like the Node-RED
core [Trigger](https://flowfuse.com/node-red/core-nodes/trigger/) node:
send a value, then optionally a second value after a delay — unless the
delay is extended by a new trigger, the cycle is reset, or it's configured
to repeat / wait-to-be-reset instead.

## Properties

| Property | Default | Description |
| --- | --- | --- |
| **Send 1 Type** | `String` | Type of the first value sent: `String`, `Number`, `Boolean`, or `Nothing`. |
| **Send 1 Value** | `1` | The first value to send when triggered. |
| **Second Output** | `false` | When enabled, exposes a separate `output_2` pin for the second message (instead of reusing `output_1`). |
| **Duration** | `250` | Delay before the second value is sent. `0` = wait to be reset (block until Reset). Negative = repeat "Send 1" every abs(Duration) until reset. |
| **Duration Units** | `milliseconds` | `milliseconds`, `seconds`, `minutes`, or `hours`. |
| **Send 2 Type** | `String` | Type of the second value: `String`, `Number`, `Boolean`, or `Nothing`. |
| **Send 2 Value** | `0` | The second value to send after the delay. |
| **Extend Delay On New Trigger** | `false` | If enabled, a new trigger while a delay is running restarts the timer (watchdog-timer behavior) instead of being ignored. |
| **Allow Delay Override** | `false` | If enabled, the `delay_override_ms` pin dynamically overrides `Duration` (in ms) for the next trigger. |
| **Use Reset Value** | `false` | If enabled, writing the configured **Reset Value** to the `topic` pin resets the cycle (in addition to the dedicated Reset control). |
| **Reset Value** | *(empty)* | The value that triggers a reset when **Use Reset Value** is enabled. |
| **Handling** | `All Messages` | `All Messages` treats every trigger the same; `By Topic` tracks separate cycles per distinct `topic` pin value, mirroring Node-RED's per-`msg.topic` handling. |
| **Debug Print** | `None` | Set to `All` to print trigger/reset/send activity to the Q-SYS log. |

## Pins

| Pin | Type | Direction | Description |
| --- | --- | --- | --- |
| `trigger` | Button (Trigger) | Input | Fires the trigger cycle (equivalent to sending a message into the Node-RED Trigger node). |
| `reset` | Button (Trigger) | Input | Clears any pending timeout/repeat without sending a message. |
| `topic` | Text | Input | Optional topic identifier used when **Handling** = `By Topic`; also checked against **Reset Value** when enabled. |
| `delay_override_ms` | Text | Input | Optional delay override (ms), used only when **Allow Delay Override** is enabled. |
| `output_1` | Text | Output | Receives "Send 1", and "Send 2" as well unless **Second Output** is enabled. |
| `output_2` | Text | Output | Receives "Send 2" — only present when **Second Output** is enabled. |
| `active` | Indicator (LED) | Output | Lit while a delay/repeat/blocked cycle is in progress. |
| `status_text` | Text | Output | Human-readable status (`idle`, `active`, or `N topics active`). |

## Behavior Modes

- **Standard timeout**: `Duration > 0` — sends "Send 1" immediately, then "Send 2" after the delay.
- **Watchdog timer**: Set **Send 1 Type** to `Nothing` and enable **Extend Delay On New Trigger** — only sends "Send 2" if no trigger arrives within `Duration`.
- **Wait to be reset**: `Duration = 0` — sends "Send 1", then blocks all further triggers until `reset` is pressed (or the configured Reset Value is matched).
- **Repeat until reset**: `Duration < 0` — resends "Send 1" every `|Duration|` until `reset` is pressed.

## Installation

1. Open Q-SYS Designer.
2. **File → Plugins → Load Plugin**, then select `trigger.qplug`.
3. Drag the plugin into your design from the Schematic Library.
4. Configure properties and wire the pins as needed.

## Companion Node-RED Node

[`qsys-trigger.js`](./qsys-trigger.js) / [`qsys-trigger.html`](./qsys-trigger.html) in this same folder provide an equivalent Trigger node for Node-RED flows, for installations that use Node-RED alongside or instead of Q-SYS.

## Version

v1.0.0

## Author

DHPKE
