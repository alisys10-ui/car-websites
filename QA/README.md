# Test evidence and reproduction

Reports record local browser checks, intercepted HTTP fixtures and contract tests. They do not prove live dealer stock, Netlify email delivery, provider model quality, real production speed or ranking. Synthetic VINs and amounts are only test fixtures and are never imported by website code.

For reproduction, use Python 3 with BeautifulSoup, Node 22+ and Playwright/Chromium. Install the packages in a local development environment. Set `CHROMIUM_PATH` if using a system browser. Start `node test_server.mjs`, then run `node browser-tests.cjs`, `node hosted-tests.cjs`, `node function-tests.mjs` and `python audit.py` from this QA directory. Reports write to this directory. Live calls are mocked or fail locally; no form tests send email.

The source/API fixtures contain synthetic data. Review them as tests, not inventory. No credentials are included. The root sites need no npm dependencies; the QA scripts do.
