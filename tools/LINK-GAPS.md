# Where the circle has gaps

Read with [LINK-MAP.md](LINK-MAP.md) (what each page links to, written by `node tools/map-links.js`). Back is not one of the gaps: tool → verse → Back returns to the tool, and Back again returns to where the reader started (checked by `the trail back` in `tools/check-app.js`).

Ranked by how much understanding they add for someone reading a verse, and how little they cost a plain reader (CLAUDE.md, tests 1–4).

1. ~~**The verse card has no "when and where".**~~ **Done in v62.01:** the card's **🧭 When & where** fold opens the timeline event or the journey stop a verse belongs to (275 verses; `verse-index.json` from `tools/build-verse-index.js`).
2. ~~**A Person page leads only to Scripture and other people.**~~ **Done in v62.02:** *In the story* (📅 timeline, 🧭 journeys, 📍 places named with them) and *🔤 in Hebrew & Greek*.
3. ~~**A Place page does not say who was there.**~~ **Done in v62.02:** *In the story* (👤 people named there, 📅 timeline) and *🔤 in Hebrew & Greek*.
4. ~~**A journey stop does not open its Place page.**~~ **Done in v62.02:** the stop's name opens the place. (A stop still has no way to the people in its verse; the place's page now lists them.)
5. ~~**A Hitchcock Name page leads to the person but not the place.**~~ Not a gap: the page already lists every person *and* place of the name (the first map read Abraham, which names no place). v62.03 adds *🔤 In Hebrew & Greek*.
6. ~~**The classic maps lead only to journeys.**~~ **Done in v62.03:** under each map, *📖 Verses, places & journeys* (hand-chosen passages, the journeys drawn on it, and the places those passages name).
7. **A hymn leads only to Scripture.** A doctrine or topic it teaches (for example "Faith Alone") could be offered. Also: only 259 verses have a hymn on the verse card; most hymns echo more verses than the one to three listed.
8. **Dictionary, Strong's and Topics never lead to hymns** (the verse card now does).

Not gaps: Doctrines, Nave topics, Treasury and the Concordance all open the chapter from their verse rows; Dictionary and Strong's lead to each other and to Scripture.
