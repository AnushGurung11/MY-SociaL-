# MySocial — social platform API

![CI](https://github.com/AnushGurung11/MY-SociaL-/actions/workflows/ci.yml/badge.svg?branch=main)
![Node](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![Postgres](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?logo=postgresql&logoColor=white)
![license](https://img.shields.io/badge/license-ISC-blue)

A REST and WebSocket API for a listings-and-social app: users publish listings, attach media,
comment, like, favourite, and message each other. Built with an explicit four-layer
architecture so business logic never lives in a route handler.

> This README replaces an earlier one that described MongoDB/Mongoose. The API moved to
> PostgreSQL with Prisma; the old description was simply wrong.

## Architecture

```mermaid
flowchart LR
    R[Routes<br/>Express routers] --> C[Controllers<br/>HTTP in, HTTP out]
    C --> S[Services<br/>business rules]
    S --> P[Repositories<br/>Prisma queries]
    P --> DB[(PostgreSQL)]
    C --> E[Error classes<br/>+ error middleware]
    SOCK[Socket.IO gateway] --> S
```

| Layer | Responsibility | Example |
|---|---|---|
| `routes/` | URL to controller mapping, auth middleware | `postRoutes.js`, `commentRoutes.js` |
| `controller/` | Parse request, call service, shape response | `auth.controller.js` |
| `services/` | Rules that must hold regardless of transport | listing, comment, like, conversation |
| `repository/` | The only place Prisma is called | `listingRepository.js`, `messageRepository.js` |
| `error/` | Typed HTTP errors (`NotFound`, `Conflict`, `Unauthorized`, …) | `error/*.js` |

## Data model

Nine Prisma models: `User`, `Category`, `Listing`, `ListingMedia`, `Comment`, `Like`,
`Favorite`, `Conversation`, `Message`.

A listing belongs to a user and a category, has many media rows, comments, likes, and
favourites. Conversations are pairwise and hold messages. See `prisma/schema.prisma` and the
longer notes in `docs/schema.md` and `docs/projectArchitecture.md`.

## API surface

| Prefix | Resource |
|---|---|
| `/auth` | register, login, refresh, logout |
| `/posts` | listings: create, list, update, delete |
| `/comments` | comments on a listing |
| `/users` | profile, favourites, conversations |

Auth is JWT in an HTTP-only cookie. Passwords are hashed with bcrypt. Request bodies are
validated with Zod before reaching a service. Socket.IO is attached in `config/socket.js` for
conversation events.

## Running locally

**Requirements:** Node.js 20+, PostgreSQL 14+ (or a Supabase project).

```bash
npm install                 # runs prisma generate via postinstall
cp .env.example .env        # if absent, create the variables listed below
npx prisma migrate dev
npm run dev                 # nodemon, http://localhost:3000
```

Environment variables:

```ini
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/mysocial
JWT_SECRET=change-me
JWT_EXPIRES_IN=7d
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

## Testing and tooling

```bash
npm test            # Jest, tests/unit/repository/*
npm run lint        # ESLint
npx prisma studio   # inspect data
```

Husky runs ESLint on staged files and commitlint enforces conventional commits. CI runs on
every push and pull request to `main`.

Repository tests are the current focus; service-level tests are the next gap to close.

## Project structure

```text
config/       database and socket setup
controller/   request handlers
docs/         architecture, schema, contributing notes
error/        typed error classes
middleware/   auth and error handling
prisma/       schema and migrations
repository/   data access (the only Prisma consumer)
routes/       route definitions
services/     domain logic
socket/       realtime events
tests/        Jest tests
validation/   Zod schemas
utils/        helpers
```

## Status

Active. The listing/comment/like flows are implemented and tested at the repository layer;
messaging is wired through Socket.IO but has no end-to-end test yet. Media upload is modelled
in the schema, not yet exposed through an endpoint.

## License

ISC
