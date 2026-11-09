# Three website updates — review package, 9 November 2026

This package is not a production deployment. Each named folder is a separate static Netlify site with two server-side functions. Start from the latest uploaded My Car Advisor ZIP (deploy-6af1c30442a4d1a3d02d334e.zip), not the older archive in the original GitHub commit. All 17 original My Car Advisor page paths are preserved. The other two baselines are the original ZIPs available in this workspace.

## What is included

- My Car Advisor: 24 HTML pages, including the 17 retained originals.
- Car Advisor Chicago: 11 HTML pages plus the existing Google verification file; Arabic, English and Spanish preserved.
- Islamic Car Finance USA: 21 HTML pages; existing Arabic/English and location pages preserved.
- Guided vehicle finder on every substantive page; native keyboard-accessible dialog, optional credit category, budget type, vehicle type, trade-in, timeline, location, review and explicit contact consent.
- Up to **10** matching dealer-source vehicle listings, displayed on your own site. No dealer listing links, dealer contact forms, or SMS handoff for new inquiries.
- No sample vehicles are shipped as live stock. All synthetic fixtures live under QA and are never loaded by a site.
- AI chat is optional and requires consent; server credentials never belong in browser assets. Without configuration or during an outage, the guided finder and contact forms remain available.
- Static Netlify form declarations, honeypots, validation, duplicate-submit prevention, timeout/failure states and editable retry details. Local preview never claims a lead was sent.
- Attribution fields and a unique lead ID travel with the inquiry. Optional GA4 events contain no contact fields, credit category or transcript. No GA4 ID is configured; no analytics requests are sent by default.
- Sitemaps, canonicals, crawl rules, page/service structured data and purpose-specific regional shopping resources for IL/IN/WI. No fake local office, ratings, inventory price or religious-certification schema.
- Restored crawl access: the latest supplied My Car Advisor ZIP contained a global `X-Robots-Tag: noindex, nofollow` header; it is removed here. Success/404 pages remain noindex.
- Local illustration images converted to WebP while originals remain included. Remote images have a clearly labeled illustration fallback if their source fails.

## Email destination — only alisys10@gmail.com

The user confirmed this address supersedes Asayes86@gmail.com and reports that Netlify notification settings are already fixed. The code does not and cannot prove the external account settings or inbox delivery.

Preserved/new form names:

| Site | Main inquiry | Guided finder |
| --- | --- | --- |
| My Car Advisor | my-car-advisor-leads | my-car-advisor-chat |
| Car Advisor Chicago | car-advisor-chicago-leads | car-advisor-chicago-chat |
| Islamic Car Finance USA | ali-chat-leads | ali-chat-leads |

Before public launch, check Forms > Submission notifications **on each of the three Netlify projects**. Use one all-forms email notification to **alisys10@gmail.com only** (or ensure every form above is covered). Remove other email recipients and unwanted webhook/Slack integrations. If the recipient requires confirmation, complete it. Enable form detection, deploy a private preview, and send a clearly labeled test through each distinct form. Confirm it in Netlify and in this inbox. A form field named `recipient` or an HTML comment cannot configure notification routing, so none is relied on here.

Netlify retains form data in the account as well as sending notifications. “One notification inbox” is not a promise that the data bypasses Netlify processing/storage. Existing phone links are preserved as customer choice, while inquiry forms stay on your site.

## AI setup

For each project, set server-only environment variables in Netlify:

- `OPENAI_API_KEY`: a valid OpenAI API key with available API credits.
- `OPENAI_MODEL`: a model ID available to that API account and supporting the Responses API.

No key, paid model account or model availability was supplied. Do not paste keys into source, the ZIP, chat or browser code. Test real provider answers in English, Arabic and Spanish before enabling production. API use can incur costs independently of advertising spend.

The AI endpoint is `/api/chat`; guided preference matching is deterministic. The AI has no credit-decision capability and cannot submit a lead itself. It should not promise prices, financing approval or religious suitability. Live model behavior cannot be fully proven with mocks.

## Dealer website import — facts stay on your site

`/api/inventory` requests public pages from Oak Lawn Mazda (new and used) and Steve Napleton Automotive Group. It parses VIN-bearing structured vehicle records and, when available, follows up to five same-host vehicle detail pages per source. It never circumvents logins, anti-bot restrictions, access controls or browser challenges. Source failures produce an honest empty/unavailable state and a request form, not invented vehicles.

Supported data: schema.org Vehicle/Product with VIN, make, model, year, condition, same-host source URL, and optional asking price/mileage. Numeric monthly/lease payments and ranges are not used as a vehicle asking price. Sold/out-of-stock records are excluded when explicitly marked. Parsed listings are labeled “listed”; a successful fetch does not prove physical availability. Cache is five minutes; results older than fifteen minutes are excluded. The browser filters and shows up to ten matches. Prices are advertised source amounts, with tax/fee caveats. Images are shown only for an explicitly authorized photo feed; the public HTML importer does not copy dealer photos.

**Live import is not verified.** This execution environment rejected direct access to dealer domains with HTTP 403. The readable research pages did not expose machine-readable individual stock records. Both sites may render stock with JavaScript or use a schema this importer cannot read. A live private-preview import check is required; a dealer-provided export/API or a revised parser based on their actual permitted data may still be necessary. This package must not be presented as a complete live inventory integration.

## Safe review and launch

1. Review the change report and QA results first. Keep current live sites unchanged.
2. Use Netlify Git/CLI deployment with each site folder as its base directory; retain `netlify.toml`. A simple static ZIP drag-and-drop does **not** install server functions.
3. Confirm canonical domains. Current domains are retained from the source sites; if using another domain, replace canonicals, schema URLs, hreflang targets, sitemap URLs and robots sitemap references consistently.
4. Configure the server-only AI environment variables, inspect rate limits and set provider billing limits. Native Netlify function rate limits are declared; enforcement is a hosted check.
5. Verify all email forms, real AI replies, real dealer import, consent, calculators and mobile layouts on a private preview. Check Netlify function logs without logging form data or credentials.
6. Only then publish a reviewed version. This work did not publish or modify any Netlify project or its settings.

## Organic search operations still needed

SEO cannot guarantee ranking, AI citations, qualified reach, financing eligibility or a new lead every day. Submit the final sitemap in Google Search Console and Bing Webmaster Tools after domain verification. Use a truthful Google Business Profile only if the business is eligible, with actual contact/location details and permission for the dealership address. Do not create fictitious offices or duplicate city doorway pages. Continue publishing original comparisons and useful buying guidance, request genuine reviews, maintain availability data and respond to leads promptly. `llms.txt` is an informational convenience, not a ranking guarantee or an indexing requirement.

Sources and links are in INVENTORY-AND-SEO-RESEARCH.md. Detailed actual test outcomes are in QA/ and CHANGE-REPORT.md. No emails were sent and no real customer lead was created during tests.
