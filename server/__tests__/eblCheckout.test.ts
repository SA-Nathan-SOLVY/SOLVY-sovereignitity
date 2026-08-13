import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import supertest from 'supertest';

// Mock the Stripe client module before importing the app so the EBL checkout
// endpoint never touches the real Stripe API. checkout.sessions.create returns a
// deterministic fake session; the spy lets us assert the metadata we send.
const createSession = vi.fn();
vi.mock('../stripeClient', () => ({
  getUncachableStripeClient: vi.fn(async () => ({
    checkout: { sessions: { create: createSession } },
  })),
  getStripePublishableKey: vi.fn(async () => 'pk_test_fake'),
  getStripeSync: vi.fn(async () => ({})),
  getStripeSecretKey: vi.fn(async () => 'sk_test_fake'),
}));

const { app, pool, initDatabase } = await import('../index');

beforeAll(async () => {
  await initDatabase();
});

afterAll(async () => {
  await pool.end();
});

beforeEach(() => {
  createSession.mockReset();
  createSession.mockResolvedValue({
    id: 'cs_test_123',
    url: 'https://checkout.stripe.com/c/pay/cs_test_123',
  });
});

describe('POST /api/ebl/checkout — validation', () => {
  it('rejects a missing serviceType with 400', async () => {
    const res = await supertest(app)
      .post('/api/ebl/checkout')
      .send({ amount: 25 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(createSession).not.toHaveBeenCalled();
  });

  it('rejects an unknown serviceType with 400', async () => {
    const res = await supertest(app)
      .post('/api/ebl/checkout')
      .send({ serviceType: 'not-a-real-service', amount: 25 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(createSession).not.toHaveBeenCalled();
  });

  it('rejects an amount under $0.50 with 400', async () => {
    const res = await supertest(app)
      .post('/api/ebl/checkout')
      .send({ serviceType: 'hair', amount: 0.25 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/0\.50/);
    expect(createSession).not.toHaveBeenCalled();
  });

  it('rejects a non-numeric amount with 400', async () => {
    const res = await supertest(app)
      .post('/api/ebl/checkout')
      .send({ serviceType: 'hair', amount: 'free' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(createSession).not.toHaveBeenCalled();
  });
});

describe('POST /api/ebl/checkout — happy path', () => {
  it('returns { success: true, url } and sends correct metadata to Stripe', async () => {
    const res = await supertest(app)
      .post('/api/ebl/checkout')
      .send({
        serviceType: 'hair',
        amount: 45,
        customerName: 'Jane Doe',
        customerPhone: '555-123-4567',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.url).toBe('https://checkout.stripe.com/c/pay/cs_test_123');

    expect(createSession).toHaveBeenCalledTimes(1);
    const args = createSession.mock.calls[0][0];
    expect(args.mode).toBe('payment');
    expect(args.line_items[0].price_data.unit_amount).toBe(4500);
    expect(args.metadata).toMatchObject({
      paymentType: 'ebl_service',
      serviceType: 'hair',
      customerName: 'Jane Doe',
      customerPhone: '555-123-4567',
    });
    expect(args.success_url).toContain('session_id={CHECKOUT_SESSION_ID}');
    expect(args.cancel_url).toBeTruthy();
  });

  it('sanitizes markup/control characters out of customer fields before they reach Stripe', async () => {
    const res = await supertest(app)
      .post('/api/ebl/checkout')
      .send({
        serviceType: 'hair',
        amount: 30,
        customerName: '<script>alert(1)</script>Eva',
        customerPhone: '555\u0000-000',
      });

    expect(res.status).toBe(200);
    const args = createSession.mock.calls[0][0];
    expect(args.metadata.customerName).not.toContain('<');
    expect(args.metadata.customerName).not.toContain('>');
    expect(args.metadata.customerName).toContain('Eva');
    expect(args.metadata.customerPhone).not.toContain('\u0000');
  });
});
