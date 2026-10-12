# Where the circle has gaps

Read with [LINK-MAP.md](LINK-MAP.md) (what each page links to, written by `node tools/map-links.js`). Back is not one of the gaps: tool → verse → Back returns to the tool, and Back again returns to where the reader started (checked by `the trail back` in `tools/check-app.js`).

Ranked by how much understanding they add for someone reading a verse, and how little they cost a plain reader (CLAUDE.md, tests 1–4).

1. **The verse card has no "when and where".** The chapter header offers 📅 era, 🧭 journey and 📍 Where for the whole chapter, but a verse that *is* a timeline event ("The Flood", Genesis 6:8) or a journey stop ("Bethel", Genesis 28:19) does not say so on its card. Fix: one fold, closed until opened and hidden when nothing applies, like 🎵 and 🔤: "📅 On the timeline: …  🧭 Abraham's journey, stop 2". Timeline events carry a verse (`e[5]`) and journey stops carry one (`r`).
2. **A Person page leads only to Scripture and other people.** It names the man's Hebrew word but does not link it to Strong's, and does not link the places or events of his life. Fix: the Hebrew/Greek name opens Strong's; "Journeys" and "On the timeline" chips when his verses fall in them.
3. **A Place page does not say who lived or was there**, and has no timeline link. Fix: "People named here" (from the same verse lists) and a 📅 chip.
4. **A journey stop does not open its Place page**, and a stop has no way to the people in its verse.
5. **A Hitchcock Name page** leads to the person but not the place of the same name.
6. **The classic maps lead only to journeys.** No way from a map to its places or verses.
7. **A hymn leads only to Scripture.** A doctrine or topic it teaches (for example "Faith Alone") could be offered. Also: only 259 verses have a hymn on the verse card; most hymns echo more verses than the one to three listed.
8. **Dictionary, Strong's and Topics never lead to hymns** (the verse card now does).

Not gaps: Doctrines, Nave topics, Treasury and the Concordance all open the chapter from their verse rows; Dictionary and Strong's lead to each other and to Scripture.
