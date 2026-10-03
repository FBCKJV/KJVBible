# ✝ Faith Baptist Church — KJV Bible App
### Version 2.0 — May 2026
### Changelog since v1.0

---

## New Features

### 📖 Webster's 1828 Dictionary (v31)
- **Search → Dictionary** is now Noah Webster's *American Dictionary of the English Language* (1828, public domain) — **62,412 entries** — with the church's **KJV notes** merged in: one entry per word, the note on top as "In the King James Bible", Webster beneath
- Source: the akaitsurugi/webster1828 transcription (CC BY-SA 4.0), plus 21 entries it lacks from DataWar/1828-dictionary (MIT). DataWar's copy wasn't used as the base — ~800 of its entries are scraped website error pages and menu text
- **Scripture references checked and repaired** — the transcription dropped or garbled digits (Hebrews 2:18 printed "Hebrews 2:1", Psalm 139:12 "Psalms 13:1"). All 5,814 references were checked against the KJV: 5,144 correct as printed, **454 repaired** to the exact verse (by matching the quotation, then the headword), 180 too garbled to recover are shown as the **chapter** (never a wrong verse), 35 confirmed by hand (spelling differences, references that illustrate an idea), 1 non-Scripture "reference" unlinked. Every repair is listed in `tools/webster1828/repairs.txt`
- KJV spellings find Webster's (*savour* → savor, *succour* → succor), and words Webster lacks (*shittim*, *ephah*) show the church note alone
- Long entries open to the first senses with "Show the full entry"; references are tappable, and Back returns to the entry
- **Verse card**: a hard word now shows Webster's first definition under the church note, with a link to the full entry
- **Search**: a single KJV word with a church note shows a 📖 dictionary card
- The dictionary loads one letter at a time and is saved on the device

### 👤 Bible People (v30)
- **Search → Names** now covers the ~3,000 named people of the Bible (BibleData, CC BY 4.0) alongside Hitchcock's name meanings
- **Name pages** tell same-named people apart — 24 Zechariahs, 6 Marys — most-mentioned first, each with a one-line description
- **Person pages**: who they were (with tappable references), tribe, other names (*Abram — also called Abraham*; *Saul — also called Paul*), the name in **Hebrew/Greek** with transliteration and meaning, **family & connections** (father, mother, spouses, children, siblings, masters, allies…) as links, and every verse that names them
- Searching a person's name shows a 👤 card for them; "Jesus" points to the topic *Jesus, the Christ*
- Editorial choices in the build: the dataset's entries modelling God as "people" are left out, and "G-d"/"y-h-v-h" are written "God"/"the LORD" as in the KJV

### 🔗 Everything Connected (v30)
- **Verse card**: tap a verse to see the **people named in it** and the **doctrines that cite it** — each a link (Back returns to the reader)
- **Map buttons in the reader** — chapters covered by a Bible map (Exodus 12–40, the kingdoms, the Gospels, Acts 13–28, …) show a 🗺️ button for it
- **Recent searches** under the empty search box (remembered when a result is used; per device; clearable)
- **Concordance word families** — an exact Concordance search offers the word's other forms: "Also include reigned, reigneth, reignest…"
- **Names list** — each name's meaning now sits on its own line

### 📚 Bible Topics — Nave's Topical Bible (v29)
- **~5,300 topics** from Nave's Topical Bible (Orville J. Nave, 1896 — public domain; digitized by BibleData, CC BY 4.0) with over 59,000 references, each checked against the KJV text
- **Topic cards in Search** — search a subject (*forgiveness*, *prayer*, *tithing*, *the holy spirit*) or ask in plain words (*what does the Bible say about anger*) and a card for the topic appears above the verse results. A few modern words are mapped to Nave's terms (*worry* → Care, *gossip* → Talebearer, *generosity* → Liberality)
- **Search → Topics** — browse every topic A–Z or filter by name
- **Topic pages** — Nave's sub-topics as sections with the verse text; neighbouring verses read as one passage. Small topics open fully, big ones (*Jesus, the Christ* has 400+ sub-topics) start collapsed. "See …" links jump to related topics
- **Back works everywhere** — from a verse back to its topic, from one topic back to the last, and from a topic back to your search results, each at the same scroll position
- The topic data is saved on the device on first use, like the Bible books

### ✏️ Did You Mean…? (v29)
- When a search word never appears in the KJV, search suggests the closest real word — *beleive* → believe, *Nebuchadnezer* → Nebuchadnezzar, *thier sins* → their sins — and one tap searches it
- Uses the Concordance's word list, so names and KJV spellings are suggested too; words that name a topic (*worry*) aren't treated as typos

### 🔍 Smarter Search (v28)
- **Whole-word matching** with KJV word forms — *sin* finds sins, sinned, sinneth, sinful and sinner, but no longer "business" or "sing"; *love* finds loved, loveth, lovest and lovely
- If nothing matches as a whole word, search falls back to words that **begin with** what you typed, so a half-typed word still finds verses
- **Exact phrases** in quotes (*"god so loved"*) and **leave words out** with a minus (*love -god*)
- Queries made only of common words (*"it is finished"*) are searched as a phrase instead of being ignored
- Results sort by **Best match** or **Bible order** — the choice is remembered on each device
- Highlighting marks exactly the words that matched
- **Fixed:** page 2 and later now replace the list instead of piling up underneath it; 100 results per page
- **Fixed:** book chips now work on "closest matches" results instead of showing nothing
- Books load in parallel with a progress counter, so the first search is faster
- Switching Old/New Testament keeps Concordance and Names searches in exact-word mode

### 📖 Better Reference Search (v28)
- Understands **Rev. 22:21**, **1John 3:16**, **I John** / **First John**, and ranges across chapters like **John 3:16-4:2**
- Single-chapter books read **Jude 5** as verse 5 — this also restores five Jude verses that were missing from the Doctrines list
- Out-of-range references say so (*"Genesis has only 50 chapters"*) instead of quietly showing a different chapter

### 🏞️ Real Photo Scene Backgrounds (v27)
- Replaced the two weakest procedural scenes (ocean, mountains-gradient) with **real bundled photographs**: a golden-hour wildflower **Meadow** and soft **Misty Mountains** at dawn
- Added a **Calvary** scene (three crosses over Jerusalem) and an **Empty Tomb** scene
- **Calvary** and **Empty Tomb** are *orientation-aware*: portrait cards use a tall image, landscape cards use a wide one
- Final one-tap scene set: **Sunrise, Meadow, Misty Mountains, Calvary, Empty Tomb, Starry night** — plus upload-your-own
- Photos are compressed and precached for offline use, same as the Bible maps

### 🎨 Personalize Photo Verse Cards (v27)
- On cards that use **your own uploaded photo**:
  - **Pinch to zoom / drag to reposition** the image (mouse drag + scroll-wheel on desktop) — the crop always stays filled, no empty edges
  - **Vertical text position** — Top, Middle, or Bottom (portrait cards)
  - **Justification** — Left, Center, or Right
  - **Show/hide the church-logo watermark**
- These controls appear only when a photo is chosen; the gradient styles and bundled scenes are unchanged
- Text-placement and watermark choices are remembered; the crop resets for each new photo

### ↔️ Adjustable Reading Margins (v26)
- New **Margins** control under **Settings → Display** — **Wide**, **Normal**, or **Narrow**
- Adjusts the side spacing around the reading text; **Narrow** brings the text closer to the edges
- Defaults to **Normal** (the existing layout) — nothing changes unless you choose otherwise
- Saved and synced across devices like the other display settings

### 🖼️ Verse Image Cards on a Photo (v25)
- Verse cards can now use a **photo background** instead of only a solid color
- **Bundled scenic backgrounds** drawn in-app — Sunrise, Mountains, Ocean, Meadow, Starry night — no downloads, fully offline
- **📷 Upload your own photo** — the verse is laid over your image with an automatic darkening scrim so the text stays readable
- Works in both **Portrait (9:16, Stories/Reels/TikTok)** and **Landscape**
- Uploaded photos are read on-device only and are never sent anywhere
- Save or Share to socials with the existing card buttons

### 📅 Reading Plans (new tab)
- **Plans** added as a dedicated fourth bottom-navigation tab
- Three plans available: **Proverbs in a Month** (31 days), **New Testament in 30 Days**, **Bible in a Year** (365 days)
- Chapters auto-check off as you read them
- Today's reading card shows individual chapter pills — tap any to open directly
- Day auto-completes when all chapters are read; manual "Mark Day Complete" option also available
- Full scrollable day list with ✅ completed and 📖 today indicators
- Progress bar with percentage complete

### 📚 Reading Journey Checklist
- 66-book checklist at the bottom of the Plans tab
- Two-column grid — Old Testament and New Testament
- Tap any book to toggle ✅ read / ☐ unread
- Progress bar showing books completed
- **Reset button** — clears all 66 with one confirmed tap
- **Share My Reading Progress** — generates a portrait screenshot card of your full checklist for social media

### 🔥 Daily Reading Streak
- 🔥 flame badge in the header tracks consecutive days of reading
- Earns a point when opening a chapter, Romans Road verse, or Doctrine topic
- Tap badge to open streak info card with personal best and milestone display
- Milestone celebrations: 🥉 7 days, 🥈 30 days, 🥇 100 days, 🏆 365 days
- Each milestone celebrated once with a slide-in toast notification

### 🔍 Smart Search Engine (rebuilt)
- **Reference detection** — type `Matthew 24:24`, `Matt 24`, `1 Pet 3:21` to jump directly
- **AND keyword search** — `baptism saves` finds verses containing both words
- **Fuzzy suffix matching** — `saves` also finds `save`, `saveth`, `saved`
- **Stop word filtering** — common words ignored so keywords stay focused
- 150+ book name abbreviations
- Relevance-ranked results — exact phrase matches float to the top

### ⇄ Parallel Passages (chapter level)
- A gold chip strip appears below the chapter title when reading a chapter with known parallels
- Covers all Synoptic Gospel parallels and key OT parallels (Psalm 18/2 Samuel 22, Kings/Isaiah, Isaiah 2/Micah 4, etc.)
- Tap any chip to slide up the full parallel chapter without leaving current reading
- **Open in Reader** button to switch fully

### ✦ Verse Cross-References (OT → NT)
- ~90 curated OT quotation cross-references in the NT
- Small gold **✦** marker appears next to verse numbers where the NT quotes the OT
- Tap to see the OT source verse in a popup card with the verse text
- Multiple sources shown as selectable tabs (e.g. Mark 11:17 → Isaiah 56:7 and Jeremiah 7:11)
- Covers Messianic prophecy, Psalm 22 / Passion, Isaiah 53 / NT, Hebrews citations, Romans theology passages, 1 Peter, and more

### 📖 KJV Dictionary (built-in)
- 164 archaic KJV word definitions
- **Tap any word while reading** — if in the dictionary a definition card slides up instantly
- Covers animals (hart, hind, roe, coney), weights and measures (shekel, cubit, ephah), archaic vocabulary (froward, prevent, quick, let, conversation, charity, peculiar, meat), and theological terms (propitiation, reprobate, concupiscence, impute)
- Fuzzy suffix matching — tapping `holpen` finds `holp`, `waxed` finds `wax`
- Full searchable **Dictionary** tab in the Search screen (third tab)

### 📸 Screenshot Improvements
- **Orientation toggle** — switch between Landscape (wide) and Portrait/TikTok (9:16) formats
- **Portrait redesign** — church name at top, reference bold and prominent, verse text mathematically centred in remaining space, church logo as faded background watermark
- **Church logo** replaces the cross in all canvas backgrounds (verse cards, checklist card)
- **Share button** added to screenshot overlay — uses native share sheet to send image directly to WhatsApp, Messages, Instagram etc.
- Logo loaded asynchronously and used across all three card types (landscape, portrait, checklist)

### 📲 Tips & Help Sheet
- **?** button in the header opens a scrollable Tips sheet
- **Add to Home Screen** guide — detects iOS/Android/Desktop and shows platform-specific step-by-step instructions
- **Tips list** with matching emojis (word tap, ✦ markers, long press, screenshot, streak, reference search, parallel passages, Doctrines, Plans, Reading Journey)
- **⚠️ Cache warning** — clearly explains that clearing browser data deletes streaks, bookmarks, highlights, notes and plan progress
- Shows confirmation if already installed as a home screen app

### 📶 Offline Reading (optional download)
- In the Tips sheet, a **Download All 66 Books** button caches the full Bible text to the device using the Cache API (~3MB)
- Progress bar shows book-by-book download status
- Once cached, chapters open instantly with no internet connection
- `fetchBook` checks the device cache before making any network request
- **Clear cache** button to remove downloaded content
- Does not require a service worker — uses the standard Cache API

### 🏠 Home Screen Watermark
- Church logo sits fixed and centred behind the book grid on the Home screen
- Fades at 7% opacity — visible but never competes with content
- Does not scroll with the page
- Automatically hidden when navigating to other screens

### 🔗 Share Site Button
- **Share Site** button in the header (with icon) opens a QR code popup
- Branded QR code with church logo centred, orange dots, teal corner accents
- **Share Link** button uses native share sheet
- QR code verified scannable before embedding

---

## Improvements & Fixes

### Navigation
- **Cross-book chapter navigation** — Prev/Next buttons now cross book boundaries (last chapter of Ruth → 1 Samuel 1, first chapter shows last chapter of previous book)
- Only disabled at absolute start (Genesis 1) and absolute end (Revelation 22)
- **Floating chapter nav** — Prev/Next redesigned as floating pill buttons at bottom of screen rather than fixed bar at top
- **Back navigation** fully fixed for Doctrines, Dictionary, and parallel passage views — Android hardware back button and in-app back button both work correctly at every level

### Doctrine Browser
- **Repentance** — description corrected: metanoia = change of mind to believe, not turning from sins as a condition of salvation
- **All Have Sinned — Personal Accountability** — replaces "Depravity of Man"; reflects age of accountability, personal sin, Ezekiel 18:20, not inherited Calvinist guilt
- **Biblical Election — Chosen In Christ** — new topic added to Free Will & Election, drawn from Sunday school material; election as purpose/privilege, always "in him", never causation to believe
- **Once Saved, Always Saved — Salvation Cannot Be Lost** — renamed from "Rejecting Arminianism" to state the position positively
- **The Rapture** — Revelation 3:10 removed; Matthew 24:21–31 and Revelation 7:9–14 added as consecutive passage blocks
- **Consecutive verse display** — related verses from same chapter now render as one flowing passage block with superscript verse numbers rather than individual cards
- **Christian Living** category icon corrected (was accidentally set to Star of David ✡, restored to 🕊)
- Back navigation restored so returning from doctrine verse list correctly shows the doctrine category list

### Text & Readability
- **Contrast boost** — dark mode verse text brightened; light mode body text darkened; supporting text (`text-d`, `text-m`) lifted in both themes for improved legibility
- **Font size** — default bumped to 18px; Aa button now scales all text throughout the app (book names, search results, doctrine text, dictionary, saved verses, popups) not just verse text
- **Pinch-to-zoom** enabled on all screens (removed `user-scalable=no` from viewport)
- Streak count font changed from IM Fell English serif (where `1` was indistinguishable from `I`) to Inter sans-serif

### Copy & Share Format
- **New clipboard format** — `Isaiah 40:15\nVerse text` for single verses; `Isaiah 40:15–16\nFlowing text` for multiple verses — no verse numbers, no `(KJV)` tag, reference on first line

### iOS & Branding
- **Apple touch icon** — served as a real file (`apple-touch-icon.png`) rather than data URI; iOS now correctly uses the church logo for web clips instead of screenshotting the page
- **Icon padding** — church logo artwork padded so the teal ring is fully visible within Android's circular crop zone
- **Service worker removed** — eliminated the broken "Install App" Chrome flow; shortcut-based Add to Home Screen now works reliably
- **Header** — updated to show "✝ Faith Baptist Church" on all non-reader screens
- **Bottom nav** — "Books" label changed to "Home"

### Bug Fixes
- **Church dictionary notes (v31.01)** — new KJV notes for *baptism* and *baptize* (the ordinance: full immersion of one who has believed, in obedience to God — not sprinkling, not infants; Acts 8:36–38, Rom. 6:4), *elect* (those who have entered the election of grace by faith — not persons picked beforehand; Rom. 5:2, 11:5–6, 20, Matt. 24:22), *reprobation* (Rom. 1:24–28, 1 Tim. 4:2) and *predestination* (Rom. 8:29, Eph. 1:5); *election* revised to match. Each sits above Webster's 1828 text, and word forms find their note (*baptized* → baptize)
- **Note references all tappable (v31.01)** — "Rom. 5:2; 11:5–6, 20" now links every reference (the book and chapter carry over), and "S.S." links to the Song of Solomon
- **Faster, steadier loading (v28.01)** — Bible books are now saved on your device the first time they're read, and the rest download quietly in the background (a one-time ~5 MB, skipped when Data Saver is on). Searching and reading no longer re-download books every few minutes, and everything works offline afterward
- **Offline download fixed (v28.01)** — "Download All 66 Books" was skipping all the numbered books (1 Samuel – 3 John) and Song of Solomon, so it always reported a partial download. It now saves all 66
- **Doctrines Back button (v28.01)** — after opening a verse from a doctrine topic, Back returns to that topic where you left off instead of the closed-up Doctrines list; the list also remembers which categories were open and where you were scrolled
- `CH_COUNTS` array corrected — Jude was showing 22 chapters and Revelation was showing `undefined` (1 John was missing its 5-chapter count, shifting all subsequent books)
- Screenshot overlay `display:none` CSS rule restored after being accidentally dropped during a Python edit, fixing the overlay being permanently visible on the page

---

## Technical Notes
- Single HTML file — ~408 KB (up from 316 KB at v1.0)
- Offline Bible cache uses the Cache API (~3MB additional device storage when downloaded)
- All new features remain zero-dependency — no external libraries added

---

*"Thy word is a lamp unto my feet, and a light unto my path." — Psalm 119:105 (KJV)*
