# Church websites — what we are building and where it stands

Notes for whoever (Claude or a person) picks this up next. Written November 2026 at the end of the session that made the KJV Bible app's promo video. The app's own guidance is in the repository's top-level `CLAUDE.md`; this folder is a separate project that only lives here until it has a repository of its own.

## The aim

Give small King James Bible, independent fundamental Baptist (IFB) churches a website they can actually keep up, and tie every site to the church's tools: the KJV Bible app (fbckjv.app/KJVBible), the Hymns app (fbckjv.app/Hymns), and, when a church asks, the prayer and messaging app and the soul-winning app (both built by the same person; their addresses aren't recorded here yet).

The reason: many of these churches' sites are missing, broken or abandoned, nearly always because the one volunteer who built the site moved on. Web presence is how visitors find a church.

**Order of work** (agreed with the user):

1. **Faith Baptist Church of Plymouth County (Carver, MA)**, the user's own church, first. It proves the template on a real church and becomes the example to show other pastors.
2. **An offer page** for other IFB / KJV churches: the user's church as the live example, what's included, cost (only the church's own web address), and how to ask.
3. **Later, "Find a King James church near you"**: a directory every site links to, built from the church list.

## What a church site is

One page, phone first. Sketch: `template-sketch.html` (open it in a browser; the right-hand phone is the pastor's editor, and Publish updates the site on the left).

- **Top:** church name, town, "independent Baptist · King James Bible", service times, and two large buttons (Call, Directions).
- **Welcome and pastor**, a short history.
- **Salvation:** the Romans Road with each verse quoted in full (KJV).
- **What we believe:** a standard IFB statement of faith with KJV references, in folds. Each church turns sections on or off or supplies its own wording; **never publish a statement the pastor hasn't approved**.
- **Grow in the Word:** Verse of the Day, and links to the Bible app, the Hymns app, and prayer requests (the prayer app when set up).
- **Church news:** the church's own Facebook posts, through Facebook's Page Plugin embed. This is what keeps a site current without anyone editing it.
- **Visit / write to us:** address, phone, map link, contact form.

### Decisions already made

- **Edit from the pastor's phone**: a handful of plain fields (banner, service times, welcome, pastor, phone, Facebook page, statement-of-faith sections) and one Publish button. The layout can't be changed from the editor, so it can't be broken. Sign-in by a code sent to the phone or email, never a password. A second editor can be added.
- **No spam:** no email address anywhere on the page; the contact form has a hidden honeypot field plus a free human check (e.g. Cloudflare Turnstile); messages are forwarded to the pastor's email.
- **Cost:** static pages on free hosting (GitHub Pages, as the apps already use). The church pays only for its own domain and **owns it**, so the site survives any change of helper.
- **Style:** navy and gold, Libre Caslon Text for headings, Source Sans 3 for text; plain, reverent, warm (see the top-level `CLAUDE.md`, "Words").
- **Content store for the editor:** likely the existing Firebase project (`fbckjv-bible`, already used by the Bible app's backup), so there's no new service to sign up for. Not built yet; decide when the hosting is set up.

## Faith Baptist Church of Plymouth County

Draft: `faith-baptist-carver/index.html` (has a "Draft" banner and `noindex`; everything in this repository is publicly served under fbckjv.app/KJVBible/).

**Facts** (from the current site, November 2026):
- 190 Center Street, Carver, MA 02330; mailing P.O. Box 100, Carver, MA 02330; 508-866-5919; faithbaptistcarver@gmail.com (kept off the new page on purpose).
- Sunday School 9:45 AM; Sunday Morning Service 10:45 AM; Sunday Evening Service 6:00 PM; Wednesday Bible Study 7:00 PM.
- Pastor Dr. Chris Tefft (since December 2015), wife Brenda. Founded 1989 by Pastor Brian Mitchell; building and parsonage bought 1996.
- No statement of faith and no Facebook page on the current site. The draft's statement of faith is **draft wording for Pastor Tefft to approve**.

**The current site** is faithbaptistcarver.com on FaithConnector, a paid church-website service. The pastor's daughter maintains it, but it hasn't been updated in years. The user is asking the pastor for permission and access.

**The domain** (RDAP lookup, 25 Nov 2026): registered 12 May 2012 through Wild West Domains (a GoDaddy reseller), expires 2036-05-12, name servers NS3/NS4.NEXTMETA.COM (NextMeta, very likely FaithConnector's company). It may be held in FaithConnector's account rather than the church's. **Settle who holds it before anything else**; the church must own it.

**Plan for leaving FaithConnector**, in order:
1. Pastor's permission; the daughter's FaithConnector login. Thank her for keeping it going.
2. Ask FaithConnector, in writing, whether faithbaptistcarver.com is registered in the church's name and how to transfer it or point it elsewhere.
3. Check the contract: cost, renewal date, notice needed. Don't cancel yet.
4. Save the photos (pastor's photo and logo URLs are on faithconnector.s3.amazonaws.com/6107/…).
5. Finish the site; the pastor approves the wording and statement of faith.
6. Host it (GitHub Pages in the FBCKJV organization, a repository of its own), point the domain at it, check it's live.
7. Only then cancel FaithConnector. Email is Gmail, so it isn't affected.

**Still needed from the user:** the pastor's approval and the access above; a Facebook page (or a decision to make one); the prayer app's and soul-winning app's addresses; any newer photos.

## The church list (kept out of this repository)

The user has `kjv-churches-new-england.xlsx` and `bcc-lists.txt` (made 25 Nov 2026): 149 KJV / IFB churches in Massachusetts, Rhode Island, Connecticut and New Hampshire, each with pastor, published email or contact form, phone, website, KJV evidence and a status. Its "Web help" tab lists **31 churches** that need a site: 14 with none, 7 with a broken one, 10 with a dated one. Every contact was taken from the church's own site or a church directory (kjvchurches.com, militarygetsaved.net, fundamental.org, wayoflife.org), never guessed and never from people-search sites.

**Don't commit that list here**: a compiled list of pastors' emails on a public site invites the spam these sites are meant to avoid. Keep it with the user (or in a private repository). To refresh it, repeat the same searches by state.

## Working agreements

- Never send email, post, or contact a church on the user's behalf; draft it for the user to send.
- Real church content only with the pastor's approval; the samples here use a made-up "Cedar Hill Baptist Church" and the Carver draft is marked as a draft.
- Quote Scripture in the King James Version, word for word.
- Write the way the user's church speaks: warm, plain and reverent.
