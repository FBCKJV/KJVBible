# The promo video

Builds the narrated demo video of the app for YouTube and for sharing with other churches: the real app, tapped through in a phone-sized browser, with a caption beside the phone, a narrator and a soft music bed. 1920 × 1080, about 5½ minutes.

Everything it makes (recordings, captions, audio and the finished `.mp4`) stays in this folder and is ignored by git; only the scripts, the narration script and the narration recording are kept.

## What is here

| File | What it does |
|---|---|
| `script.json` | The narration, one paragraph per scene, in the order they play. The keys name the scenes. |
| `narration/mike.mp3` | The narration as read by the ElevenLabs voice "Mike" from `script.json` (plain paragraphs, no pause tags). |
| `split.py` | Splits one narration recording into a clip per paragraph (`vo-<name>/<scene>.wav` and `lens.json` with their lengths). It finds each paragraph by transcribing the recording, then cuts in the quietest moment between paragraphs, so no word is clipped. |
| `verify.py` | Transcribes every clip back, to check each starts and ends on the right words. |
| `tts.py` | Makes the clips with a free Piper voice instead, when there is no recording (it sounds robotic: fine for timing a draft). |
| `record4.js` | Records the phone part: the app at 390 × 844, real taps on the real app, each scene at least as long as its narration. Blocks every outside service, so nothing reaches the live cloud backup. |
| `record3.js` | Records the laptop part (study notes beside the chapter, then Present) at 1440 × 900. |
| `lib.js` | Shared by the recorders: a local server over the repository, the visible tap, and the screen recorder. |
| `tophone.js` | Turns a recording's frames into a 30 fps clip and writes its scene times. |
| `stage.html`, `render.js` | The captions beside the phone or laptop, the device frames, the opening and closing cards. `render.js` draws them as images. |
| `music.py` | Composes the music bed: slow, soft piano and pad in D major. Made here, so it is free of any copyright claim. |
| `compose2.js` | Puts it together: screens, captions, frames, narration on each scene's start, music lowered under the voice, loudness for YouTube (−15 LUFS). |

## Making the video

Needs Node with Playwright (as for `tools/check-app.js`), ffmpeg, and Python with `numpy`, `scipy` and `faster-whisper` (and `piper-tts` for `tts.py`):

```sh
python3 -m venv ~/promo-py && ~/promo-py/bin/pip install numpy scipy faster-whisper piper-tts
export PROMO_PY=~/promo-py/bin/python
cd tools/promo
```

1. **Narration.** Paste the paragraphs of `script.json` into ElevenLabs as plain text, one blank line between them and no pause tags (on the v4 model `[pause]` and `<break>` stop the reading). Save the MP3 in `narration/`, then split it:

   ```sh
   $PROMO_PY split.py narration/mike.mp3 vo-mike romans=26.4
   $PROMO_PY verify.py vo-mike
   ```

   If `split.py` stops with "paragraph … not found", or `verify.py` shows a paragraph holding the start of the next one, the transcript skipped some words there. Find where that paragraph begins (play the recording around it) and give it as `scene=seconds`, as `romans=26.4` does for this recording.

2. **Record** (about 5 minutes each, in real time):

   ```sh
   node record4.js n vo-mike && node tophone.js rec-n
   node record3.js l && node tophone.js rec-l 1920x1200
   ```

3. **Captions and the video:**

   ```sh
   node render.js
   node compose2.js rec-n rec-l vo-mike kjv-bible-app-promo
   ```

   `kjv-bible-app-promo.mp4` is the finished video.

## Changing it

- **Wording.** Change `script.json` and record the narration again. A new scene needs its key in `script.json`, a `scene('<key>', …)` in `record4.js` in the same place, and a caption under that key in `stage.html` (`C` in its script).
- **The app changed.** Record again (steps 2 and 3); the narration can stay. If a scene prints `FAILED`, a button it taps has moved: look at that scene in `record4.js`.
- **A scene runs past its narration.** `record4.js` prints `over <scene> 2.1s`; the music fills the gap. Shorten that scene's waits, or lengthen its paragraph.

## The thumbnail

`thumbnail.html` is the YouTube thumbnail (1280 × 720); its two phone screens are frames of the phone recording. After recording, take them and draw it:

```sh
ffmpeg -ss 76 -i rec-n.mp4 -frames:v 1 thumb-card.png   # the John 3:16 verse card, "begotten" open
ffmpeg -ss 3  -i rec-n.mp4 -frames:v 1 thumb-home.png   # Home with the Verse of the Day
node thumbnail.js                                         # → thumbnail.png
```

The times move a little with each recording: the verse card is a few seconds after the `card` time in `rec-n.marks.json`. The web address sits bottom left, since YouTube puts the video's length over the bottom-right corner.
