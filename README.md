# ElementPay Wallet Order App

A Next.js 13 app that simulates a wallet order system with mock APIs to create and retrieve order statuses dynamically.

---

## Features

- Create mock wallet orders via API
- Retrieve order status with realistic state transitions (created, processing, settled, failed)
- Built with Next.js 13 App Router and TypeScript
- Deployed on Vercel for seamless CI/CD

---

## API Endpoints

| Method | Endpoint                       | Description                      |
|--------|-------------------------------|---------------------------------|
| POST   | `/api/mock/orders/create`      | Creates a new mock order         |
| GET    | `/api/mock/orders/[order_id]`  | Retrieves order details/status   |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn
- Vercel CLI (optional, for local deployment)

### Installation

```bash
git clone https://github.com/Foxriver-2005/elementpay-wallet-order-app.git
cd elementpay-wallet-order-app
npm install
```
### Running Locally
```bash
npm run dev
```
Open http://localhost:3000 to view in the browser.

### Deployment
This project is deployed on Vercel. You can access the live app here:

[https://elementpay-wallet-order-app.vercel.app](https://elementpay-wallet-order-app-5ibg.vercel.app/)
