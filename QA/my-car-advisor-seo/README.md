# My Car Advisor SEO correction

Scope: My Car Advisor only. No files in Car Advisor Chicago or Islamic Car Finance USA were changed. The separate inventory-fetch patch was not included.

## Canonical URL policy

The 22 sitemap entries use `https://mycaradvisor.netlify.app/slug/` (home is `/`). Page files live at `slug/index.html`, so directory URLs serve the content directly. Old `/slug.html` and `/slug/index.html` URLs permanently redirect to `/slug/`. `/index.html` and `/index` redirect home. No slash-removal redirect rules are used: Netlify normalizes trailing slashes before matching such rules, and slash-only forced redirects can loop. A slashless alias may be normalized by the CDN or served with the same canonical; it is never linked or included as a separate sitemap URL.

All internal HTML links, canonical links, Open Graph URLs, structured-data URLs, sitemap entries, llms references and the success-page form destination use the same policy. Assets are root-relative after page relocation. JavaScript changes only update the form success destination; no inventory or AI behavior is changed.

Every HTML document has one JSON-LD graph with one WebPage and stable WebSite, Person and Service identifiers; interior pages have one BreadcrumbList. The graph contains no invented stock, prices, ratings, local office address or approval promises.

All authored noindex directives were removed from this site's HTML and `_headers`, including utility pages at the owner's request. The site-wide header now explicitly allows indexing. Success and error pages remain outside the 22-entry sitemap. A genuine missing URL returns HTTP 404, not a soft 200.

Existing CSS, images and inline style blocks are unchanged. The CX-5 guide's repeated specification placeholders were replaced with specific vehicle-comparison checks. Budget guides now distinguish inspection and title checks at $5k–$10k, an all-in ceiling below $10k, and age/mileage/warranty trade-offs below $20k. The inventory landing page now has crawlable buying/search guidance without asserting live stock exists.

## Verification

- `static-check.py`: 22 unique sitemap URLs; all reachable through internal links; distinct titles/descriptions; self canonicals; one JSON-LD graph per page; valid local assets; legacy redirect rules; valid robots and TOML; original design assets unchanged.
- `http-check.py`: all 22 canonical URLs return HTTP 200 under Netlify CLI locally, including with a Googlebot user-agent; `.html` and directory `index.html` aliases redirect 301; canonical agreement; no noindex headers; robots.txt and sitemap.xml return 200; a nonexistent page returns 404.
- `browser-check.cjs`: all 22 URLs at both 390px and 1440px widths (44 checks), no page JavaScript errors or horizontal overflow; working chat opening/closing and form validation; no real leads sent.
- Existing inventory/AI contract tests pass. Both My Car Advisor server functions also bundle unchanged with esbuild.

These are local tests using Netlify's CLI, not a production crawl. Unused Edge Functions emulation is disabled locally because its runtime bootstrap is unavailable in this environment; this site declares no Edge Functions. No provider AI call, dealer-stock check or email-delivery test is asserted by these SEO checks.

## Live verification limitation

The execution environment currently denies direct HTTPS requests to `mycaradvisor.netlify.app` before reaching the site (`CONNECT tunnel failed, response 403`; the environment's custom allowed-host list is empty). This is not evidence that the site returns 403 to Google. The owner approved adding the host, but the effective environment policy had not changed at the time of testing. Do not describe the 22 local HTTP checks as live production checks.

After the main push, the existing Netlify Git connection should deploy automatically; the push alone does not prove that deployment succeeded. Once Netlify shows Published for the new commit, run:

```sh
python QA/my-car-advisor-seo/http-check.py --base https://mycaradvisor.netlify.app --output netlify-live-results.json
```

The live check is read-only. It tests the deployed sitemap content, canonical paths, headers, redirects and robots. A page accessible to a client using the Googlebot user-agent does not establish Google's actual indexing decision; use Search Console as well.

## Google Search Console

Wait for the new commit to be Published on Netlify, not a fixed number of hours. In the `https://mycaradvisor.netlify.app/` URL-prefix property:

1. Inspect the home page and representative new-model, used-model and budget URLs using **Test Live URL**. Confirm the live page is available and indexing is allowed, and that the user-declared canonical uses the new slash URL.
2. Submit or resubmit `sitemap.xml` once and check **Success**. It should list 22 canonical URLs.
3. Request indexing for the most important updated canonical URLs. Do not keep requesting the redirected `.html` aliases.
4. If an earlier noindex exclusion is recorded, use the available **Validate fix** workflow after the live test succeeds. Redirected old aliases may appropriately remain excluded as redirects.
5. Monitor Page indexing and Performance. Crawling/indexing can take days to weeks; sitemap submission or a request does not guarantee inclusion or new customers.

Primary guidance: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls and https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl . Netlify routing behavior: https://docs.netlify.com/manage/routing/redirects/redirect-options/ .

## Observed after the source push

Source commit `7126a9e` was pushed to main. All 22 canonical HTML pages were readable through the connected web reader after the push; the newly rewritten CX-5, budget and inventory content was visible on the live site. This supports that the automatic site update took effect, but is not a substitute for inspecting Netlify's Published status or testing the live response headers.

Direct production HTTP/header checks and direct live robots/sitemap retrieval remain unverified because of the session network restriction/tool limitations. The 22 HTTP-200 checks and 301 assertions in netlify-local-results.json are specifically local Netlify CLI results. See post-push-observations.json for the separate live readability observations.
