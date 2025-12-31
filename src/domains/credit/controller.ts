// controller.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import { Credit } from './model';
import { Tenant } from '../tenant/model';
import { AuthRequest } from '../../middleware/auth';

const earnRedeemSchema = z.object({
  amount: z.number().positive(),
  memo: z.string().optional(),
});

export const computeBalance = async (tenantId: string, orgId: string) => {
  const credits = await Credit.find({ tenantId, orgId }).sort({ createdAt: 1 });
  return credits.reduce((bal, txn) => {
    if (txn.type === 'REDEEM') return bal - txn.amount;
    return bal + txn.amount; // EARN or ADJUST (assume ADJUST can be + or - based on amount sign)
  }, 0);
};

export const earnCredit = async (req: AuthRequest, res: Response) => {
  const { id: tenantId } = req.params;
  const tenant = await Tenant.findOne({ _id: tenantId, orgId: req.user!.orgId });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  const data = earnRedeemSchema.parse(req.body);
  const credit = new Credit({
    orgId: req.user!.orgId,
    tenantId,
    unitId: tenant.unitId,
    type: 'EARN',
    amount: data.amount,
    memo: data.memo,
  });
  await credit.save();
  res.status(201).json(credit);
};

export const redeemCredit = async (req: AuthRequest, res: Response) => {
  const { id: tenantId } = req.params;
  if (req.user!.userId !== tenantId) return res.status(403).json({ error: 'Forbidden' }); // Tenant only for self

  const tenant = await Tenant.findOne({ _id: tenantId, orgId: req.user!.orgId });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  const data = earnRedeemSchema.parse(req.body);
  const balance = await computeBalance(tenantId, req.user!.orgId);
  if (balance < data.amount) return res.status(400).json({ error: 'Insufficient balance' });

  const credit = new Credit({
    orgId: req.user!.orgId,
    tenantId,
    unitId: tenant.unitId,
    type: 'REDEEM',
    amount: data.amount, // Positive, but we subtract in compute
    memo: data.memo,
  });
  await credit.save();
  res.status(201).json(credit);
};

export const getLedger = async (req: AuthRequest, res: Response) => {
  const { id: tenantId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (req.user!.role === 'tenant' && req.user!.userId !== tenantId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const filters = { tenantId, orgId: req.user!.orgId };
  const ledger = await Credit.find(filters)
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));
  res.json(ledger);
};

export const getBalance = async (req: AuthRequest, res: Response) => {
  const { id: tenantId } = req.params;
  if (req.user!.role === 'tenant' && req.user!.userId !== tenantId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const balance = await computeBalance(tenantId, req.user!.orgId);
  res.json({ balance });
};