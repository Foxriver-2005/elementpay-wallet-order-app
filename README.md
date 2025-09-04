# ElementPay Wallet Order App

A **Next.js 13** app that simulates a wallet order system with mock APIs to create and retrieve order statuses dynamically. Built with **TypeScript**, **App Router**, **RainbowKit**, and **Wagmi**. 

---

## Features

-  Multi-wallet connect/disconnect (MetaMask, WalletConnect)
-  Create mock wallet orders via a simple form
-  Poll for order status updates (with realistic transitions)
-  Listen to webhook events for order finalization
-  First final state (poll or webhook) wins, UI is idempotent
-  Deployed on Vercel

---

## How to Use

1. Connect your wallet on the homepage (`/`).
2. After successful connection, navigate to [`/order`](https://elementpay-wallet-order-app.vercel.app/order) to fill out the form and create a new order.
3. The app will show a "Processing" modal and:
   - Poll the backend every 3 seconds.
   - Listen for webhook updates.
   - Stop both when the order reaches a final state (`settled` or `failed`).

---

## API Endpoints

| Method | Endpoint                         | Description                     |
|--------|----------------------------------|---------------------------------|
| POST   | `/api/mock/orders/create`        | Creates a new mock order        |
| GET    | `/api/mock/orders/[order_id]`    | Retrieves order status          |
| POST   | `/api/webhooks/elementpay`       | Receives webhook events         |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm or yarn
- Vercel CLI (optional)

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
Open http://localhost:3000 in your browser.

### .env.example

Create a .env.local file and add:
```bash
# .env.local
WEBHOOK_SECRET=shh_super_secret
```
## Webhook Test Examples

### Valid Signature
```bash
curl -X POST http://localhost:3000/api/webhooks/elementpay \
-H 'Content-Type: application/json' \
-H 'X-Webhook-Signature: t=1710000000,v1=3QXTcQv0m0h4QkQ0L0w9ZsH1YFhZgMGnF0d9Xz4P7nQ=' \
-d '{"type":"order.settled","data":{"order_id":"ord_0xabc123","status":"settled"}}'
```
### Invalid Signature
```bash
curl -X POST http://localhost:3000/api/webhooks/elementpay \
-H 'Content-Type: application/json' \
-H 'X-Webhook-Signature: t=1710000300,v1=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=' \
-d '{"type":"order.failed","data":{"order_id":"ord_0xabc123","status":"failed"}}'
```
### Expired Timestamp
```bash
curl -X POST http://localhost:3000/api/webhooks/elementpay \
-H 'Content-Type: application/json' \
-H 'X-Webhook-Signature: t=1709990000,v1=3QXTcQv0m0h4QkQ0L0w9ZsH1YFhZgMGnF0d9Xz4P7nQ=' \
-d '{"type":"order.processing","data":{"order_id":"ord_0xabc123","status":"processing"}}'
```

## Assumptions
1. Mock API stores orders in-memory (Map) — resets on server restart.
2. Final state is determined by either: (Polling result or Webhook payload)
3. First one to finalize wins; duplicates are ignored.
4. Polling runs for 60 seconds max (every 3 seconds).

## Architecture Notes
Next.js App Router + TypeScript for frontend and API logic.

RainbowKit + Wagmi for wallet integrations (MetaMask & WalletConnect).

Mock order storage in-memory (Map) inside route handler files.

Webhook verification via HMAC SHA256 (crypto.subtle.importKey, etc).

Webhook and polling logic run concurrently until the order is finalized.

Reusable hooks & components used for polling, status display, etc.

## Live Deployment

This project is deployed on Vercel. You can access the live app here:

 [https://elementpay-wallet-order-app.vercel.app](https://elementpay-wallet-order-app-5ibg.vercel.app/)

Go to:

/ → Wallet Connect

/order → Order Form
