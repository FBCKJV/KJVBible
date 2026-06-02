# ✝ Faith Baptist Church — KJV Bible App
## Version 2.1 — June 2026
### Changelog since v2.0 (May 2026)

---

## New Features

### ✏️ Verse Memory Game
- **Scripture Memory card** on the home screen opens a full-screen memorization overlay
- **30 curated verses** across 5 categories: Roman's Road, Salvation, Christian Life, Scripture & Prayer, The Great Commission
- **Inline fill-in-the-blank** — tapping a blank transforms it into a text input right in the verse text; no separate input bar
- **Auto-advance** — correct answer flashes green and focus moves automatically to the next blank
- **Guided mode** — first letter shown as placeholder (`B…`) for hints
- **Challenge mode** — pure blanks, no hints
- **👁 Show / Hide reveal toggle** — displays all words dimly in italic for study; tap again to hide
- Wrong answer shakes red and stays focused for retry; tapping outside cancels quietly
- **🎉 Completion screen** — "Well done — hide it in thine heart" with Try Again / Choose Another buttons
- Autocorrect, autocapitalize and spellcheck disabled so KJV words (*believeth*, *hath*, *thee*) are not auto-corrected

### 📖 Dictionary Words in Verse Popup
- Tapping any verse opens the verse popup (bookmark, highlight, note, screenshot, copy, share)
- If the verse contains archaic KJV words from the curated `DICT_HARD` set, a **📖 Words in this verse** row appears at the top of the popup
- Tap any word to see its full definition in the existing word popup
- Completely conflict-free with verse selection and multi-select modes
- `DICT_HARD` curated list of ~65 genuinely obscure words: animal names (*hart*, *hind*, *coney*, *kine*), plant names (*spikenard*, *camphire*, *hyssop*), archaic vocabulary (*froward*, *holpen*, *peradventure*, *sodden*, *straitly*), weights and measures (*shekel*, *cubit*, *ephah*), theological terms (*propitiation*, *reprobate*)

### 📶 Offline Download (Tips sheet)
- **Download All 66 Books** button in the Tips & Help sheet caches all Bible text (~3MB) using the browser Cache API
- Book-by-book progress bar during download
- `fetchBook` checks the device cache before any network request — cached chapters open instantly
- Status updates dynamically: Not downloaded → Downloading → ✅ Offline ready — 66/66 books cached
- **Clear** button to remove downloaded content
- Explains why download is useful: "Bible chapters require an internet connection to load — the text is fetched on demand"
- Tip: download on Wi-Fi before travelling

### ❓ Tips & Help Sheet
- **?** button added to the header
- **Add to Home Screen** section — detects iOS, Android Chrome, Desktop, or already-installed and shows platform-specific step-by-step instructions
- **Tips & Shortcuts** — all major features listed with their matching emojis (📖 word tap, ✦ OT markers, ☐ long press, 📸 screenshot, 🔥 streak, 🔍 reference search, ⇄ parallels, 📑 Doctrines, 📅 Plans, 📚 Reading Journey)
- **⚠️ Important** — cache warning (clearing browser data deletes all personal data) and internet requirement explained
- Android hardware back button closes the Tips sheet correctly (history state pushed on open)

### 📸 Share Button on Screenshots
- Native share sheet button added alongside Save on all screenshot overlays
- Works on Android and iOS 15+ — sends image file directly to WhatsApp, Messages, Instagram, etc.
- Falls back to Save if device doesn't support file sharing
- Added to verse screenshots, reading progress checklist screenshots

### 📋 Copy Format Picker for Full Chapters
- When all verses of a chapter are selected, tapping Copy shows a format picker bottom sheet:
  - **📋 Traditional** — `Song of Solomon 1` then numbered `1  The song of songs…  2  Let him kiss me…`
  - **📄 Block text** — `Song of Solomon 1:1–22` then flowing paragraph
- Partial selections (fewer than all verses) go directly to block text — no picker needed

---

## Improvements

### Navigation & UI
- **Continue Reading banner** now updates every time you return to the Home screen — previously showed stale book/chapter from page load
- **Scroll-hide nav** — Prev/Next chapter buttons fade out during scrolling and reappear 900ms after the reader stops; smooth 0.3s opacity transition
- **Bottom nav** — "Books" label changed to "Home"
- **Home screen church logo watermark** — fixed-position, 7% opacity, doesn't scroll with content, automatically hides on other screens

### Portrait Screenshot Redesign
- Church name at top with rule, reference bold and prominent at 32px, horizontal rule
- Verse text mathematically centred in remaining space between the rule pairs — always balanced regardless of text length
- Church logo as large faded background watermark (7% opacity) replacing the decorative cross
- King James Version anchored at bottom

### KJV Dictionary Expanded (~30 new entries)
Added: *camphire*, *comely*, *savour*, *ointment*, *flagons*, *subtil*, *subtilty*, *broided*, *divers*, *sundry*, *sore* (adverb), *replenish*, *requite*, *manifest*, *bewail*, *alway*, *straightway*, *tarry*, *asunder*, *penury*, *maimed*, *palsy*, *damsel*, *afar*, *hitherto*, *thither*, *whither*, *henceforth*, *latchet*, *emerods*

### Contrast Improvements
- **Dark mode** — verse text brightened (`#f0e6d0` → `#f5ede0`), supporting text lifted for readability
- **Light mode** — body text darkened (`#2a1a08` → `#1a0e04`), metadata text darkened

### Streak Display
- Streak count font changed from IM Fell English serif (where `1` was indistinguishable from `I`) to Inter sans-serif

---

## Bug Fixes

- **Continue Reading** — was only built once at page load; now calls `updateContinueBanner()` on every return to home
- **Screenshot overlay floating** — `#scr-overlay` CSS rule had `display:none` stripped by a Python edit; the rule was split across two lines causing Chrome to discard it entirely
- **Memory game overlay floating** — same CSS `display:none` bug; `#mem-overlay` rule was missing; restored
- **`showTips()` infinite recursion** — a patch wrapped `showTips` calling `_origShowTips` which pointed back to itself due to JS hoisting; merged into one function
- **Android back button closing tab from Tips** — Tips sheet now pushes history state on open; `popstate` handler closes sheet before navigating
- **Syntax error `catch()`** — optional catch binding `catch()` (ES2019) not supported on older Android Chrome; changed to `catch(e)`
- **Word tap dictionary** — `range.expand('word')` is non-standard and unreliable on Android Chrome; replaced with manual character boundary detection; ultimately replaced with verse popup integration to avoid conflict with verse selection
- **Memory game verse selection** — replaced two-step tap → type → ✓ flow with inline input transformation; removed bottom input bar entirely
- **`showTips()` not calling `checkOfflineStatus()`** — merged into single function after recursion fix

---

## Technical Notes
- Single HTML file — ~430 KB
- Offline Bible cache: Cache API, ~3MB when fully downloaded
- `DICT_HARD` set: ~65 curated archaic words for verse popup dictionary trigger
- Memory game: 30 verses, 5 categories, loads verse text from existing `fetchBook` infrastructure

---

*"Thy word have I hid in mine heart, that I might not sin against thee." — Psalm 119:11 (KJV)*
