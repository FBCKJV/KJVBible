# ✝ Faith Baptist Church — KJV Bible App
### Version 2.0 — May 2026
### Changelog since v1.0

---

## New Features

### 📍 Where Is This Taking Place? (v39)
- **A map of the Bible lands, drawn in the app**: a parchment-style map from Rome to Persia (coastlines, the Sea of Galilee, the Dead Sea, the Nile, Jordan, Euphrates and Tigris) built from Natural Earth's public-domain outlines (`bible-lands.json`, made by `tools/build-bible-lands.js`). No map service and no internet needed once it has loaded
- **Pins**: a gold pin for each place, labelled with the Bible name and today's name ("Bethel · today Beitin"); a dashed ring where the site is uncertain; places sharing one suggested site become one pin ("Baal-zephon & Pi-hahiroth"). Labels move left, right, above or below so they don't overlap
- **Zoom and pan**: pinch, scroll or + / − to zoom from the whole region down to a few miles; drag to move; ⌖ returns to the places. Old-atlas names (EGYPT, ASSYRIA, CANAAN, JUDAEA, GALILEE, The Great Sea…) appear at the zoom where they fit; zoomed in, the other Bible places nearby show as small dots. Tap a pin or dot for its name, kind and certainty, and **Open ›** for its place page
- **Three places to find it**: **📍 Where · N places** under the chapter title (all the places named in the chapter, with a chip for each to fly to it); **🗺️ Show on map** under "Places in this verse" in the verse card; and a map on every place page under "Where it was" (⤢ for full screen). The "Open in a map ↗" link stays

### ⚔️ Sword Drill, Rebuilt (v38)
- **Fixed:** the game screen's styles were lost in a June 24 upload — since then it showed default browser buttons and unstyled text. The game screen is restyled to match the app: the verse in large Crimson Pro, gold blank lines sized to each word, the current word highlighted, a slim progress bar
- **Four ways to practice**, each harder than the last: **📖 Learn** (read it, hide a quarter of the words at a time, tap a blank to peek), **🔤 First Letters** (type the first letter of each word), **🧩 Word Order** (tap the next word from six choices — no keyboard, good for children), **⚔ Full Recall** (type every word; finishing masters the verse as Challenge did). The last mode used is remembered
- **One input bar** stays above the keyboard; a word is accepted the moment it's right — no Enter, no keyboard closing and reopening between words. The game resizes to sit above the on-screen keyboard
- **💡 Hints** (Full Recall: one more letter of the word; First Letters: the word; Word Order: the right chip glows) and **mistakes** are counted; finishing gives **1–3 stars** with the time and best time; a wrong guess shakes gently (and buzzes on phones)
- **After a verse**: "Try Word Order ›" / "Try Full Recall ›" steps up a level; Full Recall shows the review date as before
- **Verse list**: a **▶ Practice next** card at the top (a review that's due, a verse started but not mastered, or the next new one); labels read new / practiced 2× / mastered
- Progress, mastery, badges, streaks and the review schedule are saved exactly as before (First Letters and Word Order count as Guided, Full Recall as Challenge)
- "Roman's Road" corrected to **Romans Road** (memory pack, badge and home card)

### ✦ Clearer Cross-References (v37)
- **Verse card**: the "Compare Scripture" chips are replaced by a plain **Cross-references** list — a "✦ Quoted in" / "✦ Quotes" row for the New Testament quotations, then up to four key words from the Treasury, each with its first three references as chips ("Rom 8:36", "Ps 79:2–3") and "+N"
- **Tap a reference to read it in the card** (tap again to close), with "Read in context ↗", "🔗 Its references" and "📝＋"; tap a word ("“killed” ›"), "+N" or **See all N ›** for the Compare page
- **✦ gems fixed**: each quoted verse now shows one gem (returning to the reader no longer added another each time), placed under the verse number so the verse text isn't pushed over, with a larger tap target so it opens the quotation instead of the verse card; chapters reached with Prev/Next now get their gems too, and the quoted books load in the background so the pop-up opens at once

### 🧭 A New Search Page (v36)
- **Search is now a hub**: under the search box, eight tiles open each study tool — Doctrines, Topics, Dictionary, Concordance, Names, Timeline, Maps, Hymns (the swipeable tab row is gone). The tiles hide while search results are showing and return when the box is cleared
- **Inside a tool**, a "‹ Search" bar with the tool's name leads back to the hub
- **Back works step by step**: from a result, back through each page you opened (a related topic, a person, a place…), then the tool's list, then the Search hub, then Home. Before, a plain Search entry re-showed the last tool, so Back seemed to skip straight to Home
- **Coming back to Search** from the bottom bar starts at the hub, with a "↩ Continue where you were" card (e.g. *Names › Abel*, *Doctrines › Eternal Security*, *Results for “grace”*); tapping Search while already in Search returns to the hub
- **Fixed:** topics that are only a "See …" pointer (*Abarim → See Nebo*) no longer show a stray "·" before "Nave's Topical Bible"

### 📝 Sermon & Study Notebook (v35)
- **📝 in the top bar** opens the active study over whatever screen you're on (Back or ✕ closes it and leaves you where you were)
- **Simple editing in one fixed font**: heading, bold, italic, bullet list, numbered outline with indent/outdent levels (Tab / Shift+Tab on a keyboard), quote box, plain text, undo/redo. Pasted text comes in as plain text so every study stays in the note font
- **📝＋ everywhere** adds to the end of the active study, with a toast to confirm:
  - the verse card ("📝 Add to Study") and **selected verses** as one passage ("Hebrews 9:12–14", verse numbers kept)
  - every verse card in Search — search results, topics, doctrines, Compare Scripture, Concordance, people and places
  - timeline events (date, title and key verse), hymns (title, author, first stanza and refrain), dictionary words (church note + Webster's first sense), people, places, Nave's topics, doctrines, the Compare Scripture verse, and maps
- **Verse quotes keep a tappable reference** — tap it to read the verse in the reader
- **☰ Studies**: keep many studies; switch, start a new one, delete (with confirmation); **share as text** (outline numbers, bullets and quotes kept, with references), **copy**, or **print / save as PDF** on a clean page with the church name and date
- Studies save on the device as you type and are included in the backup/sync (`kjv_studies`); everything is cleaned to the allowed formatting on save
- On narrow phones the reader's Select and All buttons show as icons so the header fits
- Tips sheet explains the notebook

### 🎵 The Hymnal, ⭐ First Mention, 🔗 Follow the Thread (v34)
- **Hymnal** — a new **Search → Hymns** tab with 98 hymns whose words are public domain (written before 1928), in nine sections from *Praise and Worship* to *Christmas and Easter*. Each hymn page shows the author and year, the Scriptures behind it (tappable), every stanza numbered, and the refrain
- Find a hymn by title, author, or any line of the words ("sinking sand" → *The Solid Rock*)
- Chosen from the hymns sung in Independent Baptist churches. Left out on purpose: texts still under copyright (*How Great Thou Art*, *Victory in Jesus*), Catholic-origin texts (*Silent Night*, *O Come All Ye Faithful*, *Faith of Our Fathers*), Unitarian authors, and sinless-perfection texts (*Love Divine*); *Standing on the Promises* omits the "perfect, present cleansing" stanza, as Baptist hymnals do
- Words gathered from open collections (marvinjude/gospel-hymns, josmithua/song-data, pathawks/Christmas-Songs) and proofread against standard hymnals — typos fixed, garbled and missing stanzas restored. The words live in `tools/hymns/texts.json`, the list in `tools/hymns/list.js`; `tools/build-hymns.js` checks every Scripture reference against the KJV text
- **First mention** — the Concordance marks the first verse a word appears in ("⭐ First mention"), and Dictionary word pages show "First mention in Scripture: Genesis 6:8 · used in 159 verses"
- **Follow the thread** — verse cards on a Compare Scripture page have a "🔗 Compare" button that opens that verse's own references (Back steps back through the thread); a verse the Treasury doesn't cover says so
- **Search tabs** sit in one swipeable row (nine tabs no longer wrap into three rows), and the chosen tab scrolls into view
- The filter boxes on the Dictionary, Topics, Concordance, Names and Hymns tabs now share the main search box's style

### 🔗 Compare Scripture, 📅 Bible Timeline, 📜 Concordance Verses (v33)
- **Treasury of Scripture Knowledge** (1830s, public domain) — **305,906 cross-references** in 63,663 phrase groups, each tied to the KJV words it explains, from the CrossReferences.org KJV export (CC BY 4.0). Every reference was checked against the app's KJV text by `tools/build-treasury.js`; one file per book in `treasury/`, loaded and saved on the device on first use
- **Verse card**: "Compare Scripture · N references" lists the verse's phrases ("the beginning", "the Word"); tapping one opens a **Compare Scripture** page with the verse (phrases marked) and each phrase's passages as cards (Back returns to the reader)
- The hand-typed ✦ markers for New Testament quotations of the Old stay in the reader
- **Bible Timeline** — a new **Search → Timeline** tab: 95 events in nine eras from the Creation to the Revelation, each with its key verse quoted from the app's own KJV text. Dates follow Archbishop Ussher's chronology (1650), as in the margins of older KJV reference Bibles, and are marked approximate. Edit `tools/timeline/events.js` and run `tools/build-timeline.js`
- **Reader**: a chapter with a timeline event shows a "📅 About 1491 B.C." button beside the map button; it opens the timeline at that event (Back returns to the chapter)
- **Concordance verses** — tapping a word opens its verses in place, grouped by book with the word marked (40 at first, then 80 more at a time), with "Open in Search ↗"; Back from a verse reopens the word. The verse count matches the concordance figure exactly
- The verse card now scrolls when it's taller than the screen

### 📍 Bible Places (v32)
- **~1,200 places named in the KJV** join **Search → Names**, from the OpenBible.info Bible Geocoding Data (CC BY 4.0) — plain geography drawn from over seventy atlases and reference works, with no commentary. Easton's Bible Dictionary was considered and set aside on doctrinal grounds
- **Place pages**: the modern site (Bethel → Beitin) with how sure scholars are (Confident · Likely · Possible · Uncertain), any other suggested sites, the distance and direction from Jerusalem ("about 10 miles north"), coordinates with a map link, nearby Bible places (Capernaum → Chorazin, Bethsaida, Sea of Galilee), Hitchcock's name meaning, and every verse that names it
- Only verses where the KJV itself names the place are used, and each place shows the KJV's own spelling (Ai, also spelled Hai)
- Names shared by people and places (Abdon: four men and a town) show both on one name page; searching a place's name shows a 📍 card
- **Verse card**: "Places in this verse" — tap one to open it (Back returns to the reader); chips use the verse's own spelling
- Names filter ignores hyphens ("bethel" finds Hitchcock's "Beth-el"), and names show the KJV spelling

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
- **Full verse on the verse card (v38.02)** — long verses were cut off in a 120px box with its own scrollbar (e.g. Genesis 12:8, Psalm 44:22); the whole verse now shows, and the card itself scrolls when it is taller than the screen
- **Sword Drill polish (v38.01)** — a 💡 hint in Full Recall now shows its letters inside the blank, on the line, instead of under a strike-through underline; inside a verse the top-left button reads “‹ Verses” and the ✕ Close (which left the game for Home) is hidden until you're back on the verse list
- **What's New wording (v36.01)** — the v34 *Follow the Thread* item no longer mentions the swipeable tab row that v36 replaced with the Search hub
- **Nine more hymns (v34.01)** — *Softly and Tenderly*, *Jesus Paid It All*, *Whosoever Will*, *Bringing in the Sheaves*, *Jesus Saves*, *Wonderful Words of Life*, *Holy Bible, Book Divine*, *Shall We Gather at the River?* and *Christ the Lord Is Risen Today* — the hymnal now has 98. Seven came from lindsaysperring/GetHymnLyrics (an Adventist hymnal) and were restored to the standard wording (*Jesus Paid It All*: “Jesus died my soul to save, my lips shall still repeat”; *Softly and Tenderly*: all four stanzas)
- **What's New complete (v32.01)** — the pop-up now lists every feature from versions 28–32, newest first, including the church dictionary notes (baptism, the elect, predestination) and the fixed "Download All 66 Books"
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
