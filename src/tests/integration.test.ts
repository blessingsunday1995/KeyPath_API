// src/tests/integration.test.ts

import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import { Property } from '../domains/property/model';
import { Unit } from '../domains/unit/model';
import { Tenant } from '../domains/tenant/model';
import { Credit } from '../domains/credit/model';

let mongoServer: MongoMemoryServer;

const adminHeaders = {
  'x-user-id': 'admin1',
  'x-org-id': 'org123',
  'x-role': 'admin',
};

const tenantHeaders = (tenantId: string) => ({
  'x-user-id': tenantId,
  'x-org-id': 'org123',
  'x-role': 'tenant',
});

const otherOrgAdminHeaders = {
  'x-user-id': 'admin2',
  'x-org-id': 'org999',
  'x-role': 'admin',
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 30000); // Increase timeout for startup

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Property.deleteMany({});
  await Unit.deleteMany({});
  await Tenant.deleteMany({});
  await Credit.deleteMany({});
});

describe('KeyPath Technical Test - Required Jest Tests', () => {

  test('should prevent accessing property from another organization', async () => {
    const propertyRes = await request(app)
      .post('/api/properties')
      .set(adminHeaders)
      .send({ address: 'Scoped Property' });

    const propertyId = propertyRes.body._id;

    const res = await request(app)
      .get(`/api/properties/${propertyId}`)
      .set(otherOrgAdminHeaders);

    expect(res.status).toBe(404);
  }, 10000);

  test('should prevent tenant from redeeming more than balance', async () => {
    const propertyRes = await request(app).post('/api/properties').set(adminHeaders).send({ address: 'Test Prop' });
    const unitRes = await request(app)
      .post(`/api/properties/${propertyRes.body._id}/units`)
      .set(adminHeaders)
      .send({ unitNumber: '101', rent: 1200 });

    const tenantRes = await request(app)
      .post(`/api/units/${unitRes.body._id}/tenants`)
      .set(adminHeaders)
      .send({ name: 'Test Tenant', email: 'test@example.com' });

    const tenantId = tenantRes.body._id;

    await request(app)
      .post(`/api/tenants/${tenantId}/credits/earn`)
      .set(adminHeaders)
      .send({ amount: 100, memo: 'Initial earn' });

    const res = await request(app)
      .post(`/api/tenants/${tenantId}/credits/redeem`)
      .set(tenantHeaders(tenantId))
      .send({ amount: 150, memo: 'Overspend' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Insufficient balance');
  }, 15000);

  test('should correctly compute balance from ledger transactions', async () => {
    const propertyRes = await request(app).post('/api/properties').set(adminHeaders).send({ address: 'Balance Test' });
    const unitRes = await request(app)
      .post(`/api/properties/${propertyRes.body._id}/units`)
      .set(adminHeaders)
      .send({ unitNumber: '202', rent: 1800 });

    const tenantRes = await request(app)
      .post(`/api/units/${unitRes.body._id}/tenants`)
      .set(adminHeaders)
      .send({ name: 'Balance Tenant', email: 'balance@example.com' });

    const tenantId = tenantRes.body._id;

    await request(app)
      .post(`/api/tenants/${tenantId}/credits/earn`)
      .set(adminHeaders)
      .send({ amount: 200, memo: 'Big earn' });

    await request(app)
      .post(`/api/tenants/${tenantId}/credits/redeem`)
      .set(tenantHeaders(tenantId))
      .send({ amount: 70, memo: 'Valid redeem' });

    const balanceRes = await request(app)
      .get(`/api/tenants/${tenantId}/credits/balance`)
      .set(adminHeaders);

    expect(balanceRes.body.balance).toBe(130);
  }, 15000);
});