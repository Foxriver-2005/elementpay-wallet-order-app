'use client';

import { useEffect, useState } from 'react';

type ProcessingModalProps = {
  visible: boolean;
  onClose?: () => void;
};

export default function ProcessingModal({ visible }: ProcessingModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
    } else {
      const timeout = setTimeout(() => setShow(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [visible]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600 mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-2">Processing Order</h2>
        <p className="text-sm text-gray-600">Please wait while we finalize your order status...</p>
      </div>
    </div>
  );
}
