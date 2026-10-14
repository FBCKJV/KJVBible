# Scourby chapter timings

`SCOURBY_TS` in index.html says where each chapter starts and ends in Alexander Scourby's
recording of each book. They were measured from the recordings (October 2026): the reader
announces every chapter ("Chapter twenty-one", "Psalm twenty-three"), and a chapter starts
just before its announcement and ends just before the next one.

- `scan.py` downloads each book and listens near each expected break for "Chapter N"
  (speech to text: `pip install faster-whisper`; needs ffmpeg). Results go to `found/`.
- `pass2.py` listens again, continuously, for any break the first pass missed.
- `heard.json` is what was heard for every chapter (`ann` = the announcement's time in seconds).
  Ten breaks the speech tool misheard ("Captain Lloyd" for "Chapter nine") were placed by hand
  from the transcript: 1 Samuel 9, Proverbs 9, Zechariah 8, Exodus 5, Deuteronomy 18,
  2 Chronicles 5, Jeremiah 8 and 9, Ezekiel 37, Job 29.
- `measured.json` is the table that went into index.html.

Two recordings run on into the next book: 1 Kings into 2 Kings (1 Kings ends at 7578.5 s) and
1 Thessalonians into 2 Thessalonians (ends at 667.5 s). Their last chapter, and book play,
stop there.
