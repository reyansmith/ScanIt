# MediScan Technical Documentation

## Architecture

```text
React + Vite (localhost:5173)
        |
        | JSON REST + Bearer JWT + SSE
        v
Node.js + Express (localhost:8000)
        |-- in-memory users, profiles, scans, and posts
        |-- OpenFoodFacts -> optional Nutritionix fallback
        |-- deterministic MediVerdict rules
        `-- Groq JavaScript SDK (streaming)
```

The migration preserves the existing browser-facing contracts. There is no database service and no Python process. All stored application data is process-local and is cleared on restart.

## Backend layout

```text
backend/
|-- src/
|   |-- app.js                 Express application and global middleware
|   |-- server.js              Runtime entry point and graceful shutdown
|   |-- config.js              Environment configuration
|   |-- security.js            Headers, barcode validation, rate limiting
|   |-- store.js               In-memory entity store
|   |-- utils.js               IDs, timestamps, validation, HTTP errors
|   |-- middleware/auth.js     JWT creation and Bearer authentication
|   |-- routes/                HTTP controllers
|   `-- services/              Product, MediVerdict, and MediBot logic
|-- test/api.test.js           Contract and flow tests
|-- package.json
`-- Dockerfile
```

## API compatibility

All protected routes use `Authorization: Bearer <access_token>`. Unless shown otherwise, responses are JSON. Validation failures return HTTP 422 with a FastAPI-compatible `detail` field; explicit business-rule failures preserve their existing string details.

| Endpoint | Method | Request | Response | Auth | Stream |
|---|---|---|---|---:|---:|
| `/health` | GET | None | `{status, service}` | No | No |
| `/api/auth/register` | POST | `{email,password,full_name?}` | `{access_token,refresh_token,token_type}` | No | No |
| `/api/auth/login` | POST | `{email,password}` | Token response | No | No |
| `/api/auth/refresh` | POST | `{refresh_token}` | Rotated token response | No | No |
| `/api/profile` | GET | None | `{user,profile}` | Yes | No |
| `/api/profile` | PUT | Biometrics, activity, conditions, goals | `{message}` | Yes | No |
| `/api/profile/conditions` | GET | None | `{conditions}` | No | No |
| `/api/scan-product` | POST | `{barcode}` | `{scan_id,product,verdict,flags,alert_summaries}` | Yes | No |
| `/api/scan-product/:barcode` | GET | Barcode path parameter | `{product}` | Yes | No |
| `/api/scans/history` | GET | `page`, `per_page` | `{page,per_page,scans}` | Yes | No |
| `/api/dashboard/summary` | GET | None | Counts, recent scans, alerts | Yes | No |
| `/api/dashboard/progress` | GET | None | Seven-day averages and safe percentage | Yes | No |
| `/api/bot/chat` | POST | `{message,product_context?,chat_history?}` | SSE token events and `[DONE]` | Yes | Yes |
| `/api/community/posts` | GET | `category`, `page`, `per_page` | `{posts}` | Yes | No |
| `/api/community/posts` | POST | `{category,title,body,tags?,product_barcode?}` | `{id,message}` | Yes | No |
| `/api/community/posts/:postId/vote` | POST | `{direction:"up"|"down"}` | `{upvotes,downvotes}` | Yes | No |
| `/api/community/recipes` | GET | None | Compact recipe post list | Yes | No |
| `/api/community/symptoms` | GET | None | Compact symptom thread list | Yes | No |

### Important status codes

- Registration: 201; duplicate email: 400
- Invalid login, token, or refresh token: 401
- Missing product or community post: 404
- Schema or domain validation failure: 422
- Rate limit exceeded: 429 with `Retry-After`

## Authentication

Passwords are hashed with bcrypt. Access JWTs default to 60 minutes; refresh JWTs default to seven days. Tokens include `sub`, `type`, and `exp`, use the configured algorithm, and are accepted only for their intended purpose. Protected routes reject missing tokens with `Not authenticated` and invalid/expired tokens with `Invalid or expired token`.

Because storage is in-memory, all user accounts and therefore all active JWT identities become unusable after a backend restart.

## Validation

- Email: 3–255 characters, normalized to lowercase, basic address syntax
- Password: 8–128 characters for registration, no surrounding whitespace, common-password blocklist
- Profile: height 30–300 cm, weight 1–700 kg, age 1–130, supported activity/condition values
- Barcode: 3–50 characters; letters, numbers, dots, underscores, and hyphens only
- Community: title 5–160, body 1–5000, at most 10 tags, supported category and vote values
- MediBot message: 1–1000 characters; at most 20 history entries
- Pagination: page 1–1000; page sizes 1–100

## Product lookup and MediVerdict

OpenFoodFacts v2 is the primary product source. Nutritionix is used only when configured and OpenFoodFacts has no match. Both are normalized to the same product object, including ingredients, labels, allergens, and per-100g nutrients.

MediVerdict retains the original deterministic rules for diabetes, hypertension, cholesterol, CKD, celiac disease, nut/dairy allergies, and IBS/FODMAP sensitivity. No flags yields `SAFE`; one or two ordinary flags yields `CAUTION`; at least three flags or any hard allergen/gluten danger yields `DANGER`.

## MediBot and Groq

The backend uses the official `groq-sdk` package directly. The API key is read only from the backend environment. The existing system prompt, health context, product context, last-six-message handling, model setting, temperature `0.4`, and safety wording are preserved.

The response media type is `text/event-stream`. Each token is framed as:

```text
data: {"token":"..."}

```

The stream terminates with `data: [DONE]`. If Groq is not configured or fails before output begins, the existing deterministic MediBot fallback is streamed using the same protocol.

## Middleware and lifecycle

- CORS: configured origins; credentials allowed; GET, POST, PUT, OPTIONS; Authorization and Content-Type headers
- Security: nosniff, strict-origin referrer policy, frame denial, camera self permission
- Sliding-window, per-process rate limits match the previous route limits
- Production startup rejects a default or short `SECRET_KEY`
- SIGINT and SIGTERM close the HTTP server gracefully

There are no background tasks and no database startup/shutdown hooks.

## Dependencies

- `express` — HTTP routing and middleware
- `cors` — browser-origin policy
- `dotenv` — environment loading
- `bcryptjs` — password hashing without native build tooling
- `jsonwebtoken` — JWT signing and verification
- `groq-sdk` — official Groq streaming client
- `zod` — request and query validation

## Verification

Run:

```bash
cd backend
npm test
npm audit --omit=dev

cd ../frontend
npm run build
```

The contract suite covers health/security headers, registration/login/refresh, protected profiles, validation and auth errors, community posting/voting, dashboard shapes, a mocked provider scan through MediVerdict/history/dashboard, and MediBot SSE fallback framing.
