# Sauti OS

**Artist and royalty management for musicians — airplay tracking, contracts, royalties, and event bookings in one platform.** (*Sauti* — Swahili for "voice.")

[![Status](https://img.shields.io/badge/status-active_development-yellow)]()
[![License](https://img.shields.io/badge/license-proprietary-red)]()

## Overview
Back-office tooling for independent artists and their managers.

## Problem
Independent artists lack the royalty administration, airplay tracking, and contract management that major-label rosters take for granted — particularly relevant in African music markets where royalty administration is fragmented across broadcasters, PROs, and manual tracking.

## Solution
Airplay tracking, royalty calculation and distribution, contract management, catalog management, and event bookings in one system.

## Key Capabilities
- Airplay tracking, artist/roster management
- Royalty calculation and distribution tracking
- Contract and catalog management, event bookings

## Architecture
Node.js, pnpm monorepo. `artifacts/api-server` is the real backend. Referenced in the [East Africa Fintech Thesis](https://github.com/creova-gif/creova/blob/main/EAST-AFRICA-FINTECH-THESIS.md) as a potential middle layer between artists and Kultr-Hub's payout system for royalty disbursement — that integration is proposed, not yet built.

## Technology Stack

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces |
| Backend | Node.js (`artifacts/api-server`) |

## Getting Started
```bash
git clone https://github.com/creova-gif/sauti-os.git
cd sauti-os
pnpm install
pnpm run build
```
Run locally: `pnpm --filter @workspace/sauti-os run dev` and `pnpm --filter @workspace/api-server run dev`.

## Project Status
Core routes implemented (airplay, artist, contracts, dashboard).

## Contributing
Private, proprietary CREOVA product.

## License
Proprietary — All Rights Reserved.

## Author / Organization
Built by [Justin Mafie](https://github.com/creova-gif) under CREOVA.

## Documentation
See `CLAUDE.md` and the [East Africa Fintech Thesis](https://github.com/creova-gif/creova/blob/main/EAST-AFRICA-FINTECH-THESIS.md) for the proposed (not yet built) integration with Kultr-Hub.
