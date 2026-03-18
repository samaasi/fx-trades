# FX Trade Backend

A robust NestJS-powered backend designed for currency trading and multi-currency wallet management. It enables users to securely trade Naira (NGN) against international currencies (USD, EUR, GBP) using real-time FX rate integration.

## Features

- **User Authentication**: Secure registration and login using Argon2 hashing and JWT.
- **OTP Verification**: Email verification via 6-digit OTP codes with background processing.
- **Multi-Currency Wallets**: Support for NGN, USD, EUR, and more (in progress).
- **Asynchronous Notifications**: Email templates (EJS) sent via Bull queues and Redis.
- **Real-time FX Rates**: Integration with external FX rate APIs.

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
   cp .env.example .env # Use the provided .env structure
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

## API Endpoints

### Auth
- `POST /api/v1/auth/register` - Register user & send OTP
- `POST /api/v1/auth/verify` - Verify OTP & activate account
- `POST /api/v1/auth/login` - Authenticate & get JWT

### Wallet (In Progress)
- `GET /api/v1/wallet` - Get wallet balances
- `POST /api/v1/wallet/fund` - Fund wallet
- `POST /api/v1/wallet/convert` - Convert currencies

## Project Structure

```text
src/
├── common/           # Shared utilities, services (OTP, Hash, Utils)
├── config/           # App configuration
├── infrastructure/   # Database, Cache (Redis)
└── modules/          # Feature modules (Auth, User, Notification)
```

## License

This project is [MIT licensed](LICENSE).
