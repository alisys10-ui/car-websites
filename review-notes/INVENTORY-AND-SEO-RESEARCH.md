# Source review — 9 November 2026

No vehicle prices or availability were invented or copied from search snippets into the live package.

## Dealer inventory

- Oak Lawn Mazda homepage: https://www.oaklawnmazda.com/ — verified public navigation for new and pre-owned stock.
- New inventory: https://www.oaklawnmazda.com/new-vehicles/
- Used inventory: https://www.oaklawnmazda.com/used-vehicles/
- Steve Napleton Automotive Group: https://www.stevenapleton.com/ — verified group search and dealership-discovery interface. The reviewed page did not expose individual vehicle records in the readable research output.

These are **research/source URLs**, not customer referrals in the site finder. No external dealer listing, inventory or lead-submission link is presented in matching results. Public pages are fetched server-side, with an honest unavailable state if they cannot be read. No third-party gallery, marketing text or dealer photo library was copied. Source references travel with a listing for traceability; they do not prove the car is still physically available.

The source pages may use client-rendered inventory, APIs not exposed in initial HTML, changing schemas, blocked automation or terms requiring a commercial feed. This package has not established a working live import from either dealer. Do not promise automatic real-time stock until a private-preview test yields real VIN-bearing records and confirms source access and freshness. If that fails, obtain a permitted export/API or adapt the parser to the actual source format; do not bypass access restrictions.

## Netlify Forms

- Static discovery and AJAX form handling: https://docs.netlify.com/manage/forms/setup/
- Email notifications and confirmation: https://docs.netlify.com/manage/forms/notifications/
- Function API/configuration and native rate limits: https://docs.netlify.com/build/functions/api/

Email routing belongs to Netlify project notification settings, not the HTML form. The user confirmed that **alisys10@gmail.com** is the only intended recipient and reported fixing notifications already. External settings and delivery were not independently inspected in this session.

## AI

- OpenAI text generation and Responses API: https://developers.openai.com/api/docs/guides/text

The package uses a server-side Responses API call, with `store:false`, bounded messages, origin/content validation and native rate-limit declarations. Live AI remains untested because no provider key or model configuration was available. Fixture tests validate request handling and UI states, not the reasoning quality or factual reliability of a live model.

## Search

- Google search spam policies, including doorway abuse: https://developers.google.com/search/docs/essentials/spam-policies
- Google guidance for AI search features: https://developers.google.com/search/docs/appearance/ai-features
- Bing IndexNow setup: https://www.bing.com/indexnow/getstarted

Search guidance favors useful, crawlable original content and truthful structured data. There is no special schema or guaranteed route into AI answers. The update adds a small set of substantive buying guides rather than hundreds of nearly identical city pages. Sitemaps and robots are prepared; indexing, verified webmaster properties, eligible business profiles and ongoing original content still need owner operation. No IndexNow submissions or search-account changes were performed.

## Manufacturer accuracy

- Mazda CX-5 official comparison: https://www.mazdausa.com/vehicles/cx-5/compare-vehicle-specs-and-trims

At review, this official comparison described the **2027** CX-5. The supplied 2026 CX-5 page mixed a claimed redesign with equipment lists. The update preserves that page path, removes the unverified redesign statement and affected trim/FAQ claims, and directs readers to verify the actual model year and VIN-specific window sticker. Other retained specifications are informational guides, not a current stock feed or a promise of equipment on a particular vehicle.
