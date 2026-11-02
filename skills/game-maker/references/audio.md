# Audio chip & music

## Voices
- Pulse 1 & 2: square with duty 12.5/25/50/75%, volume envelope, pitch sweep.
- Wave: 32-sample 4-bit wavetable.
- Noise: 15/7-bit LFSR, clock divisor.
- Synthwave layer: detuned saw pads, sub bass, arps, simple reverb/delay.

## Songs as text
Tracker-style patterns in TS string constants, e.g. per channel rows of `note octave instrument effect`. Parsed into compact event arrays; scheduler runs ahead on the audio clock.

## Seamless biome transitions
- All biome songs share tempo grid and compatible keys/modes.
- Transition on a bar/phrase boundary.
- Carry melody: map current phrase position and last note into the next song's corresponding phrase so the line continues.
- Crossfade the synthwave layer; swap chip patterns in place.

## SFX
Parametric (sfxr-style) definitions in code, played on a stolen/reserved chip voice with priority.
