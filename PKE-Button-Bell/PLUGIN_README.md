# PKE~Button-Bell — Q-SYS Plugin

A Q-SYS Designer plugin (`button-bell.qplug`) that plays a looped bell/ring
sound for as long as a button or input is held `true`, with a configurable
**minimum play time**, adjustable **reverb**, and a choice of **5 built-in
default sounds** or a **custom uploaded file** — so every theater can use
their own bell/ring tone without needing to touch the plugin logic.

## How it works (important architecture note)

Q-SYS third-party Lua plugins are **control-only** — they cannot generate,
decode, or route audio themselves, and there is no mechanism for a plugin
to embed a native DSP block inside itself with its own audio pins. Actual
playback, looping, and reverb DSP are done by two **native Q-SYS
components** already built into Q-SYS Designer, placed separately in your
design:

- An **Audio File Player** component (plays/loops the local audio file)
- A **Reverb** component (adds reverb to the played signal)

This plugin drives both of those components for you — handling the
trigger/release logic, minimum play time, looping, sound selection, and
reverb mix — via two **Named Component** properties. All you need to do is
place an Audio File Player and a Reverb component in your design, wire the
Audio File Player's audio output into the Reverb's audio input (and the
Reverb's audio output into your amp/zone), and then point this plugin at
both by name. The `PKE~Button-Bell` plugin block itself only has control
pins (see below) — the actual audio signal path runs through those two
native components, not through the plugin block.

## Properties

| Property | Default | Description |
| --- | --- | --- |
| **Sound Selection** | `Default 1 - Classic Bell` | Choose one of 5 built-in default sounds, or `Custom` to specify your own file. |
| **Custom File Name** | *(empty)* | File name (as it appears in the Audio File Player's file list / Core media library) to play when **Sound Selection** = `Custom`. Only shown when Custom is selected. |
| **Minimum Play Time (ms)** | `1000` | The bell/ring will play for at least this long, even if the button/input is released sooner. `0` disables the minimum (stops immediately on release). |
| **Reverb Mix Default (%)** | `20` | Initial reverb wet/dry mix percentage applied to the Reverb component on load. |
| **Trigger Output Type** | `Boolean` | Data type of the `trigger_output` pin: `Boolean` (`true`/`false`), `Integer` (`1`/`0`), or `String` (`on`/`off`). |
| **Trigger On Time (ms)** | `1000` | How long `trigger_output` stays "on" after each press before automatically reverting to "off" — independent of the bell/ring duration and of whether the button is still held. |
| **Audio File Player Component Name** | *(empty)* | Type the exact Named Component name of the Audio File Player component in your design (see that component's own Properties > Name field) that this plugin should control. |
| **Reverb Component Name** | *(empty)* | Type the exact Named Component name of the Reverb component in your design that this plugin should control. |
| **Debug Print** | `None` | Set to `All` to print trigger/playback activity to the Q-SYS log. |

## Setup (wiring the actual audio)

Since the plugin block has **no audio pins of its own**, you must place and
wire the real audio signal path yourself, once, in your design:

1. Place a native **Audio File Player** component and a native **Reverb**
   component anywhere in the design.
2. Wire the Audio File Player's audio output → the Reverb's audio input.
3. Wire the Reverb's audio output → your amplifier/zone/gain block.
4. Name both components (Properties > Name) something memorable, e.g.
   `BellPlayer` and `BellReverb`.
5. In the `PKE~Button-Bell` plugin's properties, type those exact names
   into **Audio File Player Component Name** and **Reverb Component Name**.

Once wired, the plugin's control pins (below) drive that native audio path
for you automatically.

## Pins

| Pin | Type | Direction | Description |
| --- | --- | --- | --- |
| `input` | Button (Momentary) | Input | The button or logic signal that starts/stops the bell. Momentary behavior: `true` only while pressed/held (press = play), and Q-SYS automatically sends `false` on release (subject to minimum play time) — no toggle/latched state is retained. |
| `stop_now` | Button (Trigger) | Input | Force-stops playback immediately, bypassing the minimum play time guard, and forces the Trigger Output back off. |
| `sound_select` | Text (List) | Input | Live override of **Sound Selection** (write/select one of the 5 default labels or `Custom`). |
| `custom_file_name` | Text | Input | Live override of the custom file name when using `Custom`. |
| `min_playtime_ms` | Text | Input | Live override of the minimum play time, in milliseconds. |
| `reverb_mix` | Knob (0–100%) | Input | Live reverb wet/dry mix control. |
| `active` | Indicator (LED) | Output | Lit while the bell is playing (including during the "finishing minimum play time" phase). |
| `status_text` | Text | Output | Human-readable status: `idle`, `playing: <file>`, or `finishing minimum play time...`. |
| `trigger_output_type` | Text (List) | Input | Live override of **Trigger Output Type** (`Boolean`, `Integer`, or `String`). |
| `trigger_on_time_ms` | Text | Input | Live override of **Trigger On Time (ms)** — how long `trigger_output` stays "on" after each press. |
| `trigger_output` | Text | Output | The typed trigger output value. Reflects the "on" representation (`true` / `1` / `on`) immediately on press, then automatically reverts to the "off" representation (`false` / `0` / `off`) after **Trigger On Time (ms)**, independent of the bell/ring state or how long the button is held. |

## Behavior

1. **Input goes true (press)** → the plugin selects the configured sound
   file on the Audio File Player, forces **Loop = on** (since a bell can
   ring 15+ seconds — far longer than most short bell/chime source clips —
   the file must repeat seamlessly), and starts playback. The minimum play
   timer starts counting. At the same time, the **Trigger Output** fires
   (see item 6 below).
2. **Input goes false (release) before the minimum time elapses** → the
   release is remembered, but playback continues (still looping) until
   the minimum play timer fires, at which point it stops automatically.
3. **Input goes false (release) after the minimum time has already
   elapsed** → playback stops immediately.
4. **Force Stop (`stop_now`)** → stops playback immediately regardless of
   minimum play time, for emergency/manual override, and also forces the
   Trigger Output back to its "off" value immediately.
5. **Reverb Mix** can be adjusted live at any time (including mid-ring) via
   the `reverb_mix` pin/knob.
6. **Trigger Output** → on every press of `input`, `trigger_output` is
   immediately set to the "on" representation of the configured
   **Trigger Output Type** (`true` for Boolean, `1` for Integer, `on` for
   String), then automatically reverts to the "off" representation
   (`false` / `0` / `off`) after **Trigger On Time (ms)** elapses. This
   timing runs completely independently of the bell/ring playback and of
   how long the `input` button is actually held — it always fires for the
   configured on-time once triggered (unless `stop_now` forces it off
   early).

## Default Sounds

The plugin ships 5 default sound choices. These map to file names it
expects to find in the Audio File Player's file list (i.e. placed in the
Core's Media Library / Design Media folder):

| Dropdown Choice | Expected File Name |
| --- | --- |
| Default 1 - Classic Bell | `PKE_Bell_Classic.wav` |
| Default 2 - School Bell | `PKE_Bell_School.wav` |
| Default 3 - Soft Chime | `PKE_Bell_Chime.wav` |
| Default 4 - Theater Bell | `PKE_Bell_Theater.wav` |
| Default 5 - Buzzer | `PKE_Bell_Buzzer.wav` |

> Upload these 5 files (or your own files using the same names) to the
> Core's Media Library so they appear in the Audio File Player's file
> browser. If your file names differ, edit the `DEFAULT_SOUND_FILES`
> table near the top of `button-bell.qplug` to match.

For a fully custom sound, set **Sound Selection** to `Custom` and enter the
exact file name (as it appears in the Audio File Player's file list) in
**Custom File Name** — this lets each theater upload and use their own
bell/ring audio without any code changes.

## Installation

1. In Q-SYS Designer, place a native **Audio File Player** component and a
   native **Reverb** component in your design; wire Audio File Player
   output → Reverb input → your amp/zone.
2. Upload the 5 default sound files (or your own) to the Core's Media
   Library so the Audio File Player can select them.
3. **File → Plugins → Load Plugin**, then select `button-bell.qplug`.
4. Drag the plugin into your design from the Schematic Library.
5. In the plugin's Properties, type the exact **Named Component** name of
   your Audio File Player into **Audio File Player Component Name**, and
   your Reverb component's name into **Reverb Component Name**. You can
   find/set a component's Named Component name in that component's own
   Properties panel (the "Name" field at the top).
6. Wire the `input` pin to your button/logic source.

## Version

v1.0.0

## Author

DHPKE
