# Faith Baptist Church — KJV Bible App

## The vision

**Everything leads back to the Word.**

This app exists so people read the King James Bible, understand it, keep it and share it. Every tool in it (search, doctrines, the dictionary, maps, the timeline, plans, lists, notes, studies, slides, verse cards, Sword Drill) is there to serve the reading of Scripture, never to compete with it.

**Every kind of use is worth the same care.** The app must feel complete and rewarding to:

- someone who only opens it to read a chapter and the Verse of the Day;
- someone working through a reading plan, keeping a streak;
- someone memorizing verses in Sword Drill and earning badges;
- a teacher or pastor building lessons and sermons, saving verse lists, presenting slides, making verse cards to share.

None of these is the "real" use with the others as extras. A reader who never touches a tool should never feel they are missing something; someone who uses every tool should find each one makes the others richer.

**The features form one circle.** A verse read in the morning can be highlighted, saved to a list, drilled in Sword Drill, dropped into a study, presented on a Sunday, shared as a card, and every one of those places has a reference you can tap to land back in the chapter. Search leads to doctrines, doctrines to verses, verses to maps and the timeline, maps to journeys, journeys back to verses. Nothing is a dead end.

## The test for every change

Before building a feature, or when changing one, answer these:

1. **Where do you reach it from?** It should be found where people already are: the verse card, the long-press bar, Home, the end of a chapter, the notebook. Not only from a menu.
2. **Where does it lead?** It should hand its result to the other features: save to My Verses, add to a study, ⚔ drill it, 📸 make a card, 🎦 present it.
3. **How does it get you back to Scripture?** Every verse it shows carries a tappable reference that opens the chapter.
4. **Is it still good for someone who only reads?** It must not crowd or complicate plain reading. Extra power belongs in a fold, a ›, or a long-press, never in the way.
5. **Would someone who doesn't use much tech manage it?** Plain words, large targets, one clear action, nothing destructive without the app's own confirm sheet (`appConfirm`, never `confirm()`), and a first-use hint (`HINTS`) if it isn't obvious.

## How the app is put together

- **One file.** The app is `index.html` (HTML, CSS and JS together); `sw.js` is the service worker. Book text is in `bible/`, reference data in the JSON files at the root, and build scripts in `tools/`.
- **Look and feel.** Use the theme tokens in `:root` (dark), `.light` and `.sepia`, and never one-theme colours. The fonts are IM Fell English (titles), Crimson Pro (Scripture and reading text) and Inter (interface). Home cards share the `.hw` style: an arrow that turns folds a card open; › goes to a page.
- **Keep the user's muscle memory.** Don't reorder buttons people press every day (the verse card, the long-press bar, the bottom tabs) without a reason the user has agreed to.
- **Data.** Data is stored in `localStorage` under `kjv_*` keys and backed up with the restore code (`SYNC_KEYS`). Anything people create (bookmark lists, highlights, notes, studies, plans) belongs in `MERGE_STORES`, so it merges item by item across devices instead of the last device overwriting the others. Never change a stored format in a way an older copy of the app can't read; add a new key and migrate instead.
- **Back button.** Every sheet or pop-over must close on the phone's Back button (`openPopover` / `closePopover`, `POPOVER_IDS`).
- **Releases.** A feature release raises the major version (`v50` → `v51`) in `sw.js` `CACHE_NAME` and `WHATS_NEW_VERSION`, adds a What's New item (`data-wn`), and adds a CHANGELOG section. A fix or a minor feature is a stealth update: it raises the minor version (`v50.01`) in `sw.js` `CACHE_NAME` only, with a line in the CHANGELOG (under Bug Fixes, or the minor feature's own line), and **no What's New popup** — leave `WHATS_NEW_VERSION` and the `data-wn` items alone. Only a major feature release shows What's New. Keep Tips & Help, each tool's `TOOL_TIPS` and the first-use `HINTS` up to date with what changed.
- **Check before pushing.** Run `node tools/check-app.js`: it checks that every inline script parses and the versions agree, then walks the everyday journeys in a phone-sized browser (reading and the streak, the verse card, every study tool and Back, Strong's, first-use hints, the cloud backup against a Firestore stand-in, the backup file). Add a check there for each new feature. `--shots` saves light and dark screenshots to look over; still try the change by hand in both themes.

## Words

Write the way the church speaks: warm, plain and reverent. Use KJV phrasing where it fits naturally ("keep them hidden in thine heart"). Name things by what people recognize (My Verses, Notes, Reading Journal), not by how they are built.
