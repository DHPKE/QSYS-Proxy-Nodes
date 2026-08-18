# PKE~Button-Bell — Q-SYS Plugin

A Q-SYS Designer plugin (`button-bell.qplug`) that plays a looped bell/ring
sound for as long as a button or input is held `true`, with a configurable
**minimum play time**, adjustable **reverb**, and a choice of **5 built-in
default sounds** or a **custom uploaded file** — so every theater can use
their own bell/ring tone without needing to touch the plugin logic.

## How it works (important architecture note)

Q-SYS third-party Lua plugins are **control-only** — they cannot generate or
decode audio themselves. Actual playback, looping, and reverb DSP are done
by two **native Q-SYS components** already built into Q-SYS Designer:

- An **Audio File Player** component (plays/loops the local audio file)
- A **Reverb** component (adds reverb to the played signal)

This plugin drives both of those components for you — handling the
trigger/release logic, minimum play time, looping, sound selection, and
reverb mix — via two **Named Component** properties. All you need to do is
place an Audio File Player and a Reverb component in your design, wire the
Audio File Player's output into the Reverb's input (and the Reverb's output
into your amp/zone), and then point this plugin at both by name.

## Properties

| Property | Default | Description |
| --- | --- | --- |
| **Sound Selection** | `Default 1 - Classic Bell` | Choose one of 5 built-in default sounds, or `Custom` to specify your own file. |
| **Custom File Name** | *(empty)* | File name (as it appears in the Audio File Player's file list / Core media library) to play when **Sound Selection** = `Custom`. Only shown when Custom is selected. |
| **Minimum Play Time (ms)** | `1000` | The bell/ring will play for at least this long, even if the button/input is released sooner. `0` disables the minimum (stops immediately on release). |
| **Reverb Mix Default (%)** | `20` | Initial reverb wet/dry mix percentage applied to the Reverb component on load. |
| **Audio File Player Component** | *(none)* | Named Component picker — select the Audio File Player component in your design that this plugin should control. |
| **Reverb Component** | *(none)* | Named Component picker — select the Reverb component in your design that this plugin should control. |
| **Debug Print** | `None` | Set to `All` to print trigger/playback activity to the Q-SYS log. |

## Pins

| Pin | Type | Direction | Description |
| --- | --- | --- | --- |
| `input` | Button (Toggle) | Input | The button or logic signal that starts/stops the bell. `true`/`1` = play, `false`/`0` = release (subject to minimum play time). |
| `stop_now` | Button (Trigger) | Input | Force-stops playback immediately, bypassing the minimum play time guard. |
| `sound_select` | Text | Input | Live override of **Sound Selection** (write one of the 5 default labels or `Custom`). |
| `custom_file_name` | Text | Input | Live override of the custom file name when using `Custom`. |
| `min_playtime_ms` | Text | Input | Live override of the minimum play time, in milliseconds. |
| `reverb_mix` | Knob (0–100%) | Input | Live reverb wet/dry mix control. |
| `active` | Indicator (LED) | Output | Lit while the bell is playing (including during the "finishing minimum play time" phase). |
| `status_text` | Text | Output | Human-readable status: `idle`, `playing: <file>`, or `finishing minimum play time...`. |

## Behavior

1. **Input goes true** → the plugin selects the configured sound file on the
   Audio File Player, forces **Loop = on** (since a bell can ring 15+
   seconds — far longer than most short bell/chime source clips — the
   file must repeat seamlessly), and starts playback. The minimum play
   timer starts counting.
2. **Input goes false before the minimum time elapses** → the release is
   remembered, but playback continues (still looping) until the minimum
   play timer fires, at which point it stops automatically.
3. **Input goes false after the minimum time has already elapsed** →
   playback stops immediately.
4. **Force Stop (`stop_now`)** → stops immediately regardless of minimum
   play time, for emergency/manual override.
5. **Reverb Mix** can be adjusted live at any time (including mid-ring) via
   the `reverb_mix` pin/knob.

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
5. In the plugin's Properties, select your **Audio File Player Component**
   and **Reverb Component** via the Named Component pickers.
6. Wire the `input` pin to your button/logic source.

## Version

v1.0.0

## Author

DHPKE
