# FX Trade Backend

A robust NestJS-powered backend designed for currency trading and multi-currency wallet management. It enables users to securely trade Naira (NGN) against international currencies (USD, EUR, GBP) using real-time FX rate integration.

## Features

- **User Authentication**: Secure registration and login using Argon2 hashing and JWT.
- **OTP Verification**: Email verification via 6-digit OTP codes with background processing.
- **Multi-Currency Wallets**: Support for NGN, USD, EUR, and more with real-time balance tracking.
- **Double-Entry Ledger System**: Professional bookkeeping for all transactions, ensuring a full audit trail and data integrity.
- **System Analytics**: Real-time insights into trading volumes, popular currency pairs, and user activity distribution.
- **Asynchronous Notifications**: Email templates (EJS) sent via Bull queues and Redis workers.
- **Real-time FX Rates**: Integration with external FX rate APIs, including Redis-based caching with **Stale-While-Revalidate (SWR)** strategy for high availability.
- **Idempotency & Reliability**: Duplicate handling for financial operations using `X-Idempotency-Key` and database transactions with row-level locking.

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [TypeORM](https://typeorm.io/)
- **Cache & Queue**: [Redis](https://redis.io/) with [Bull](https://github.com/OptimalBits/bull)
- **Authentication**: [Passport.js](https://www.passportjs.org/) (Local & JWT)
- **Templating**: [EJS](https://ejs.co/)

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- Redis

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

### Running the App

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

### Running Tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## API Endpoints

### Auth
- `POST /api/v1/auth/register` - Register user & send OTP
- `POST /api/v1/auth/verify` - Verify OTP & activate account
- `POST /api/v1/auth/login` - Authenticate & get JWT

### Wallet (Requires JWT & `X-Idempotency-Key` for POST)
- `GET /api/v1/wallet` - Get wallet balances
- `POST /api/v1/wallet/fund` - Fund wallet
- `POST /api/v1/wallet/convert` - Convert currencies using real-time rates
- `POST /api/v1/wallet/trade` - Trade currencies with a 1% platform fee

### FX Rates
- `GET /api/v1/fx/rates?base=NGN` - Get latest exchange rates (Cached with SWR)

### Transactions
- `GET /api/v1/transactions` - Get user transaction history
- `GET /api/v1/transactions/ledger` - Get detailed ledger entries (Internal audit log)

### Analytics (Requires JWT)
- `GET /api/v1/analytics/volume?currency=NGN&days=7` - Get total volume for a currency
- `GET /api/v1/analytics/popular-pairs` - Get the most traded currency pairs
- `GET /api/v1/analytics/activity` - Get platform activity distribution

## Performance & Resilience

- **Stale-While-Revalidate (SWR)**: The FX service implements an SWR strategy where stale rates are served instantly while a background refresh is triggered, ensuring zero-latency for users and high availability during API outages.
- **Retry Mechanism**: External FX API calls are wrapped in a robust retry logic with exponential backoff to handle transient network failures.
- **Atomic Operations**: All financial transactions use PostgreSQL's pessimistic row-level locking to prevent race conditions in multi-currency balance updates.

## Project Structure

```text
src/
├── common/           
│   ├── constants/    # Shared constants (Injection tokens)
│   ├── hash/         # Hashing service (Argon2)
│   ├── interceptors/ # Idempotency interceptor
│   ├── otp/          # OTP generation & validation
│   └── utils/        # Shared utilities (Template reader)
├── config/           # App configuration & environment loading
├── infrastructure/   
│   ├── cache/        # Redis service & module
│   └── database/     # TypeORM & database config
└── modules/          
    ├── analytics/    # System analytics & data aggregation
    ├── auth/         # Authentication logic, guards, & strategies
    ├── fx/           # Foreign exchange providers & service
    ├── notification/ # Background email processing & templates
    ├── transaction/  # Double-entry bookkeeping (Transactions & Ledgers)
    ├── user/         # User entity & module
    └── wallet/       # Wallet management & currency conversion
```

## License

This project is [MIT licensed](LICENSE).
