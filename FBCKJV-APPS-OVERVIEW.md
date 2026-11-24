# Faith Baptist Church: The Whole Family of Apps

*A note for future work sessions: what has been built, where it lives, how the pieces connect, and how the church likes the work done. Compiled 24 November 2026 from the eight repositories in the FBCKJV GitHub organisation.*

---

## At a glance

| App | Live at | Repo | What it is | Built | Latest |
|---|---|---|---|---|---|
| **KJV Bible** | fbckjv.app → `/KJVBible/` | `FBCKJV/KJVBible` | The flagship. A complete King James Bible reading and study app | May 2026 → now | **v64** (Verse Glow & Wallpapers) |
| **Hymns** (Sacred Hymnody) | fbckjv.app/Hymns/ | `FBCKJV/Hymns` | Congregational hymn and sung-Psalm player | Jun → Oct 2026 | v53 |
| **Prayer Chain** (FBCoPC) | prayer.fbckjv.app | `FBCKJV/Prayer` | Invite-only church prayer requests, messages and calendar | Jul → Nov 2026 | ongoing |
| **Prayer Chain template** | (template only) | `FBCKJV/prayer-chain-template` | The prayer app with the church taken out, for other churches | Jul → Oct 2026 | superseded by `Prayer/generic/` |
| **Soul Winner** | (GitHub Pages) | `FBCKJV/SoulWinning` | Door-to-door evangelism map for soul-winning teams | Jun → Nov 2026 | ongoing |
| **Sword of the Lord** | sword.fbckjv.app | `FBCKJV/Sword-of-the-Lord` | An arcade game of Scripture memory against demons | Jul 4–9, 2026 | v11+ |
| **Jag's House of Wews** | fbckjv.app/JagsHouseofWews/studies/ | `FBCKJV/JagsHouseofWews` | A family and church archive of KJV chapter studies, doctrines, lessons and slide decks | Jun 2026; app from Oct → now | v2.59 (most active repo right now) |
| **fbckjv.app root** | fbckjv.app | `FBCKJV/fbckjv.github.io` | The domain's front door. Redirects to the Bible app | Jun → Nov 2026 | redirect only |

All of them are **plain static PWAs** (HTML/CSS/JS with no build step for the app itself), hosted on **GitHub Pages**, installable to the home screen, working offline through a service worker, with subdomains served through **Cloudflare DNS**. Where a backend is needed it is **Firebase on the free tier**, and push alerts use **OneSignal plus a small Cloudflare Worker**.

---

## 1. KJV Bible (`FBCKJV/KJVBible`) is the centre of everything

**Vision (from its CLAUDE.md):** *Everything leads back to the Word.* Every tool serves the reading of Scripture and never competes with it. It must feel complete to a plain reader, a reading-plan keeper, a Sword Drill memoriser, and a pastor building sermons. **The features form one circle:** nothing is a dead end, every verse shown has a tappable reference, and the phone's Back always returns you exactly where you were.

**How it's built**
- One file: `index.html` (about 1.35 MB of HTML, CSS and JS), plus `sw.js`. Book text in `bible/`, reference data as root JSON files (`concordance.json`, `naves.json`, `people.json`, `places.json`, `timeline.json`, `journeys.json`, `hymns.json`, `pronounce.json`, `verse-index.json`, and the `strongs/`, `treasury/` and `dictionary/` folders).
- About 20 build scripts in `tools/` (`build-strongs.js`, `build-treasury.js`, `build-webster.js`, `build-naves.js`, `build-hymns.js`, `build-psalm-titles.js` …).
- Data lives in `localStorage` under `kjv_*` keys. It backs up with a restore code (`SYNC_KEYS`) and a cloud backup (Firestore), and user-created items merge item by item (`MERGE_STORES`).
- Navigation discipline: `openPopover`/`closePopover`, `POPOVER_IDS`, and `stepAside(id, fn, comeBack)` so leaving a card never loses it.
- `node tools/check-app.js` parses every script, checks that the versions agree, then walks the everyday journeys in a phone-sized Playwright browser (`--shots` saves light and dark screenshots).
- Themes: dark (`:root`), `.light` and `.sepia`. Fonts: IM Fell English (titles), Crimson Pro (Scripture) and Inter (interface).

**Release rules**
- *Feature release:* raise the major version (v63 → v64) in `sw.js` `CACHE_NAME` and `WHATS_NEW_VERSION`, add a short What's New item (`data-wn`), and add a CHANGELOG section.
- *Fix or minor feature:* a stealth update. Raise the minor version (v64.01) in `CACHE_NAME` only, add a CHANGELOG line, and **no** What's New popup.
- Always keep Tips & Help, `TOOL_TIPS` and the first-use `HINTS` current.

**The journey, version by version (v25 → v64)**
- **v25–27:** verse image cards on photos, personalised photo cards, real photo backgrounds, adjustable margins
- **v28–29:** smarter whole-word search with KJV word forms, better reference parsing, "Did you mean…?", **Nave's Topical Bible** (~5,300 topics)
- **v30:** **Bible People** (~3,000), and "Everything Connected" (the verse card shows the people and doctrines in it)
- **v31:** **Webster's 1828 Dictionary** (62,412 entries) merged with the church's KJV notes
- **v32:** **Bible Places** (~1,200, from OpenBible geocoding)
- **v33:** **Treasury of Scripture Knowledge** (305,906 cross-references), Bible Timeline, concordance verses
- **v34:** **The Hymnal** (98 public-domain hymns), ⭐ First Mention, 🔗 Follow the Thread
- **v35:** 📝 **Sermon & Study Notebook**
- **v36–37:** Search became a hub with eight tiles (Doctrines, Topics, Dictionary, Concordance, Names, Timeline, Maps, Hymns), and cross-references were made clearer
- **v38:** ⚔️ **Sword Drill rebuilt** (in-app Scripture memory)
- **v39–41:** a parchment **map of the Bible lands** drawn in the app, a map explorer ("What happened here?"), and **18 Bible Journeys** (Abraham, the Exodus, David fleeing Saul, Paul's journeys …)
- **v42–45:** 🎦 **Present mode** for projectors, a Classroom preset, tablet and big-screen layouts, resizable panels, two-column search
- **v46:** present a study from the notebook as slides
- **v47:** several reading plans at once
- **v48–49:** a tidier Home (`.hw` cards), a Notes tab, and 🔖 **My Verses** (bookmark lists you name)
- **v50:** first-use hints ("Help as you go")
- **v51:** "Everything leads somewhere" (selected verses → Sword Drill, study, card …)
- **v52:** 🏅 Days in the Word calendar and the streak
- **v53:** highlight colours with meanings, and a daily reminder
- **v54:** 🧭 Make your own plan
- **v55:** 🎤 Say it aloud (speech recognition in Sword Drill)
- **v56:** 🔤 **Hebrew & Greek: Strong's** for 94% of the words in the KJV
- **v57:** 💾 a backup file of your own
- **v58–59:** 🎧 hear the hymns sung, and hear every Psalm sung (links into the Hymns app)
- **v60:** plans at any pace, listening counts toward reading, share a link
- **v61:** the hymnal grows to **224 hymns**
- **v62:** 🎵 "A hymn on this verse" fold on the verse card
- **v63:** **the titles of the Psalms** (116 Psalms open with their superscription, as in a printed KJV)
- **v64:** ✨ **Verse Glow** (full-screen verses fading in, for a lobby screen or nightstand) and phone wallpapers

The full detail is in `CHANGELOG.md`, and the link audit is in `tools/LINK-MAP.md` and `tools/LINK-GAPS.md`.

---

## 2. Hymns, or Sacred Hymnody (`FBCKJV/Hymns`)

The companion music app at **fbckjv.app/Hymns/** is a player for Baptist congregational singing and **sung Psalms** (word for word from the KJV).

- Streams public-domain or ministry-licensed audio from baptistarchive.com (Olmstead Baptist), smallchurchmusic.com (Rev. Clyde McLennan organ and piano), Bible Baptist DeLand piano, archive.org, and thepsalmssung.org (Scottish Metrical Psalter).
- Psalms and Specials load dynamically through a Cloudflare Worker and R2. That loading was hardened against hiccups, and the ids stay stable when new files are uploaded.
- It has search across title, artist, tune, tags and lyrics; shuffle and continuous autoplay; resume of the last song; offline downloads; and share links.
- **It ties into the Bible app.** `?psalm=N` opens that sung Psalm. The Bible app's 🎧 Listen and 🎧 Sung buttons land here, and Hymns has Scripture buttons that go back to the Bible app.
- It has its own `tools/check-app.js` (Playwright with the audio faked) covering playing, resuming, Back closing sheets, songs that fail to load, and removing a download.

---

## 3. Prayer Chain, or FBCoPC (`FBCKJV/Prayer`) at prayer.fbckjv.app

An **invite-only**, deliberately *quiet and low-drama* prayer app for Faith Baptist Church of Plymouth County.

- **Design principles:** no direct messages (one shared feed), open moderation (moderators wear a public badge, and an open Members list), and alerts that name *who* posted but never the request text.
- **Prayers & Praise:** categories, an Urgent flag, 🙏 "I prayed" counts, updates and encouragements (❤️ reacts), marking a prayer answered, filters (All / Urgent / Answered / Mine), and the newest request auto-expanded.
- **📣 Church Messages:** the pastor and moderators post to everyone, and members respond with 👍.
- **📅 Calendar:** a month view, Coming up, "Add to calendar" from a message, and repeating dates.
- **🎂 Birthdays & anniversaries:** CSV import and an 8 AM "Celebrating today" greeting (🎉 to wish well).
- **📄 Weekly Prayer List:** a landscape two-panel sheet, printed and cut in half, now a one-tap Download PDF.
- **Roles:** pastor, deacon, clerk and moderator. Removing a member is a soft delete with Restore.
- **Ease of use:** text size (A / A+ / A++), "❓ How do I…?" help, a weekly nudge to turn on alerts, new-post counts on the tabs, and a "What's new" dialog.
- **Push alerts:** OneSignal plus a Cloudflare Worker, held overnight from 8 PM to 8 AM.
- **Stack:** Firebase Auth and Firestore. The invite code is enforced server-side in `firestore.rules` with `get()`, so no paid plan is needed.
- **Sharing:** `prayer-chain-generic.zip` and `generic/` are built by `tools/make_generic.py`, which refuses to build if any church-specific data leaks in. The download includes a `CLAUDE.md` setup guide so Claude can walk another church through setup. There is also a 95-second demo video with a made-up "Grace Bible Church".

**`FBCKJV/prayer-chain-template`** was the first standalone template (July–October), with `BUILD-GUIDE.md` and `SETUP-WITH-CLAUDE.md` (an interview-style setup playbook). The `generic/` download in the Prayer repo has since become the main way to share it.

*Origin note:* the Prayer Chain was first created inside the Sword-of-the-Lord repo on 9 July and moved into its own repo the same day.

---

## 4. Soul Winner (`FBCKJV/SoulWinning`)

A door-to-door evangelism map for soul-winning teams (`index.html` is the map, and `report.html` holds the reports and follow-up lists).

- One-tap visit logging at your GPS position, a **real-time shared map** across all team phones, a heatmap, colour-coded teams (A, B, C…) and filter chips.
- A "you are here" dot with an accuracy ring, **live team locations**, and a 🙌 **born-again believer** marker (a teal cross).
- A stats bar (total, today, per team), an offline queue that syncs automatically, and JSON export and import.
- Report cards show the approximate address with a link to Maps.
- The map moved from CARTO to Esri and then to **OpenStreetMap** (no API key, crisp at house level).
- **Stack:** Firebase Realtime Database with anonymous auth (`visits`, `beacons`, `live`, `congregation`).
- **Sharing:** `soul-winner-generic.zip` with a `CLAUDE.md` setup guide, plus a 75-second demo of a mock Saturday trip (3 teams, 100 doors, 10 salvations).

---

## 5. Sword of the Lord (`FBCKJV/Sword-of-the-Lord`) at sword.fbckjv.app

An **arcade-style Scripture memory game**, built in an intense burst from 4 to 9 July 2026. You battle demons by completing verses.

- Rounds and **bosses** with verses tiered by round, chains, combat, mercy, mastery, difficulty levels, campaign mode, and word-count verse windows.
- **Romans Road and eternal security (OSAS) verses**, decoy words (never one that matches an imminent verse word), and "Valiant" camouflage.
- A pre-battle **Study** screen, difficulty-driven hints, and a how-to-play screen on first launch.
- **Procedural background music** (menu, battle and boss themes), a cartridge-style launch splash, and demon art.
- A Firebase **arcade leaderboard**, split per difficulty.
- It is a multi-file PWA (`js/core`, `js/ui`, `js/data`, `js/firebase`).
- *Related:* the Bible app's own **⚔️ Sword Drill** (v38, v51, v55) is the gentler in-app memorisation tool.

---

## 6. Jag's House of Wews (`FBCKJV/JagsHouseofWews`)

*"A family and church archive of KJV Bible teaching."* It is the most active repo right now (220 commits, 140+ PRs).

- **Chapter Studies app** (`studies/`), built on 27 October from a **Telegram channel export**: a reader modelled on the KJV app's, with the same look and themes, chapter studies as tabs (newest first), "Where you left off" (the last five places), share, and installability.
- **Doctrines & Teachings:** 1,622 teachings in 21 topics, crawled from the studies, plus an end-times timeline (the 1,215 days of wrath).
- **Lessons & Classes** as **slide decks** built from `lessons/src/*.deck` by `tools/build_deck.py` and `tools/deck/template.html`. Scripture is pulled automatically from the KJV (from the KJVBible repo), never typed by hand. Every deck has Projector mode (P), Day/Night (D), Full screen and Share, and a **Chapter panel** (C) on chapter-teaching decks. `tools/check_decks.js` checks that slides fit at laptop and projector sizes.
- **Series built:** the Genesis class (Genesis 1–25), the Job class (five decks), **every series Psalm** (1–66 and counting), the John decks ("That Ye Might Believe", the "I am" sayings), Daniel's 70th Week, Romans, doctrine decks (angels, creation, nations, election, the Judgment Seat, After the Tribulation, Another Gospel), The Apocrypha, "Hold the Traditions?", Rome's traditions, sermons, and memes sorted by theme.
- **Workflow:** the author writes daily studies in Google Docs. Claude reads them with the Drive tools and files them in `review/refile.json`, runs `tools/clean_studies.py`, bumps `APP_VERSION` and the SW cache, opens a PR, and **merges only when the author says "merge"**. The author's to-do list is `review/todo.md`.
- **Firm rules:** keep the author's wording, doctrine and tone, and never fact-check or soften his points. Fix only typos, plain slips, and verse text that isn't KJV. Never store Drive links or file ids. **Links go one way: nothing is added to fbckjv.app from here.** Send full changed files to the user.

---

## 7. fbckjv.app root (`FBCKJV/fbckjv.github.io`)

The domain front door. As of 24 November 2026 it redirects `fbckjv.app` (and lowercase `/kjvbible`) to the current Bible app at `/KJVBible/`, keeping the query string and hash. It also hosts the OneSignal service workers at the root.

---

## How the apps connect

```
                  fbckjv.app ──redirect──▶ KJV Bible (/KJVBible/)
                                             │  ▲
                🎧 Listen / 🎧 Sung (?psalm=N)│  │ Scripture buttons
                                             ▼  │
                                        Hymns (/Hymns/)

   KJV Bible ⚔️ Sword Drill  ~ cousin of ~  Sword of the Lord (arcade game)
   KJV Bible text  ──feeds──▶  Jag's House of Wews decks (KJV pulled by the builder)
   Prayer Chain, Soul Winner: standalone church-life tools on the same PWA + Firebase pattern
```

## Patterns that hold across every app

1. **Static PWA on GitHub Pages.** No server, free tiers only (Firebase, Cloudflare Workers and R2, OneSignal).
2. **The service worker cache name is the version.** Bump it on every deploy so phones pick up the change.
3. **A Playwright journey check before pushing** (`tools/check-app.js` in Bible and Hymns, `tools/check_decks.js` in Jag's).
4. **Phone Back must always work.** Sheets close on Back, and nothing loses your place.
5. **Built for people who don't use much tech.** Plain words, large targets, text size options, "How do I…?" help, first-use hints, and confirm sheets instead of `confirm()`.
6. **Warm, plain, reverent words.** Always the KJV, never modern versions. KJV phrasing where it fits.
7. **Shareable with other churches.** Prayer and Soul Winner each ship a `generic/` zip with a `CLAUDE.md` that lets Claude walk a non-technical church through setup, a script that refuses to leak church data, and a demo video with a made-up church.
8. **Git workflow.** Work on a branch, open a PR, and merge only when the user says so.
9. **Privacy.** Alerts never show prayer text, and no Drive links go into repos.

## Rough timeline

- **May 2026:** KJV Bible v2.0
- **June 2026:** fbckjv.app root (3 June), Jag's House of Wews archive begins (7 June), Soul Winner (23 June), Hymns (28 June)
- **July 2026:** Sword of the Lord (4–9 July), Prayer Chain (9 July), prayer-chain template (11 July)
- **August 2026:** Soul Winner live team locations and the OpenStreetMap basemap, Prayer member restore and password reset, Claude-guided template setup
- **September 2026:** Hymns Worker and R2 resilience, KJV Bible's big study-tool expansion continues
- **October 2026:** KJV Bible Strong's (v56) to Psalm-hymn links (v62); Prayer Messages, Calendar, roles and birthdays; Hymns ↔ Bible links; Jag's Chapter Studies app launched (27 October)
- **November 2026:** KJV Bible Psalm titles (v63) and Verse Glow (v64); Prayer PDF list and generic download; Soul Winner demo and generic download; Jag's Psalms, Genesis, John, Job and Daniel decks; fbckjv.app redirects to `/KJVBible/`
