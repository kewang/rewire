## ADDED Requirements

### Requirement: Master volume control via GainNode
audio.ts SHALL maintain a single masterGain node. All audio output (playTone, buzzing, appliance sounds) SHALL route through masterGain before reaching AudioContext.destination. masterGain.gain SHALL reflect the current master volume (0.0–1.0).

#### Scenario: All audio routes through masterGain
- **WHEN** any audio plays (playTone, startBuzzing, startApplianceSounds)
- **THEN** the audio signal passes through masterGain before reaching speakers

#### Scenario: Volume change affects all active audio
- **WHEN** master volume is changed while buzzing and appliance sounds are playing
- **THEN** all active audio volume changes immediately without restarting sounds

### Requirement: Set and get master volume
audio.ts SHALL export `setMasterVolume(volume: number)` and `getMasterVolume(): number`. Volume SHALL be clamped to 0.0–1.0. Setting volume SHALL immediately update masterGain.gain value. Default volume SHALL be 0.5.

#### Scenario: Set volume to 0.7
- **WHEN** `setMasterVolume(0.7)` is called
- **THEN** `getMasterVolume()` returns 0.7
- **THEN** masterGain.gain value equals 0.7

#### Scenario: Volume clamped to range
- **WHEN** `setMasterVolume(1.5)` is called
- **THEN** `getMasterVolume()` returns 1.0

#### Scenario: Default volume
- **WHEN** audio.ts is first loaded with no localStorage setting
- **THEN** `getMasterVolume()` returns 0.5

### Requirement: Mute toggle
audio.ts SHALL export `setMuted(muted: boolean)` and `isMuted(): boolean`. When muted, masterGain.gain SHALL be 0. When unmuted, masterGain.gain SHALL restore to the current volume value.

#### Scenario: Mute silences all audio
- **WHEN** `setMuted(true)` is called
- **THEN** `isMuted()` returns true
- **THEN** all audio output is silent (masterGain.gain = 0)

#### Scenario: Unmute restores volume
- **WHEN** `setMuted(false)` is called after being muted at volume 0.7
- **THEN** `isMuted()` returns false
- **THEN** masterGain.gain equals 0.7

### Requirement: localStorage persistence
Volume and mute state SHALL be persisted to localStorage key `rewire-volume` as JSON `{ volume: number, muted: boolean }`. On module load, audio.ts SHALL read this key and apply saved values. On each setMasterVolume or setMuted call, audio.ts SHALL write to this key.

#### Scenario: Settings survive page reload
- **WHEN** user sets volume to 0.3 and mutes, then reloads page
- **THEN** `getMasterVolume()` returns 0.3
- **THEN** `isMuted()` returns true

#### Scenario: No saved settings uses defaults
- **WHEN** localStorage has no `rewire-volume` key
- **THEN** volume defaults to 0.5 and muted defaults to false

### Requirement: VolumeControl UI component
A `VolumeControl` component SHALL render a speaker icon button and a horizontal volume slider. The speaker icon SHALL toggle mute on click. The slider SHALL adjust volume from 0% to 100%. The component SHALL display in the game header area.

#### Scenario: Click speaker icon to mute
- **WHEN** user clicks the speaker icon while unmuted
- **THEN** icon changes to muted variant
- **THEN** all audio becomes silent

#### Scenario: Click muted icon to unmute
- **WHEN** user clicks the muted speaker icon
- **THEN** icon changes to speaker variant
- **THEN** audio resumes at previous volume

#### Scenario: Drag slider to adjust volume
- **WHEN** user drags volume slider to 30%
- **THEN** master volume updates to 0.3 immediately
- **THEN** slider position reflects 30%

#### Scenario: Slider at 0 auto-mutes
- **WHEN** user drags slider to 0%
- **THEN** muted state becomes true
- **THEN** speaker icon shows muted variant

### Requirement: VolumeControl i18n
VolumeControl SHALL use i18n keys for all user-visible text. Tooltip text SHALL be translated in all 6 languages (zh-TW, en, ja, ko, fr, th).

#### Scenario: Tooltip shows translated text
- **WHEN** language is set to English and user hovers speaker icon
- **THEN** tooltip shows "Mute" or "Unmute" in English

### Requirement: VolumeControl placement
VolumeControl SHALL be rendered in the game board header, positioned near the top-right area alongside existing controls. It SHALL not obstruct game content on any viewport size.

#### Scenario: Desktop layout
- **WHEN** viewport width >= 1025px
- **THEN** VolumeControl is visible in header area without overlapping game content

#### Scenario: Mobile layout
- **WHEN** viewport width <= 640px
- **THEN** VolumeControl remains accessible and does not overflow
