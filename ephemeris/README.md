# Swiss Ephemeris data

Bundled from Astrodienst's official source repository at commit `94621aba9f3ff9c32cb721eac0380c30dbb153fe`:
https://github.com/aloistr/swisseph/tree/94621aba9f3ff9c32cb721eac0380c30dbb153fe/ephe

- `sepl_18.se1`: planetary ephemeris
- `semo_18.se1`: lunar ephemeris
- `seas_18.se1`: main asteroid ephemeris, including Chiron

The app limits supported birth years to 1800–2399, inside the bundled data interval. SHA-256 values are verified by the test suite. `LICENSE` is the upstream license, not a declaration of the application's chosen distribution license. Swiss Ephemeris is dual-licensed; resolve AGPL compliance or professional licensing before making this app public.

Do not expose this directory as public browser assets. The Nitro build copies it into the server function, where the native engine reads it from disk. The engine checks calculation flags and rejects silent fallback.
