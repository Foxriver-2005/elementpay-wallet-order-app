'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import ProcessingModal from '@/components/ProcessingModal';

type OrderFormData = {
  amount: number;
  currency: string;
  token: string;
  note?: string;
};

type OrderStatus = 'created' | 'processing' | 'settled' | 'failed' | 'timeout';

export default function OrderPage() {
  const { isConnected } = useAccount();

  const [formData, setFormData] = useState<OrderFormData>({
    amount: 0,
    currency: 'KES',
    token: 'USDC',
    note: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [orderId, setOrderId] = useState<string | null>(null);
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [finalized, setFinalized] = useState(false);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value,
    }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.amount || formData.amount <= 0) {
      errs.amount = 'Amount must be greater than 0';
    }
    if (!formData.currency) {
      errs.currency = 'Currency is required';
    }
    if (!formData.token) {
      errs.token = 'Token is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setFinalized(false);
    setStatus(null);

    try {
      const res = await fetch('/api/mock/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to create order');
      }

      const data = await res.json();
      setOrderId(data.order_id);
      setStatus('created');
      startPolling(data.order_id);

    } catch (error) {
      console.error(error);
      alert('Error creating order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Polling logic
  const startPolling = (orderId: string) => {
  let elapsed = 0;
  const interval = setInterval(async () => {
    if (finalized) {
      clearInterval(interval);
      return;
    }

    try {
      // First, try to check webhook store via API
      const webhookRes = await fetch(`/api/mock/orders/webhook-status?id=${orderId}`);
      if (webhookRes.ok) {
        const { status: hookStatus } = await webhookRes.json();
        if (hookStatus === 'settled' || hookStatus === 'failed') {
          setStatus(hookStatus);
          setFinalized(true);
          clearInterval(interval);
          return;
        }
      }

      // If webhook hasn't settled, poll the order endpoint
      const res = await fetch(`/api/mock/orders/${orderId}`);
      if (!res.ok) return;

      const data = await res.json();
      setStatus(data.status);

      if (data.status === 'settled' || data.status === 'failed') {
        setFinalized(true);
        clearInterval(interval);
      }
    } catch (err) {
      console.error(err);
    }

    elapsed += 3;
    if (elapsed >= 60) {
      setStatus('timeout');
      setFinalized(true);
      clearInterval(interval);
    }
  }, 3000);
};

  const reset = () => {
    setFormData({ amount: 0, currency: 'KES', token: 'USDC', note: '' });
    setErrors({});
    setOrderId(null);
    setStatus(null);
    setFinalized(false);
  };

  if (!isConnected) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen">
        <p className="mb-4">Please connect your wallet to create an order.</p>
      </main>
    );
  }

  const showModal = !finalized && (status === 'created' || status === 'processing');

  return (
    <>
    <ProcessingModal visible={showModal} />
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Create Order</h1>

      {/* FORM */}
      {!finalized && (
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="amount" className="block font-semibold mb-1">Amount</label>
            <input
              id="amount"
              name="amount"
              type="number"
              min={1}
              value={formData.amount}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              disabled={isSubmitting}
            />
            {errors.amount && <p className="text-red-600 text-sm mt-1">{errors.amount}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="currency" className="block font-semibold mb-1">Currency</label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              disabled={isSubmitting}
            >
              <option value="KES">KES</option>
            </select>
            {errors.currency && <p className="text-red-600 text-sm mt-1">{errors.currency}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="token" className="block font-semibold mb-1">Token</label>
            <select
              id="token"
              name="token"
              value={formData.token}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              disabled={isSubmitting}
            >
              <option value="USDC">USDC</option>
            </select>
            {errors.token && <p className="text-red-600 text-sm mt-1">{errors.token}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="note" className="block font-semibold mb-1">Note (optional)</label>
            <input
              id="note"
              name="note"
              type="text"
              value={formData.note}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating Order...' : 'Create Order'}
          </button>
        </form>
      )}

      {/* STATUS UI */}
      {orderId && (
        <div className="mt-6 p-4 border rounded shadow bg-gray-50">
          <p className="font-semibold">Order ID: {orderId}</p>
          <p>Status: <span className="font-mono">{status}</span></p>

          {status === 'settled' && (
            <p className="text-green-600 font-bold mt-2">Order settled</p>
          )}

          {status === 'failed' && (
            <p className="text-red-600 font-bold mt-2">Order failed</p>
          )}

          {status === 'timeout' && (
            <div className="mt-2">
              <p className="text-yellow-600 font-bold">Timed out – try again</p>
              <button
                onClick={reset}
                className="text-blue-600 underline text-sm mt-1"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}
    </main>
    </>
  );
}
