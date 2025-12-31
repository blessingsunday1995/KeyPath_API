# KeyPath Backend Technical Test

A full-featured Node.js + Express + TypeScript REST API implementing property management with ownership credits ledger, built for the KeyPath backend technical test (v2).

## Features

- **Node.js + Express** with full **TypeScript** support
- **MongoDB** (Atlas compatible) via Mongoose
- Input validation with **Zod**
- Modular feature-folder structure
- Lightweight JWT authentication + stub support for Clerk/Auth0 via headers (`x-user-id`, `x-org-id`, `x-role`)
- Strict **organization scoping** on every endpoint (no data leaks)
- **Append-only** ownership credits ledger
- Computed balance (no stored balance field)
- Role-based access: `tenant | landlord | admin`
- Pagination and basic filters (city/state) on property list
- 3 Jest integration tests covering:
  - Org/auth scoping
  - Redeem rule enforcement
  - Balance derivation from ledger

## API Endpoints (Base URL: `/api`)

### Properties
- `POST /properties` → Create property (landlord/admin)
- `GET /properties` → List with pagination + filters (`?page`, `?limit`, `?city`, `?state`)
- `GET /properties/:id` → Get single property (org-scoped)

### Units
- `POST /properties/:id/units` → Create unit (landlord/admin)
- `GET /properties/:id/units` → List units for property (landlord/admin)

### Tenants
- `POST /units/:id/tenants` → Create tenant (landlord/admin)
- `GET /tenants/me` → Get own profile + basic unit info (tenant only)

### Ownership Credits Ledger
- `POST /tenants/:id/credits/earn` → Award credits (landlord/admin)
- `POST /tenants/:id/credits/redeem` → Spend credits (tenant only, cannot exceed balance)
- `GET /tenants/:id/credits/ledger` → View transaction history with pagination  
  (tenant sees only self; landlord/admin sees any in their org)
- `GET /tenants/:id/credits/balance` → Computed current balance

## Setup & Running Locally

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas cluster (or local MongoDB)
- (Optional for bonus) Redis instance

### Installation
```bash
git clone <your-repo-url>
cd keypath-backend
npm install
```

### Environment Variables
Create a `.env` file in the root:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/keypath?retryWrites=true&w=majority
JWT_SECRET=your-strong-secret-here
REDIS_URL=redis://localhost:6379  # Optional, for bonus job
PORT=3000
```

### Run Development Server
```bash
npm run dev
```

Server will start at `http://localhost:3000`

### Run Tests
```bash
npm run test
```

All 3 required integration tests should pass using in-memory MongoDB.

## Authentication (Testing)

For manual testing (Postman/curl), use these headers:

| Header       | Value Example       | Description                          |
|--------------|---------------------|--------------------------------------|
| x-user-id    | admin1              | User ID                              |
| x-org-id     | org123              | Organization ID                      |
| x-role       | admin / landlord / tenant | Role determines permissions |

In production, replace with real JWT middleware or integrate Clerk/Auth0.

## Trade-offs & Design Decisions

- **Mongoose** chosen for schema validation and easy Atlas compatibility (vs raw driver)
- **OrgId denormalized** on sub-documents (units, tenants, credits) for fast scoping queries
- **Balance computed on read** → always accurate, no race conditions; acceptable for expected ledger size
- **No stored balance field** → enforces append-only rule perfectly
- **Simple regex filters** for city/state on address field (could be improved with text index)
- **In-memory MongoDB for tests** → fast, isolated, no dependency on external DB
- **Header-based auth stub** → easy testing; ready to swap with real JWT/Clerk

## If I Had More Time…

- Implement full OpenAPI/Swagger documentation
- Add comprehensive unit + e2e test coverage
- Add rate limiting and better error logging (Winston)
- Implement ADJUST transaction type for corrections
- Cache computed balances in Redis for performance
- Add Docker + docker-compose for easy deployment
- Integrate real Clerk/Auth0 authentication
- Add more advanced filters and search (MongoDB text index)
- Implement the bonus BullMQ valuation snapshot job (already partially prepared)

## Postman Collection

A complete Postman collection with all endpoints and example headers is included in the repository:
- `KeyPath API.postman_collection.json`

Import it into Postman for quick testing.

---

**Submitted by: [Your Name]**  
**Date: December 31, 2025** 🎉

Thank you for the opportunity — enjoyed building this!
