# Arab Stickers Co. — Go-To-Market & Brand Workstream

**Date:** 2026-07-15
**Status:** Approved for execution
**Owner:** Founder (marketing lead) with Claude-assisted tooling
**Scope:** Brand foundation, voice, content pipeline, Reddit-first acquisition, drop playbook, monitoring, data loop, and 90-day plan for the launch of Arab Stickers Co.

---

## 0. Positioning summary

Arab Stickers Co. is a curated ecommerce store selling authentic artwork by real Arab artists: true 1-of-1 physical originals (hand-made sticker sheets, painted shirts, original coloring books, stationery) plus limited pre-printed editions and print-on-demand merch derived from that artwork. The brand promise is simple and defensible: **real artists, real one-of-ones**. Every marketing decision below serves three pillars — authenticity, Arab art identity, and scarcity — expressed through a bilingual English/Arabic storefront with full RTL support and a sold-out archive that acts as permanent social proof.

---

## 1. Brand foundation

The visual identity must do two jobs at once: signal contemporary design credibility (the store itself is a clean, modern Next.js build with dark/light themes, soft corners, glassmorphism headers, and vibrant accents) and signal cultural rootedness (Arabic calligraphy, artist-made texture). The identity work therefore centers on a bilingual wordmark and a token-based color system that the website and every social asset consume from a single source.

**Wordmark direction options.** Explore three directions in Figma before committing:

1. **Calligraphic hybrid** — "Arab Stickers Co." set in a clean geometric sans (e.g., Space Grotesk or General Sans) with the Arabic rendering ("عرب ستيكرز" or a transliterated mark) drawn in a contemporary Ruq'ah- or Kufic-influenced style. Kufic's geometry pairs naturally with soft-corner UI; Ruq'ah reads casual and playful, matching the sticker medium.
2. **Sticker-as-logo** — the wordmark lives inside a die-cut sticker silhouette with a peeled-corner motif. Instantly communicates the product category and produces a strong app-icon/avatar mark at small sizes.
3. **Monogram + lockup** — a single Arabic letterform (e.g., ع) as the compact mark, with English and Arabic wordmarks as horizontal lockups. Most flexible across favicon, watermark, and packaging.

Whichever direction wins, produce a **bilingual lockup system**: English-primary (LTR contexts), Arabic-primary (RTL contexts), and a stacked bilingual version for packaging and the site header. Test every lockup at 32px (favicon), 400px (social avatar), and print scale.

**Color system.** Anchor to the storefront's design language: a near-black ink and warm off-white as the dark/light theme bases, plus three vibrant accents drawn from the artwork itself — a saturated coral/amber (drop announcements and CTAs), a deep teal or Majorelle blue (archive and editorial), and a warm gold (sold-out badges, "1 of 1" marks). Define every color as a design token (CSS variables in `globals.css` / Tailwind config on the site; matching styles in Figma and Canva brand kits) so glassmorphism surfaces, gradients, and accent usage stay identical across web and social. Typography: one Latin sans and one Arabic companion face with real RTL support (e.g., IBM Plex Sans + IBM Plex Sans Arabic, which are designed as a matched pair) to guarantee bilingual layouts never look bolted together.

**The brand guidelines artifact.** Encode the finished identity with the **brand-guidelines skill** so it exists as a machine-readable artifact — colors, typography, logo usage rules, spacing, do/don't examples — that both surfaces consume: the website reads the same tokens via Tailwind, and every social asset generated through Adobe Express, Canva, or Figma applies the same palette and type. This single artifact is what prevents drift between the storefront and the feed.

**Week-by-week sequence:**

- **Week 1, days 1–3:** Moodboard in Figma (Arab poster art, calligraffiti, contemporary Khaleeji/Levantine design studios, sticker culture). Draft all three wordmark directions as rough comps. Lock the color token candidates against the live site theme.
- **Week 1, days 4–7:** Pick a direction, refine the bilingual lockups, run legibility tests at all sizes and in both themes. Commission or hand-letter the final Arabic calligraphy (budget one revision round with a calligrapher if outsourced).
- **Week 2, days 1–3:** Build the full identity kit in Figma: logo variants, color tokens, type scale, glassmorphism surface specs, sticker-frame and "1 of 1" badge components, social templates (post, story, banner).
- **Week 2, days 4–5:** Run the brand-guidelines skill to encode everything as the canonical guidelines artifact; sync tokens into the Next.js theme and into Canva/Adobe Express brand kits.
- **Week 2, days 6–7:** Apply the identity to the storefront (header, hero, OG images, email header in Resend/Customer.io templates) and produce the first batch of branded social shells. Brand foundation is now shippable.

---

## 2. Brand voice

The voice is: **authentic, artist-first, culturally proud, and playful when memeing** — a store run by people who love this art, not a faceless dropshipper. In practice that means: name the artist before the product; say "this one exists once" rather than "limited stock!!"; code-switch naturally between English and Arabic (a well-placed «يا سلام» or "habibi, it's gone" is on-brand; forced transliteration slang is not); and reserve full playfulness for meme content while product and artist-story posts stay warm and sincere.

**Generating the guide.** Use the **brand-voice workflow** in three passes. First, `discover-brand` gathers the raw inputs: this document, the storefront copy, artist interview notes, and any founder-written posts. Second, `generate-guidelines` produces a structured bilingual voice guide covering tone attributes, vocabulary (words we use / never use), sentence rhythm, emoji and Arabic-script usage rules, and worked examples per channel (Reddit comment, IG caption, drop email, meme alt-text). Critically, the guide must specify voice in **both languages** — Arabic copy is written natively, never machine-translated from the English, and the guide includes Arabic example lines with the same tone attributes.

**Where it lives.** The voice guide is stored alongside the brand-guidelines artifact as the second canonical brand document (versioned in the repo under `docs/brand/`, mirrored to the project knowledge base so every session and collaborator sees the same source of truth).

**Enforcement.** Every outbound piece of content — social captions, Reddit posts, drop emails, even Stripe receipt footer copy — passes through `enforce-voice` before publishing. The workflow checks the draft against the guide and returns violations (wrong tone, banned hype words, English-first copy where Arabic should lead) with suggested rewrites. Operationally: content is drafted in batches (Section 3), the batch is run through enforcement as a single review gate, and only cleared items enter the scheduler. When enforcement flags the same issue three times, update the guide rather than repeatedly overriding — the guide is living documentation.

---

## 3. Content production pipeline

The pipeline runs from a single input — a photograph of an artist's finished piece — to a full multi-platform asset set, with one review gate.

**Step 1 — Capture.** Artist or founder shoots the piece: one clean hero shot on neutral background, one texture/detail macro, one in-context shot (sticker on a laptop, shirt worn), and 15–30 seconds of process video if available. Minimum 2000px on the long edge.

**Step 2 — Master design.** Drop the hero shot into the branded Figma/Canva template: glassmorphism caption card, artist name in both scripts, "1 of 1" badge where applicable, drop date. This produces one master design per piece.

**Step 3 — Batch variations.** Feed the master design to the **Adobe Express "create social variations" skill**, which generates the per-platform size set in one pass: IG feed post (1080×1350), IG story/reel cover (1080×1920), TikTok cover (1080×1920), X post (1600×900), and Reddit-friendly crops (a clean 4:5 or square with *no* heavy branding — Reddit punishes ad-looking images, so the Reddit variant is the raw artwork photo with at most a subtle corner mark). Captions are drafted per-platform, run through voice enforcement, then everything is scheduled.

**Step 4 — Schedule and cross-feed.** Assets are queued a week ahead. The store's meme/social page cross-feeds the pipeline in both directions: top-performing memes and community reactions get reposted to the site's social page (with an email-capture prompt), and sold-out archive pieces from the site become "you missed this" social content — the archive is a renewable content mine, not just a museum.

**Weekly content cadence:**

| Day | Content type | Platforms | Notes |
|---|---|---|---|
| Mon | Artist spotlight (story + 3 works) | IG post, TikTok, Reddit (relevant art sub) | Sincere voice; artist quoted in EN + AR |
| Tue | Process video (timelapse/hands-on) | TikTok, IG Reels, YouTube Shorts | Highest organic-reach format; always subtitled bilingually |
| Wed | Meme day | IG, X, TikTok, site meme page | Playful voice; Arab diaspora humor; brand mark minimal |
| Thu | Drop content (teaser, countdown, or launch per drop-cycle phase) | All + email | Driven by Section 5 calendar |
| Fri | Community/UGC repost + "from the archive" | IG story, X | Sold-out pieces as social proof |
| Sat | Reddit value post (tutorial, collection showcase, artist AMA prep) | Reddit | Never promotional; see Section 4 |
| Sun | Rest / batch production for next week | — | Shoot, master designs, Express variations, voice check |

This cadence costs roughly one production day per week (Sunday batch) plus daily 20-minute engagement windows for replies and Reddit participation.

---

## 4. Reddit-first strategy

Reddit is the primary first-sales channel because it rewards exactly what this brand has — genuine artists, genuine process, genuine scarcity — and destroys what it doesn't tolerate: disguised advertising. The operating rule is the classic **90/10**: at least nine value contributions (comments, critique, tutorials, free content) for every one post that links to or mentions the store. Build karma and community standing for 2–3 weeks before the first store mention of any kind.

**Target subreddit categories:**

- **Art and process communities** — r/Art, r/ArtisansOfReddit, r/drawing, r/painting, r/learnart (process posts and critique participation). Process timelapses and "finished piece" posts perform here when posted by the artist's own account, speaking as an artist, not a store.
- **Sticker and collecting communities** — r/stickers, r/StickerCollecting, r/RedditLaqueristas-adjacent craft subs. This is the highest-intent audience; hand-made sticker sheet photos with honest "I made these" titles routinely do well.
- **Arab and MENA diaspora communities** — r/arabs, r/AskMiddleEast, r/Lebanon, r/Egypt, r/Palestine, r/Jordan, r/Morocco, r/Saudi and city subs with large diaspora membership. Cultural-pride content (calligraphy, motifs, bilingual memes) resonates; these communities are also the most protective, so read each sub's rules on self-promotion carefully and lead with culture, never commerce.
- **Small business / maker communities** — r/smallbusiness, r/Entrepreneur, r/EtsySellers, r/ecommerce for "building in public" posts (launch retrospectives, drop-model learnings). These earn goodwill and occasional customers, and are safe places to be openly a founder.

**Post formats that work for artists on Reddit:** (1) process → result photo pairs or short timelapse videos titled plainly ("Hand-painted this sticker sheet over 14 hours — Levantine tatreez patterns"); (2) "I made this" finished-work posts with the story in a top comment, where the store link appears *only if someone asks* or the sub explicitly allows it; (3) artist AMAs in diaspora subs ("I'm a Palestinian artist making 1-of-1 sticker art, AMA") — coordinate with mods in advance, these are the single best trust-builders available; (4) collection showcases and "which should I make next" polls, which generate engagement and product signal simultaneously; (5) build-in-public retrospectives in business subs after each drop, with real numbers.

**Rules of engagement to avoid bans:** one account per human, clearly identified (artist accounts post art; the founder account posts business content) — never sockpuppet or vote-manipulate. Read and obey each subreddit's self-promotion rules; when in doubt, message the mods first. Never post the same content to multiple subs on the same day. Links go in comments when asked, not in titles. Respond to every comment within the first two hours of a post. If a post is removed, do not repost it — ask the mods why.

**Reddit ads.** After organic traction (week 5+), test Reddit's promoted posts with a small budget (~$20/day) targeting r/stickers and two diaspora subs, using the best-performing *organic* post as the creative (native-looking promoted posts dramatically outperform designed ads on Reddit). Judge on email captures and first purchases, not clicks, and kill anything above target CAC within two weeks.

---

## 5. Drop playbook — the repeatable 2-week cycle

Because inventory is genuinely 1-of-1, scarcity is a fact, not a tactic — the playbook's job is to make sure the audience is watching when a piece goes live and to convert the sell-out itself into marketing. Run this cycle every two weeks, aligned to the Thursday drop slot.

- **Days 1–3 (Tease).** Detail crops and process clips of the upcoming pieces across IG/TikTok/X — never the full piece. Site hero switches to "Drop 04 — Thursday" state. Reddit gets a process post from the artist (value content that happens to preview the drop).
- **Day 4 (Announce).** Drop announcement email to the full list — sent via **Customer.io** for segmented sends (VIPs/past buyers get a 1-hour early-access window; this is the core list-growth incentive) with **Resend** handling transactional flows (order confirmations, early-access links). Subject lines bilingual; artist named in the subject.
- **Days 5–7 (Countdown).** Live countdown timer on the landing hero and product pages (server-rendered end time, client ticking). Daily story content counting down. "Notify me" email capture on each piece page for anyone not yet on the list.
- **Day 8 (Launch, Thursday 6pm local).** Pieces go live. Stripe checkout; the first completed payment wins — the product page flips to "SOLD" in real time via the webhook-driven inventory flip (never optimistic). Founder posts a launch thread on X/IG and is present for the first hour.
- **Days 9–10 (Sold-out theater).** Each sold piece moves to the **sold-out archive** with a red "SOLD — 1 of 1" badge, time-to-sell-out stat, and buyer city if the buyer consents. Post the sell-out recap ("Drop 04: 12 pieces, gone in 41 minutes") — this recap is consistently the highest-converting list-growth content because it proves demand.
- **Days 11–14 (Bridge).** Print-on-demand and limited-edition versions of the drop's most-loved artwork open for order — this monetizes the demand overflow the 1-of-1s created. Behind-the-scenes debrief content, next-drop artist announcement, and Sunday batch production for the next cycle.

Every cycle grows the list (notify-me captures + recap virality), and the archive compounds: by drop six the archive page is itself a proof-of-demand asset linked in every artist pitch and Reddit AMA.

---

## 6. Brand monitoring & feedback loop

Run the **Nimble brand-mention-monitor skill** on a **weekly recurring cadence** (Monday morning, feeding that week's content decisions), producing a standing report that tracks:

- **Brand terms:** "Arab Stickers Co", the Arabic wordmark string, domain mentions, and common misspellings.
- **Artist names:** every roster artist, in both scripts — artist buzz is leading indicator for drop demand and tells you whose work to feature next.
- **Competitor stores:** 3–5 named competitors in Arab/MENA art merch and the broader indie-sticker space (adjust the list quarterly), watching their drop cadence, pricing moves, and community sentiment.
- **Category conversation:** spikes in "Arab art", "Arabic calligraphy stickers", tatreez/khatt-related terms — cultural-moment surges (Ramadan, Eid, heritage months, viral diaspora moments) that content should ride within 48 hours.

**How findings feed back:** the Monday report drives three concrete decisions each week. (1) *Content:* topics with rising mentions get a meme or spotlight slot that same week; negative sentiment (shipping complaints, pricing pushback) gets addressed openly in community posts before it festers. (2) *Product:* artists and motifs generating organic chatter are prioritized for the next drop's roster; competitor sell-outs signal category demand worth entering. (3) *Channel:* if mentions cluster on a platform we're underweight in (e.g., a TikTok sound picking up the store), rebalance the cadence table for the following two weeks. Log each decision in a running `monitoring-log.md` so quarter-end reviews can score which signals actually predicted sales.

---

## 7. Data & personalization loop

On-site analytics are **consent-gated end to end**: PostHog and GA4 initialize only after the visitor accepts the cookie-consent banner, and no tracking events fire before consent. This is a hard GDPR/ePrivacy constraint, stated plainly: EU/UK visitors who decline are served the fully functional but unpersonalized store, their email is only used for what they explicitly signed up for, and every email includes one-click unsubscribe. Consent state is stored client-side and respected by every provider; the personalization below simply doesn't activate for non-consenting visitors.

**Event schema (PostHog, mirrored to GA4):** `product_viewed` (with artist, medium, price band, locale), `wishlist_added`, `email_captured` (with source: drop page, archive, meme page, Reddit landing), `checkout_started`, `checkout_abandoned`, `purchase_completed`, `locale_switched`, `theme_switched`.

**Email segmentation (Customer.io).** Consented events flow into Customer.io as identify/track calls and drive four core segments: **Hot prospects** (viewed ≥3 products or wishlisted, no purchase) get a next-drop early notice; **Cart abandoners** get a single, honest reminder within 4 hours — "this piece is 1 of 1; it's still here, but it won't wait" is the truthful scarcity message this business uniquely earns; **Past buyers** get VIP early access and artist-of-their-purchased-piece updates; **Arabic-preference subscribers** (from `locale_switched` or signup language) get Arabic-first email variants. Optional/enterprise path: if journey complexity outgrows Customer.io, **Adobe Journey Optimizer (via MCP)** can orchestrate cross-channel journeys — treat this as a scale option for post-traction, not a launch dependency.

**On-site personalization (consent-gated):** recently-viewed pieces rail on the home and archive pages; persisted locale (EN/AR + RTL) and theme (dark/light) across sessions; "artists you've viewed" ordering on the drop page; and a wishlist that doubles as drop-notification opt-in. All of it degrades gracefully to defaults without consent.

The loop closes monthly: PostHog funnels (view → wishlist → capture → purchase) by traffic source tell us which Reddit communities and content formats produce buyers rather than browsers, and that reweights both the Reddit target list and the cadence table.

---

## 8. 90-day timeline & KPIs

**Weeks 1–2 — Brand.** Execute the Section 1 sequence in full: identity, bilingual lockups, tokens, brand-guidelines artifact, voice guide generated and enforcement wired in. Storefront rebranded; social accounts created with final identity. *Exit criteria:* guidelines + voice artifacts live; site and templates consuming shared tokens.

**Weeks 3–4 — Pre-launch audience building.** Reddit accounts active in all four subreddit categories on strict 90/10 (zero store links yet). Content cadence table running. Landing page in email-capture mode with a "Founding drop — get first access" offer; first artist spotlights published; Nimble weekly monitor live. *Targets:* 300+ email subscribers, 500+ combined Reddit karma across accounts, 3 artist spotlights shipped.

**Weeks 5–6 — First drop.** Run the full two-week drop playbook for Drop 01 (8–12 pieces). First mod-approved Reddit AMA in one diaspora sub during tease week. Begin small Reddit ad test with best organic creative. Publish the sell-out recap and open the first POD/limited-edition bridge products. *Targets:* ≥70% sell-through within 72 hours, 600+ total list, first repeat-visit cohort visible in PostHog.

**Weeks 7–12 — Cadence + iterate.** Three more drop cycles (Drops 02–04). Each cycle: apply monitoring-report decisions, rotate one new artist in, publish a build-in-public retrospective to business subs, and A/B one variable per drop (send time, early-access window length, teaser format). Month-3 review scores every channel on CAC and reallocates the content calendar and ad spend accordingly.

**KPIs (reviewed weekly, judged monthly):**

| KPI | Day-30 target | Day-90 target |
|---|---|---|
| Email list size | 500 | 2,500 |
| Drop sell-through rate (1-of-1s, 72h) | 70% | 90% |
| Reddit: combined karma / weekly store-attributed sessions | 750 / 150 | 3,000 / 600 |
| Repeat purchase rate (buyers with 2+ orders) | — (too early) | 15% |
| CAC by channel (blended) | Establish baseline | Reddit ≤ $8, paid ≤ $15, organic social ≤ $5 |
| Email capture rate (site visitors → subscribers) | 4% | 6% |

The strategic bet, restated: authenticity compounds. Every drop that sells out honestly, every artist told sincerely, every Reddit thread where we showed up as people first — all of it accrues to a brand that cannot be copied by anyone printing generic designs, because the moat is the artists and the community's trust in how we treat them.
