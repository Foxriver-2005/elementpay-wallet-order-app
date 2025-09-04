type FinalOrderStatus = 'settled' | 'failed';

type WebhookRecord = {
  status: FinalOrderStatus;
  receivedAt: number;
};

const webhookMap = new Map<string, WebhookRecord>();

export const webhookStore = {
  save(orderId: string, status: FinalOrderStatus) {
    webhookMap.set(orderId, { status, receivedAt: Date.now() });
  },
  get(orderId: string): WebhookRecord | undefined {
    return webhookMap.get(orderId);
  },
  clear(orderId: string) {
    webhookMap.delete(orderId);
  }
};
