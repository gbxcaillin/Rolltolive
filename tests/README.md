# Headless tests

Playwright smoke tests that drive the real game in headless Chromium.

```
npm i -g playwright && npx playwright install chromium
node server/relay.js 8787 &        # needed by online.test.js and migration.test.js
node tests/solo.test.js            # menu → select → move → fight → death → restart → hotseat → win
node tests/online.test.js          # two browsers through the relay: lobby, start, move, fight, end
node tests/migration.test.js       # three browsers: duel push-out, host drop → promotion, sanctuary hold
node tests/simulate.test.js        # fast-forwards three full solo rounds and checks invariants
```

Each script prints a short log and ends with `errors: none` when the page raised no exceptions.
Screenshots land in `tests/shots/`.
