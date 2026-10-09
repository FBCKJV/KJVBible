# ✝ Faith Baptist Church — KJV Bible App
### Version 2.0 — May 2026
### Changelog since v1.0

---

## New Features

### 🎵 224 Hymns of the Faith (v61)
- **Search → Hymns grows from 98 to 224 hymns**: more of the old gospel hymns (*Hiding in Thee*, *Be Not Dismayed Whate'er Betide*, *Beulah Land*, *In the Garden*, *Brighten the Corner Where You Are*), the great hymns of the church (*A Mighty Fortress Is Our God*, *Abide with Me*, *The Church's One Foundation*, *Immortal, Invisible*, *And Can It Be?*, *How Firm a Foundation*) and the Christmas carols (*Silent Night*, *O Come, All Ye Faithful*, *The First Noel*, *What Child Is This?*, *We Three Kings*), each with every stanza, its refrain and the Scriptures behind it (every reference checked against the KJV text)
- **Only public-domain words**: every new hymn's words were published before 1928. Modern worship songs and anything still under copyright were left out on purpose, as were Marian hymns and the Coptic saints' songs found in the same collections. Christmas carols of older Catholic origin are included, since their words are about the Lord's birth
- **The hymns you already know have not moved**: a hymn is opened by its number in notes and shared links, so the 98 keep theirs and the new ones follow. The list gathers them under the same nine sections
- Sources (all open): h1rdr3v2/open-hymnal-json, josmithua/song-data (Believers Hymn Book, Sacred Songs for Singing Saints), pathawks/Christmas-Songs (CC0) and michaelfarah27/HymnsXMLFiles, each hymn's source noted in tools/hymns/texts.json. Authors and years were set by hand (the open files have few); the words are lightly cleaned of typing slips and are worth a proofreading beside a hymnal
- Tips & Help, the Hymns tool's tip and What's New say 224

### 🧭 Any Pace, Listening Counts, Share a Link (v60)
- **🧭 Make your own plan: any pace**. Under the 1–5 buttons, **More chapters a day, or finish in so many days** takes any number of chapters a day (the New Testament at 9 a day), or a number of days to finish in, and the chapters are spread evenly over them (the whole Bible in 182 days is 6–7 a day; the Old Testament in 31 days is 29–30). The plan stores its days as custom.days beside per, so an older copy of the app still reads it (at per a day)
- **Listening counts as reading**: a chapter heard through on the Scourby audio Bible, in Chapter Play (auto-play included) or Book Play, counts just as one read to its end: the calendar, the 🔥 streak, the book in the Reading Journey and every plan it is in, whether or not the page was scrolled. Only time really listened counts: skips and drags along the bar are jumps, and at least half the chapter must be heard (unless Chapter Play took up where it left off)
- **Share a link to a chapter or verses**: **Share** on the verse card now sends the verse with a link that opens the app on it. Several verses chosen together are shared with a link that opens on them all lit up (#John+3:3-5,8); with every verse selected (Select All) it links to the whole chapter (#Ephesians+2). Someone opening the app for the first time from a link sees the verses first: the welcome waits until they leave the chapter, and a note says to read on with Next
- **Home at the top of a chapter**: the button beside the book's name read as “← Ephesians” but went Home; it now says **⌂ Home**
- Tips & Help, the reader's and the plans' first-use hints, and What's New mention them

### 🎧 Hear Every Psalm Sung (v59)
- **🎧 Sung on a Psalm**: under the chapter title of any Psalm, **🎧 Sung** opens the FBC Hymns app (fbckjv.app/Hymns/?psalm=23) on that Psalm, sung word for word from the King James Bible with the verses to follow. A long Psalm that is recorded in parts (119) opens at the first part with the others listed beneath. Other books show nothing new
- Tips & Help and the reader's tips mention it

### 🎧 Hear the Hymns Sung (v58)
- **🎧 Listen on a hymn**: in Search → Hymns, 39 of the 98 hymns have a recording in the FBC Hymns app (fbckjv.app/Hymns/) — marked 🎧 in the list. **🎧 Listen** on the hymn's page opens it there, playing, with the words to follow
- **The Hymns app leads back to the Word**: it now reads this app's hymn words and Scriptures, so its lyrics show **📖** buttons that open the verses behind each hymn here, and every Sung Psalm shows its verses from this app's KJV text
- New build script **tools/build-hymn-recordings.js** reads the Hymns app's song list (a Hymns checkout beside this one) and writes tools/hymns/recordings.json (hymnal title → song); **build-hymns.js** adds the song as an 8th field in hymns.json, which older copies of the app simply ignore. Congregational recordings are preferred, then piano, then specials

### 💾 A Backup File of Your Own (v57)
- **⚙ Settings → 💾 Save a backup file**: everything the restore code backs up — studies, My Verses lists, highlights and their colour names, notes, plans, the reading log, badges, the streak, Sword Drill and settings — in one file named for the day (FBC-KJV-backup-2026-10-07). On a phone the share sheet opens, so it can go to Google Drive, iCloud Drive, Files or an email; on a computer it downloads. (Chrome on Android shares it as .txt, the same content.) No account or sign-in
- **📂 Restore from a file**: says what the file holds (“12 studies, 4 lists, 230 highlights…”) and asks first; it is merged in item by item like a sync, so nothing on the phone is removed and anything changed there since is kept. Then it is backed up and the app reloads
- Settings shows when this phone last saved a file. When the backup nears or passes its size limit, the card offers **Save a file**
- Tips & Help: a row for the backup file, and the Important note suggests saving one now and then

### 🔤 Hebrew & Greek — Strong's (v56)
- **Every word of the KJV tied to its Hebrew or Greek word** by James Strong's numbers (1890): 8,674 Hebrew and 5,523 Greek words, and 94% of the words in the text (the rest are mostly the translators' italic words, which have no original behind them)
- **On the verse card**: a fold at the bottom, **🔤 Hebrew words · Strong's** (Greek in the New Testament), lists the verse's words — *In the beginning* H7225, *God* H430, *created* H1254 … Tap one for the original word, how to say it, its meaning and how the KJV renders it, then **Full entry · every verse ›**. The fold stays open or closed as you left it (per device), so a reader who never opens it never sees more than one quiet line
- **A word's page**: the Hebrew or Greek in large type, the transliteration and how to say it, Strong's definition, the word it comes from (each number a link to its own page), Strong's list of KJV renderings, and **every verse** it is in with its English in bold — 30 at a time, each tapping through to the chapter. **First in** names its first mention. The renderings counted in the text (*mercy 135 · kindness 38 · lovingkindness 25*) are chips: tap one to see only the verses where the translators chose that word. **📝＋ Add to Study**, **📤 Share** (with a link that opens the page) and **📖 … in Webster's 1828**
- **Search → Hebrew & Greek**: search by English word (the words the KJV renders by it, most used first), by the Hebrew or Greek word itself (*chesed*, *agape*), or by number (*H2617*, *G26*); Both / Hebrew · OT / Greek · NT; with nothing typed, 26 words worth knowing. Recent searches are kept like the other tools
- **Search**: typing a number (*G26*) gives a row that opens it, and a single word (*mercy*) adds **Hebrew & Greek — “mercy”** to *In the study tools*. A Dictionary word has **🔤 The Hebrew & Greek behind “grace” ›**
- New build script **tools/build-strongs.js**: lines the CrossWire KJV's tags up with the app's own text (word by word by their letters; the ~180 verses spelled differently, such as *Adonizedec* / *Adoni–zedek*, matched word by word) and writes strongs/v/ (each book's verses), strongs/H.json and G.json (the word lists) and strongs/H0.json … (the entries, 500 to a file). Each loads on first use and is kept on the device. Sources in tools/strongs/ (public domain)

### 🎤 Say It Aloud (v55)
- **🎤 in Sword Drill**: in First Letters and Full Recall, tap 🎤 beside the box and say the verse — the phone's speech recognition keeps listening (it restarts itself when it pauses), and each word you say that matches the next word fills in. It is forgiving: the recognizer's modern English counts (“has” for hath, “you” for ye, “in treat” for Intreat, a word a letter or two off, numbers), a small word it drops is filled in, and a word it mishears is passed over — never a mistake. It stops at the end, on 🎤, Back, or when the app is put away. Works where the browser supports speech (Chrome on Android; Safari on iPhone with dictation on)
- **No more false mistakes from the space bar** in Full Recall: a phone keyboard that hands back the word just accepted when you press space (or its space alone) is ignored; a real wrong word followed by space still counts
- **Finishing a book is celebrated**: when the last unread chapter of a book is read to the end, a “Ruth — read through! · 12 of 66 books” card and confetti, and it is ticked off in your Reading Journey (the first time only); any badge earned with it follows after
- **✓ on chapters you have read** in each book's chapter list, with “3 of 4 chapters read”
- **✓ Mark chapters I read before**: for reading done before the app counted it (or in a printed Bible) — tap the chapters to mark them. They count toward books, the Reading Journey and badges, but not the calendar's days; finishing a book this way is celebrated too

### 🧭 Make Your Own Plan (v54)
- **🧭 Make your own plan** (Plans page, under Add a plan): choose what to read — The Gospels, Psalms, Proverbs, Paul's letters, The Law, The Prophets, the New or Old Testament, the whole Bible, or any books one by one — and 1 to 5 chapters a day. It shows the size as you choose (“89 chapters · 45 days at 2 a day”), names itself (or give it your own name), and then works like every plan: your own pace, chapters count when read to the end, Mark read, the end-of-chapter bar, Home, the reminder, Start over, Read again. It syncs with the plan it belongs to. Finishing one earns the **🧭 Your Own Plan** badge
- **🖍 Highlight several verses at once**: on the long-press bar (Select All · Screenshot · Copy All · Share / Save · Highlight · Sword Drill · Study), pick a colour by its name — or take highlights off — with Undo
- **⚔️ Sword Drill one verse at a time from a list**: each verse or passage in a My Verses list has **⚔️ Drill** (beside **📸 Card**); the whole-list Drill button is gone. A verse over 50 words asks first (“Esther 8:9 is a long one — 90 words. Memorize it anyway?”) — selected verses too
- **Undo**: removing a highlight, a note, a verse from a list, a whole list or a study shows “Removed … · Undo” for a few seconds
- **Badges keep their real dates**: badges earned before v54 now show the day they were really reached (from your reading days, or the day a plan was finished), not the day they were first counted
- A list's verses show their buttons in a row under the verse (↑ ↓ · 📸 Card · ⚔️ Drill · ✕)

### 🖍 Colours with Meaning & a Daily Reminder (v53)
- **Name your highlight colours**: ✏️ beside the colours in the verse card opens a sheet to give each a meaning — your own words, or a tap on an idea (Promises · Commands · Salvation · Prayer, or Father · Christ · Spirit · Grace). The names show under the colours, a highlight in a named colour says so (“Psalms 23:1 · Promises”), and the names travel with the restore code
- **Notes → Highlights by colour**: a chip for each colour with its name and count — pick one to see only those verses, each card showing its colour's name. **🔖 Save Promises as a list** puts that colour's verses into My Verses (in Bible order), ready to share, present, drill or put in a study. **✏️ Name / Rename colours** is there too
- **🔔 A daily reading reminder — only if you ask for it.** Starting a plan offers it once (“Would you like a reminder?” · Morning 7 am · Midday noon · Evening 7 pm · No thanks); after that it is on the Plans page under your plans (“🔔 Remind me to read each day” / “Daily reminder: Evening · 7 pm”), where it can be changed or turned off. The note names your next reading (“Next in your reading plan: Proverbs 5 · Matthew 23”) and opens the Plans page. It is per device, uses the same notifications as the Verse of the Day (on iPhone, the app must be added to the Home Screen), and keeps up as you read
- New workflow **plan-nudge.yml** sends the reminders each day through OneSignal to just the devices that chose a time, delivered at that hour in each person's own timezone

### 🏅 Days in the Word (v52)
- **A calendar of the days you read** in the 🔥 streak panel: each day is shaded by how many chapters you read (one, two or three, four or more), today is ringed, ‹ › step through the months, and a month's total is underneath. **Tap a day** to see the chapters you read and tap one to open it
- **Every chapter counts** once you have read to the end of it (at least 20 seconds on it) — the rule the plans use — whether or not it is in a plan. ✓ Mark read on a plan counts its chapters too. Your plans' dated progress fills in the calendar's past
- **16 badges**: First Chapter, 10 / 50 / 100 / 500 chapters, A Whole Book, The Four Gospels, Paul's Epistles, the New Testament, the Whole Bible, 30 / 100 / 365 days in the Word, and one for each plan finished. Each shows its progress (“36 / 50”) or the date it was earned, and a new one is celebrated when you earn it. Badges already reached by past reading are awarded quietly
- **A book you read right through is ticked off in your Reading Journey** for you (books already read through are ticked when you update)
- The streak panel shows **chapters read** beside current, longest and books; the Plans page opens it with **🔥 Your reading calendar & badges**
- The reading log and badges sync between devices, day by day
- **The Verse of the Day is clean again**: the Save / Drill / Card buttons from v51 are removed — tap the verse to open it, where every tool is

### 🔁 Everything Leads Somewhere (v51)
- **Selected verses → ⚔️ Sword Drill**: long-press, pick verses, tap **Sword Drill** — they go into Custom Verses (verses side by side as one passage, up to 6 verses) and Sword Drill opens
- **The long-press bar is back in its old order**: Select All · Screenshot · **Copy All** · Share across the top, then Save · Sword Drill · **Study** (moved to the end)
- **A My Verses list → ⚔️ Drill** puts its verses in Custom Verses (a passage longer than 6 verses is left out, and the toast says so), and **📸** on each verse or passage opens the verse card designer with it
- **✍️ Reading Journal**: at the end of every chapter, “Write about Proverbs 5 in your Reading Journal” opens a study called Reading Journal with today's date and the chapter (tap it to read it again), the cursor ready for your thoughts. Present it, share it or print it like any study
- **CLAUDE.md**: the app's vision — everything leads back to the Word, and every way of using it (reading, plans, Sword Drill, studies and sermons) gets the same care — and the test every new feature must pass

### 💡 Help as You Go (v50)
- **Hints the first time you reach a feature** — one short, friendly card in large, plain type, shown once and never again: Home, reading a chapter (tap a verse; press and hold to pick several), the verse card (highlight, 🔖 Save to a list, Note), Reading Plans, Notes, the Study Notebook, Search and Sword Drill. **👉 Show me** dims the screen and rings the button it means; **Got it**, or a tap anywhere, puts it away (and the tap still does what you tapped)
- Never in the way: one hint at a time, at least a few seconds apart, and never over the welcome screen, What's New, the tour or a question. Seeing a hint also counts as opening that tool's **?**, so its gold dot goes
- **A welcome tour for new people** — four swipeable cards straight after the welcome screen (Read God's Word · Look things up · Read every day · Keep what you find), with **Skip** always there. Anyone updating sees What's New instead, then the hints
- **⚙ Settings → Help as you go**: Helpful hints **On / Off**, **Show the welcome tour**, **Show all hints again** — handy when helping someone set up their phone. **Tips & Help** opens with **Take the welcome tour**. Hints seen and the on/off choice travel with the restore code

### 🔖 My Verses (v49)
- **Bookmarks become lists you name.** Tap a verse, then **🔖 Save** (it was Bookmark): a sheet lists your lists with a tick by each one the verse is in; tap to add or take it out, or type a name for a new list. A verse can be in any number of lists, and the button shows how many (“In 2 lists”)
- **Passages**: long-press to select verses, then **Save** — verses next to each other are kept as one passage (John 10:27–29) with each verse's number
- **Notes → My Verses** (the first list, where Bookmarks was): every list with its count and first references, ＋ New list, and search across names and verses. Open a list to read its verses in full; **↑ ↓** put them in your order, **⇅ Bible order** sorts them; **✏️** renames; **📤 Share** sends the list as text; **🎦 Present** shows it as slides (its name, then each verse); **📝＋ Study** adds it to the open study; **🗑 Delete this list**. Back returns to the lists
- **In the 📝 Study Notebook: 🔖 Insert from My Verses** (first button in the toolbar): pick a list, then tap a verse or passage and it goes into the study right after the paragraph your cursor is in — or **Insert all** for the whole list under its name. Each one is a verse slide when you present. So a verse goes from your reading, to a list, to a study, to the screen, and a tap on its reference brings you back to it in your Bible
- **From a doctrine page**: **🔖 Save to My Verses** saves its verses as a list with the doctrine's name, ready for your own verses to be added
- Your **bookmarks move into a list called “Bookmarks”** — nothing is lost. Lists sync between devices like the other notes, and Home's Notes card counts them
- **Highlights now show their verse.** The Highlights list showed “…” for a verse that was not also bookmarked; it now looks the verse up
- Sword Drill's own list of verses to memorize is renamed **Custom Verses** (it was My Verses), so the two are not confused

### 🏠 A Tidier Home & a Notes Tab (v48)
- **One card style on Home**: Continue Reading, Verse of the Day, the Romans Road, the Old and New Testament, and the new cards below them all match. An arrow that turns folds a card open; **›** goes to its page. The Old and New Testament are one lean line each (the name and the number of books) that fold open to the books, as before
- **Search & Study Tools on Home**: the search box is always showing — type and search without leaving Home. Open the card for all eight tools (Doctrines, Topics, Dictionary, Concordance, Names, Timeline, Maps, Hymns), each one tap away, and **Open Search ›**
- **Reading Plans on Home**: folded, it shows what is next in each running plan (“Next: Proverbs 5 · Matthew 23”); open, each plan with its progress ring, its next reading and **Read**. With no plan running it is one line that goes to Plans. (It replaces the “Your Reading” card from v47 and now sits below the search card)
- **Notes on Home**: folded, your latest study; open, how many bookmarks, highlights, notes and studies you have (each goes straight to that list) and your two most recent studies
- **Sword Drill** keeps its card at the bottom, now with the ⚔ name, and its count of verses due stays current
- **The Saved tab is now Notes**, with a fourth list, **Studies**: every study from the 📝 notebook, newest first, with its date and how many verses it quotes — tap to open it, ＋ New study, ✕ to delete. The search box looks through studies too
- Home remembers which of its cards you left open (on this device)

### 📅 Reading Plans, Your Way (v47)
- **More than one plan at a time** — run Proverbs in a Month, the New Testament in 30 Days and Bible in a Year side by side, each keeping its own place. Each running plan is a card with a progress ring, its next reading (“Day 4 — Proverbs 4”), **📖 Read** for the next chapter and **✓ Mark read** for a day read from a printed Bible or listened to. **All days** opens a grid of the plan's days (read days filled, part-read days half filled, the next one ringed); tap a day for its reading, the date it was read, Read and Mark read
- **A chapter counts when it has been read** — opening a chapter (or tapping past it) no longer checks it off; it counts once you have reached the end of it, after at least 20 seconds on it. Reading straight on into the next day's chapters counts too, but dipping into a chapter far ahead (Proverbs 20 on day 4) does not. A day that was read ahead now checks off as soon as its last chapter is read
- **The end of each plan chapter** shows the plan, whether the chapter (or the day) is read, and a button for the next chapter — “Next: Matthew 2 ›” or “Day 5: Proverbs 5 ›”
- **Your reading on Home** — under Continue Reading, a card with each running plan's ring and next reading; tap to read it
- **⋯ on each plan**: **Pause** (keeps your place, off Home until you resume), **Start over** and **Remove**, asked in the app's own sheet instead of the browser's “fbckjv.app says” box. “Change Plan”, which threw your progress away to choose another, is gone — add a plan instead
- **Finished plans** are kept under Finished with the dates read and how many days it took, with **Read again**. The plan you had running carries over with its progress
- **The app's own question sheet** also replaces the browser box for deleting a study, clearing the Reading Journey and removing the downloaded Bible
- Plans sync item by item like the bookmarks: progress made on two devices is added together

### 🎞️ Teach From Your Study (v46)
- **🎦 Present a study as slides** (new button in the Study Notebook's top bar): the study's name is the title slide; each heading starts a slide, with its points, lists and quote boxes beneath it (a long run continues on the next slide); every verse added with 📝＋ gets its own large verse slide with its reference. Step with the space bar, arrows, a tap, a swipe or a clicker; all the Present settings apply (A− / A+, Classroom, the four themes, Clicker only)
- **✂ Slide break** in the notebook toolbar starts a new slide wherever you put it (shown as a dashed "new slide" line in the study)
- **Pasting a lesson** (for example from a web page or another app) now keeps its headings, lists, quote boxes, bold and italic — any heading level becomes a study heading; colours, fonts, tables, images and scripts are left out
- **🔎 Go to a verse** while presenting (or press /): type "Rom 8:28" or "Psalm 23" and it jumps there; when you came from a study, **↩ Lesson** returns to the slide you were on
- **🎦 Present a journey**: from a journey's stop card — the map fills the top of the screen with the route, and the stop, what happened and its verse fill the bottom in large type; space / arrows / clicker step through the stops, Esc or ✕ Exit returns

### 🗂️ Two-Column Search on Big Screens (v45)
- **List and page side by side** (1100px and wider): in **Topics, Names (people and places), the Dictionary and Hymns**, the list stays on the left (scrolling on its own) and a topic, person, place, word or hymn opens on the right; before one is chosen the right side says what to tap. Back steps through pages as before; turning a tablet to portrait goes back to one column
- **Search page**: tool tiles in a row of four; **search results** in two columns of verse cards
- **Map explorer**: the place card ("What happened here") beside the map instead of below it; **journeys** listed three across
- **Timeline** in two columns; **concordance** words in columns (a word's verses open full width beneath it)
- **Saved** bookmarks, highlights and notes in two columns; **Plans** kept to a readable width
- Phones are unchanged

### 📽 Classroom Present & Resizable Panels (v44)
- **📽 Classroom preset** in Present mode: one verse at a time, never smaller than a back row can read (6.5% of the screen height); a verse too long for that runs onto a second screen ("Esther 8:9 (1 of 2)") instead of shrinking — the arrows and clicker step through the screens, and going back lands on a long verse's last screen
- **Projector themes**: the ◐ button now cycles Dark, Light, **High contrast** (white on black, heavier type, yellow reference) and **High contrast light** (black on white)
- **🖱 Clicker only**: hides the buttons entirely — step with a clicker, keyboard or tap; touch or move near the bottom edge to bring them back
- **Present settings travel with the restore code** (text size, verses per screen, theme, Classroom, Clicker only — `kjv_pres` is now synced)
- **Resizable panels on wide screens**: drag the edge of the verse card, Study Notebook, Where map or a journey's stop column to make it wider or narrower; double-tap the edge to reset. The chapter always keeps at least 480px. Widths are remembered per device (`kjv_panes`, deliberately not synced — a width for a big monitor would not suit a tablet)
- Phones are unchanged

### 🖥️ Tablets and Big Screens (v43)
- **Side by side on wide screens** (1100px and wider — an iPad in landscape, a laptop, a classroom panel): the **verse card** opens as a panel on the right with the chapter still readable on the left (tap another verse and the card changes); **📍 Where** maps open on the right half; the **Study Notebook** opens on the right with the chapter beside it — and a verse card then rises over the chapter, so the notebook stays in view
- **Journeys**: the map on the left, the stop card in a column on the right
- **Map explorer**: a taller map
- **Larger touch targets** on big touch screens (chapter buttons, verse-card buttons, chips, journey buttons, map zoom)
- **Back closes the newest card first** when several are open side by side
- Phones are unchanged

### 🎦 Present Mode (v42)
- **Scripture on the big screen** for a projector, TV or classroom panel: opens full screen from **🎦 Present** under a chapter title (from verse 1, or the first selected verse) or in the verse card (from that verse)
- **As large as the screen allows**: the text is sized to fill the screen; **A− / A+** adjust it; **1 / 2 / 3 verses** at a time with verse numbers
- **Step on** with the ‹ › buttons, a tap on the right or left of the screen, a swipe, the keyboard (→ ← space, Enter) or a presentation clicker (Page Up / Page Down) — on through chapters and into the next book
- **◐ light page** for bright rooms (black on white); the controls fade after a few seconds and return on any touch; ⛶ full screen; ✕, Esc or Back closes. Text size, verses per screen and light/dark are remembered

### 🧭 Bible Journeys (v41)
- **Eighteen journeys** (`journeys.json`, built by `tools/journeys/build.py` from the approved stop list in `tools/journeys/draft.py`): Abraham; Jacob; Joseph sold into Egypt; the Exodus & the wilderness; David fleeing Saul; Elijah; Jonah; carried away to Babylon; the return from captivity; the birth and childhood of Jesus; Jesus' ministry; the last week & the resurrection; Saul's conversion; Philip and Peter; Paul's first, second and third journeys; Paul's voyage to Rome — 196 stops
- **Every stop is a verse that names the place**, checked against the places data when built. Conventional sites throughout (the southern Exodus route, Mount Sinai at Jebel Musa, mount Hor at Jebel Harun, the crossing at the head of the Gulf of Suez); uncertain sites and the lines to them are dashed. The sermon on the mount is shown at the traditional Mount of Beatitudes (dashed); the transfiguration's "high mountain apart" shows both suggested sites, Hermon and Tabor, as dotted references. Routes follow the Euphrates and the coasts where travellers went (under Cyprus and Crete on the voyage to Rome); a dotted arrow points from Joppa "toward Tarshish"
- **The journey player**: the route on the parchment map with numbered stops (tap one to go there); a card with the stop, what happened, the verse itself, **‹ Back**, **Read ›** and **Next stop ›** — the route draws on as you go
- **Text, timeline and map lead to one another**: under a chapter title, **🧭 Paul's second journey** opens the journey at that chapter's stop (📍 Where also lists it); each stop's **📅 About A.D. 52 ›** opens the timeline at its event (dates come from the timeline, so they always agree); on the timeline, events a journey belongs to have **🧭**, and every event has **📍** to show its places on the map
- **Search → Maps**: a 🧭 Journeys list (Old and New Testament) between the map explorer and the classic maps; a place's card and its place page list the journeys passing through it ("Bethel — Abraham's journey · stop 4")
- **Timeline**: new event "David flees from Saul" (1062 B.C., 1 Samuel 19–27)

### 🗺️ What Happened Here? (v40)
- **Search → Maps is now a map explorer**: the parchment map of the Bible lands with every place that has a suggested site, opening on the land of Israel. Zoomed out, the most-named places show; zoom in and more appear, with names wherever they fit (Jerusalem, Samaria, Tyre… in bold first; regions are hollow rings, since the atlas names already label them)
- **Find a place**: type in the box ("beth") for the best matches — exact names first, then the most-named (Bethel, Bethlehem, Bethany…)
- **What happened here**: tap a place for its card — today's name, kind, how sure the site is, verse count — and its chapters grouped by part of the Bible (Creation & the patriarchs, The Exodus & the wilderness, The conquest & the judges, The kings, Exile & return, Poetry & wisdom, The prophets, The Gospels, The early church, The letters & Revelation). Open a group for the verses themselves (ten at a time, "Show all"); **Place page ›** opens the full place page, and Back returns to the map as you left it
- **Classic maps** — the ten 19th-century atlas plates — now sit below the explorer as "📜 Classic maps"
- **Reader**: the 📍 Where button takes the place of the classic-map button; when a classic plate covers the chapter, the live map shows "📜 Classic map: … ›" under its title. Chapters with a plate but no mapped places still show the plate's button
- Map labels no longer pile up: atlas names step aside for pins, and town names avoid both

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
- **Offline, a script or data file is no longer answered with the app's page (v57)** — when a request failed, the service worker answered everything with the saved app page, so the Firebase and notification scripts (and any data file) could be handed a web page and fail with “Unexpected token <”. Only opening the app falls back to the saved page now
- **No more silent failures when saving or backing up (v56.02)** — a backup that failed (too large, refused, the service busy) or a phone with no room left to save a change used to fail without a word. Now a card at the top says what happened, that the notes are safe on the phone, and offers **Try again**; being offline is not a failure and stays quiet. **Settings → Backup** shows when this phone last backed up (“✅ Backed up today at 9:14”) or what is wrong. A notice comes if the backup nears its size limit
- **Studies are backed up in records of their own (v56.02)** — everything shared one cloud record per restore code, which Firestore limits to 1 MB, so a year of sermon studies could fill it and stop the backup. Each study now has its own record (users/{code}/studies/{id}); the main record keeps an index, and a sync fetches only the studies that changed. Existing studies move over at the next sync. An older copy of the app still works meanwhile (it keeps its studies and they are picked up); if the cloud's rules do not yet allow the new records, the phone keeps the old way and tries again the next day
- **Tips & Help brought up to date (v56.01)** — the verse card's row now lists everything on the card (colour names, cross-references, 🔤 Hebrew / Greek words); *One search looks everywhere* includes the Hebrew & Greek; the two 🔥 rows are one, and say that a chapter reached any way counts toward the streak (v55.18); new rows for the ✍️ Reading Journal; My Verses and Sword Drill name ⚔️ Drill, 📸 Card and 🎤; the Dictionary's tips name its Hebrew & Greek link. New first-use hints for the Hebrew & Greek tool, the reading calendar and badges, and a My Verses list's ↑ ↓ / 📸 Card / ⚔️ Drill; the verse card's hint mentions ✏️ colour names
- **Every chapter you read keeps your streak (v55.18)** — a chapter reached from Search, the Next arrow, a cross-reference or any other link was counted on the calendar once read to the end, but the 🔥 streak only went up when a chapter was opened from the book list, a plan or Home. Now reading any chapter to the end counts for the day, so the calendar and the streak always agree
- **Back retraces every path (v55.17)** — a sweep of 25 journeys through every tool, each walked forward and then backed out step by step, on a phone and on a laptop: reading (books, chapters, Next, the chapter picker, verse cards, parallel passages, cross-references, places, doctrines, the dictionary, Present), Search and its results, Topics, the Concordance, Names, the Timeline, Maps and journeys, Plans and the streak calendar, Notes (My Verses, Highlights, a list presented), Sword Drill, Settings, Tips, the notebook and shared links. Two fixes: **the chapter picker** left a broken step behind, so the first Back after picking a chapter landed nowhere — the picked chapter now takes the picker's place and one Back returns to the chapter it was opened from; and on a phone, **a reference tapped in the notebook** now sets the study aside instead of closing it — Back brings the study back just as it was, and Back again shows the chapter that was under it
- **Back on a laptop: the map and timeline panels stay too, and Back finds the right chapter (v55.16)** — like the notebook, the map and timeline panels beside the page now stay open until ✕: Back steps the page back through what you read from them (after reading two events from the timeline, Back closed the panel and then did nothing for two presses). A journey, which fills the screen, still closes with Back. And the reader's place in the Back history now knows its chapter: reading on with Next after a search and pressing Back twice showed the last chapter read instead of the one you had left
- **The notebook stays open on a laptop (v55.15)** — on a wide screen the Back button closed the notebook. Now the notebook is a panel beside the page, switched on and off only with ✕ or the 📝 at the top (which now also puts it away): Back only moves the page on the left, and tapping a verse, hymn or place in the notebook opens it on the left with the notebook still open. On a phone, where the notebook fills the screen, Back still closes it
- **Maps, places and hymns in a study (v55.14)** — 📝 on a classic map puts **a small picture of the map** in the study, named underneath; tap it for the full map, and it has **a slide of its own, full screen**, when the study is presented (and prints). 📝＋ on a place adds **a place card** (“📍 Bethel — Town or city; today Beitin”) that opens the map at the place. A hymn verse or the refrain now comes in **like a Bible verse**: a gold label (“🎵 Amazing Grace · verse 2”) that opens the hymn, and a slide of its own with the lines as written; Copy as Markdown and Share put the label after the lines. Also: Back now closes a full-screen map opened over the notebook (it closed the notebook and left the map), and a study no longer gets a blank slide from the empty line after an inserted verse. An older copy of the app shows the map's and the place's names as text and a hymn verse as a quote
- **The page moves over for the notebook; a hymn a verse at a time (v55.13)** — on a laptop or a tablet held sideways, the notebook (and the map and timeline panels) covered the right side of every screen but the chapter: a hymn's words, search results, Notes and the header's ⚙ were cut off. Now the whole app — header, page and bottom bar — moves over beside the open panel on every screen, and takes the one-column phone layout while it is open; the wide layout comes back when the panel closes. Hymns: each verse and the refrain has its own **📝＋** to add just that part to the study, and **📝＋ Add to Study** at the top adds only the lines selected (the first verse and refrain when none are)
- **Study Notebook: underline, highlight, spelling and a word count (v55.12)** — **U** underlines and **🖍** highlights the words selected in gold (tap inside a highlight and 🖍 again to take it off); both show when the study is presented. The phone's or computer's own spell checker marks misspelled words as you write, but no longer marks the King James spelling of the verses you add (“doest”, “hath”). The word count sits beside “Saved on this device”. An older copy of the app shows underlined and highlighted words as plain text
- **The timeline beside the chapter on a laptop (v55.11)** — on a laptop or a tablet held sideways, a chapter's **📅 About …** opened the whole Timeline tab in place of the chapter; now it opens the timeline as a side panel, like the map and the notebook, with the chapter's event marked. Tap another event and its chapter opens on the left while the panel stays; read on and the mark follows. It takes the map's place if the map is open, can be widened or narrowed by its edge, and closes with ✕ or Back. On a phone it opens the Timeline tab as before
- **The Verse of the Day opens at the verse (v55.10)** — tapping it on Home opened its chapter at the top; now it scrolls to the verse and marks it in gold for a moment, as any reference does
- **No more going round in circles in Doctrines (v55.09)** — inside a doctrine, “‹ Search” at the top added a new Search page on top of the doctrine, so the phone's Back went back into the doctrine, and “← All Doctrines” went to whatever came before (search results, or the chapter) rather than the list — together they could loop. Now “‹ Search” steps back to the Search page you came from (each history entry in Search knows how far back it is), so Back from there leaves Search; and “All Doctrines” always shows the list — when the doctrine was opened from a search, a verse card or Continue, the list takes its place, so Back still returns to where you were
- **🔎 One search looks everywhere (v55.08)** — above the verses, one box, **In the study tools**, gathers what the whole app has on the search: a well-known passage, a person or place, our **doctrines** (new to search), Nave's topics, the **dictionary** (Webster's as well as the church's notes), **hymns** by title or first line (new — “grace” finds Amazing Grace), **timeline** events, **journeys**, the classic **maps** (all new) and the **concordance**'s count (“hart — 9 verses”). The first four show, “Show more” opens the rest; each opens its page, and Back returns to the results. It replaces the separate cards that stood above the verses
- **🕘 Recent searches in every tool, on every device (v55.07)** — the Dictionary, Topics, Concordance, Names, the map's place finder and Hymns each remember their last eight searches, as the main search does. Tap into an empty box and its recent searches show just under it (the last three under the Home search box); tap one to look it up again, or Clear. A search is kept when it is put to use (Enter, or a result tapped), under the name of what was tapped (“Abigail”, not the “abig” typed). They go with the restore code (`kjv_recent`, in SYNC_KEYS) and two devices' lists are merged, newest first; Clear on one device clears the others. The main search's old list carries over
- **📤 Share a name, place, word or map (v55.06)** — a small **📤 Share** beside **📝＋ Add to Study** on every name, person, place, dictionary word, topic and hymn page, and 📤 in the top bar of a classic map. It opens the phone's share sheet (or copies the link) with a line about it — “👤 Mephibosheth (say it: meh-FIB-oh-sheth) — son of Jonathan (2 Samuel 4:4)” — and a link that opens the app on that very page (`#person=…`, `#place=…`, `#word=…`, `#name=…`, `#topic=…`, `#hymn=…`, `#map=…`); Back from there goes to Home. Tips & Help and the tool tips tell of it
- **🔊 Emerods said right (v55.05)** — v55.04 doubled the last letter of short pieces so a voice would not spell them, but a doubled piece like “emm” was spelled out instead (E-M-uh-rods). Only pieces a voice could take for an abbreviation are changed now, and into real words that sound the same (ock, ick, add, odd); pieces like “em”, “el” and “es” are left as they are, since even read as a letter they sound right. *Emerods* is given to the voice as “emma-rods”
- **🔊 Hear it no longer spells out letters (v55.04)** — a short piece of a sound-it-out spelling could be read as letters: *emerods* came out “M… E… H… rods”, and Antioch's last piece “ok” could be “okay”. The soft middle sounds are now written “uh” as they are said (EM-uh-rodz, BAB-uh-lon, jair-uh-MYE-uh — 52 spellings), and a two-letter piece a voice would spell out is handed to it the way it sounds (ock, idd, emm), while real words like “us” and “in” are left alone
- **A web page for every chapter (v55.03)** — the whole King James Bible as plain, quick web pages, so someone who searches “John 3 KJV” or “Psalm 23 King James” can find us: `kjv/index.html` (the 66 books), a page for each book (`kjv/john.html`) and for each of the 1,189 chapters (`kjv/john-3.html`). Each chapter page has the text with verse numbers, ‹ › to the chapters either side, and **📖 Read John 3 in the app**, which opens the app at that chapter. They follow the theme chosen in the app (or the phone's day / night), and work at phone size. `sitemap.xml` lists all 1,257 addresses for Google. Built from `bible/` by `tools/build-chapters.js`; ⚙ Settings → About links to them, and the app's offline copy leaves them out
- **A gentler first visit, and found on Google (v55.02)** — someone new now sees the Welcome screen and the four-card tour again: the cloud backup made this device's restore code at launch, so the app took a first visit for a returning one, skipped the welcome and showed a What's New list of every update ever made. The first visit is now decided before the code is made. The “Welcome to Home” hint no longer pops up behind the welcome, and the Verse of the Day notification offer (now “Would you like the Verse of the Day sent to you each morning?” — it said notifications needed re-enabling “at our new address”) waits until the second visit. **💡 Something to try** on Home, from the second day: one small card under the Verse of the Day naming one thing not yet used — a reading plan, keeping a verse, Sword Drill, looking something up, listening, a study — with **Not now** (rests it three days) and ✕ (not that one again); it follows the Helpful hints setting. **🔊 Hear it answers sooner**: the phone's voice is woken silently on the tap that opens a name or word (never while the audio Bible plays), and a word no longer waits on an empty cancel. **For search engines**: a description, title, link preview, the app's details for Google (free, works on any device) and `sitemap.xml`. The notification and reminder links, the iPhone home-screen icon and the offline copy now point at the app's own address, fbckjv.app/KJVBible/ (they pointed at fbckjv.app)
- **Hear it said (v55.01)** — **🔊 Hear it** on every name page, person, place and dictionary word: the phone's own voice says it aloud (tap again within a few seconds to hear it slowly); nothing to download or pay for, and it works offline where the phone has a voice. About 660 hard names and 107 old words (shew, divers, victuals, Selah, cherubim…) are written the way they sound under the word, the strong part in capitals — **meh-FIB-oh-sheth** — and the voice is given that spelling so it does not guess; where a phone has no voice, the spelling still shows. On the verse card, a word in *Words in this verse* or a name in *Names in this verse* has it too. Names and words are kept apart (the man Job is said “jobe”, the word job is untouched). The spellings are in `tools/pronounce/`, one per line, built into `pronounce.json` by `tools/build-pronounce.js`. Tips & Help, the Dictionary and Names tips and a first-use hint tell of it
- **Bookmarks, highlights, notes and studies sync item by item (v46.06)** — they used to be sent to the backup as one block each, so the last phone or computer to sync replaced the others' changes (a bookmark added on the phone could disappear when the laptop synced, and Sync Now or a restore could bring back an older copy). Now each bookmark, highlight, note and study remembers when it was last changed or deleted, and every sync merges the two copies item by item: the newer change wins and nothing is lost to an older copy. A restore or Sync Now adds the backup's items to what is already on the device instead of replacing them. Deleting from the Saved screen (and bookmarking several selected verses) now syncs straight away, and an open study shows a newer copy from another device unless you have typed in it since
- **Tips where you need them (v46.05)** — each tool has a small **?** at the top that opens just its tips: the Search tools (Doctrines, Topics, Dictionary, Concordance, Names, Timeline, Maps, Hymns — and it follows the page you open, so a place shows the place tips and Compare Scripture the Treasury tips), the Where map and Journeys, the classic maps, Present, and the Study Notebook (“❓ Notebook tips” at the top of ☰ Studies). A gold dot marks each **?** until you first open it (per device). Every tool's tips are also in Tips & Help under “🧰 Tips for each tool”. Back now closes Tips & Help when it was opened over the notebook or another panel (it closed the panel underneath), and keys pressed while a tips card is open over Present no longer change the slide
- **A tidier header (v46.04)** — the **?** (Tips & Help) and **Share** buttons move from the top bar to the top of **⚙ Settings**: “❓ Tips & Help” and “📤 Share this app (QR code)”, which open exactly as before (Back returns to Settings). The top bar keeps the church name, 📝, 🔥 and ⚙. The welcome screen now says the backup code is in ⚙ Settings → Backup & Restore (it said Tips & Help)
- **Disputed sites, both views (v46.03)** — each disputed site is now its own switch, shared wherever it appears, with the literal reading of the text shown first where the views split between the text and a site fixed by later church tradition: **Red Sea & Sinai** (the Aqaba / Arabian Route first; Elijah's Horeb now moves with mount Sinai, and in that view Kadesh is Petra, Numbers 20:16), **Ur** (Urfa first), **Golgotha & the tomb** (the Garden Tomb first, then the Church of the Holy Sepulchre), **Emmaus** (“threescore furlongs”, el-Qubeibeh, first; Motza and Emmaus Nicopolis), **Bethsaida** (et-Tell or el-Araj) and **Paul's shipwreck** (St Paul's Bay or St Thomas Bay). Place pages for these, and for **Ai** (Khirbet el-Maqatir first), **Sodom & Gomorrah** (Tall el-Hammam first), **where the ark rested** (Mount Ararat, Durupınar, Mount Judi) and **Mount Hor**, show a ⚖️ box: each view, its site, why it is held, “Show this view on the maps” and 🗺️ all of them on one map
- **Study names and other map views (v46.02)** — the study's name in the notebook's top bar is now plainly a box to type in (a dashed line and ✎; Enter or Done finishes), and each study in ☰ Studies has ✏️ Rename — before, the first study's name looked like a plain heading, and only a new study put the cursor in it. Typing a name straight after typing in the study no longer drops the study's last words, and a study is saved the moment the app is put away. Journeys whose sites are disputed now show **both views**, switched on the stop card: the **Exodus** by the **Suez / Peninsula Route** (the Gulf of Suez and Jebel Musa) or the **Aqaba / Arabian Route** (across the Sinai peninsula to Nuweiba on the Gulf of Aqaba, and mount Sinai at Jabal al-Lawz in Midian — Exodus 3:1, Galatians 4:25); **Abraham** from **Ur of Tell el-Muqayyar** in southern Iraq or **Ur of Urfa / Şanlıurfa** (Edessa) near Haran (Genesis 24:4, 10). “Why this view?” gives the reasons; the choice is kept per device
- **Copy as Markdown (v46.01)** — ☰ Studies in the Study Notebook gains **Ⓜ️ Copy as Markdown**: the study with `#` title, `##` headings, `-` and `1.` lists (indented for an outline), **bold** and *italic*, `>` verses followed by their reference, and `---` at each ✂ slide break — the plain-text structure Claude, Google Docs, Word and slide makers read, so a lesson built in the app can be taken anywhere
- **Reading Plans styling restored (v45)** — the plan cards, today's reading card and the day list lost their styles in the June 24 upload (the same one that dropped the Sword Drill styles) and showed as plain text with grey browser buttons; the styles are restored from the June 21 version
- **Clean-up (v41.01)** — red letter is gone for good: anyone who had turned it on before the button was removed still saw some chapters in orange with no way to turn it off; that code is removed (and no longer synced). Also removed code nothing used any more — the old word pop-up, an old backup/import pair, an unused theme toggle and a handful of leftover helpers and styles (about 170 lines). The help text says 96 timeline events; the changelog counts ten classic maps
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
