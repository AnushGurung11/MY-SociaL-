# Setting Up an Express API

## Installation

```bash
npm init -y
npm install express
npm install -D nodemon
npm install mongoose
npm install -D dotenv
npm install mocha chai --save-dev
```

## package.json Configuration

- `server.js` is the entry point of the API
- Scripts:
  ```json
  "dev": "nodemon server.js",
  "test": "mocha"
  ```
- Run tests with `npm run test` or `npm test`
- Change `"type": "commonjs"` to `"type": "module"` to use ES module syntax (`import`/`export`) instead of CommonJS (`require`)
- Create a `.env` file to store credentials and secrets

### Testing Stack
- **mocha** — the test runner (engine running the test)
- **chai** — provides the assertion syntax and expected behavior (gearbox, steering, brakes)

## Understanding package.json

- Basic project info is stored as key-value pairs in JSON format
- **dependencies** — packages required to run the API in production
- **devDependencies** — packages only needed during development (e.g. mocha, chai, nodemon)
- **scripts** — named commands for common tasks (`dev` to run the server, `test` to run mocha/chai)

### Semantic Versioning (SemVer)

Example: `^4.1.3`
- `4` — major version
- `.1` — minor version
- `.3` — patch version

| Symbol | Meaning |
|---|---|
| `^` | Accepts minor and patch updates, not major |
| `~` | Accepts only patch updates, not minor |
| (none) | Exact version required |
| `*` | Any version (wildcard) |

## Folder Structure (MVC Architecture)

Following **Model-View-Controller**, adapted for an API-only backend:

- **Model** — schema definitions for each object stored in the DB
- **View** — not used here; the frontend (React) handles this separately
- **Controller** — handles the business logic

### Additional Folders

- **middleware/** — reusable logic that runs on requests (e.g. checking if a user is logged in)
- **routes/** — maps URLs to their corresponding controllers
- **middleware/error/** — centralized error-handling middleware, making error logs consistent and reusable
- **config/** — connections to external services (database, OAuth providers, etc.)
- **utils/** — utility functions (password hashing, password checking, permission checks)
- **tests/** — mocha/chai unit test files
- **.env** — kept in the root directory; stores secret keys (API keys, JWT secret, etc.)