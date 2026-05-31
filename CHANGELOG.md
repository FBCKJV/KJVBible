# ✝ Faith Baptist Church — KJV Bible App
### Version 2.0 — May 2026
### Changelog since v1.0

---

## New Features

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
- `CH_COUNTS` array corrected — Jude was showing 22 chapters and Revelation was showing `undefined` (1 John was missing its 5-chapter count, shifting all subsequent books)
- Screenshot overlay `display:none` CSS rule restored after being accidentally dropped during a Python edit, fixing the overlay being permanently visible on the page

---

## Technical Notes
- Single HTML file — ~408 KB (up from 316 KB at v1.0)
- Offline Bible cache uses the Cache API (~3MB additional device storage when downloaded)
- All new features remain zero-dependency — no external libraries added

---

*"Thy word is a lamp unto my feet, and a light unto my path." — Psalm 119:105 (KJV)*
