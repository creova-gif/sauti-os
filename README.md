# Sauti OS

**Artist and royalty management for musicians — airplay tracking, contracts, royalties, and event bookings in one platform.** (*Sauti* — Swahili for "voice.")

[![Status](https://img.shields.io/badge/status-active_development-yellow)]()
[![License](https://img.shields.io/badge/license-proprietary-red)]()

---

## What this is

Sauti OS gives independent artists and their managers the back-office tooling that major-label rosters take for granted: airplay tracking, royalty calculation, contract management, and event bookings, in one system built around how music businesses actually operate — particularly relevant for African music markets where royalty administration is often fragmented across broadcasters, PROs, and manual tracking.

---

## Core Features

- **Airplay tracking** — monitor where and how often songs are played
- **Artist management** — artist profiles and roster management
- **Royalties** — royalty calculation and distribution tracking
- **Contracts** — artist and licensing contract management
- **Songs** — catalog management
- **Events** — booking and event tracking
- **Dashboard** — overview across artists, songs, and revenue

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, pnpm monorepo |
| Architecture | API server (`artifacts/api-server`) |

---

## Getting Started (Local Dev)

### Prerequisites
- Node.js 18+
- **pnpm** (enforced via preinstall check)

### Installation

```bash
git clone https://github.com/creova-gif/Sauti-Os.git
cd Sauti-Os
pnpm install
pnpm run build
```

---

## Roadmap / Status

Core routes implemented: airplay, artist, contracts, dashboard, events, royalties, songs. A `.env.example` should be added for onboarding new developers.

**Worth noting:** this pairs naturally with `Kultr-Hub` (M-Pesa / MTN Mobile Money / Paystack payment rails) for actually disbursing royalty payouts to African artists — worth confirming whether that integration is intentional and documenting the relationship between the two repos if so.

## Contributing

This is a private, proprietary CREOVA product. External contributions are not accepted at this time.

## License

Proprietary — All Rights Reserved. See `LICENSE`.

## Credits

Built by CREOVA. Product lead: Justin Mafie.


## Related Products

This is one of three connected CREOVA products forming a single East African fintech / creator-economy thesis: the business logic layer that calculates what artists are owed and why. See [Gopay](https://github.com/creova-gif/Gopay), [Kultr-Hub](https://github.com/creova-gif/Kultr-Hub), and the full [East Africa Fintech Thesis](https://github.com/creova-gif/CREOVA/blob/main/EAST-AFRICA-FINTECH-THESIS.md) for how they connect.

---

## Ecosystem context

This repo is one of three pieces of a broader East Africa fintech and creator-economy thesis, alongside `Gopay`, `Sauti-Os`, and `Kultr-Hub`. See [`EAST-AFRICA-FINTECH-THESIS.md`](https://github.com/creova-gif/CREOVA/blob/main/EAST-AFRICA-FINTECH-THESIS.md) in the CREOVA repo for how these connect — and an honest accounting of what's actually integrated today versus what's still conceptual.
