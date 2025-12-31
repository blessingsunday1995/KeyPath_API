// controller.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import { Tenant } from './model';
import { Unit } from '../unit/model';
import { AuthRequest } from '../../middleware/auth';

const tenantSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export const createTenant = async (req: AuthRequest, res: Response) => {
  const { id: unitId } = req.params;
  const unit = await Unit.findOne({ _id: unitId, orgId: req.user!.orgId });
  if (!unit) return res.status(404).json({ error: 'Unit not found' });

  const data = tenantSchema.parse(req.body);
  const tenant = new Tenant({ ...data, unitId, orgId: req.user!.orgId });
  await tenant.save();
  res.status(201).json(tenant);
};

export const getMyTenantProfile = async (req: AuthRequest, res: Response) => {
  const tenant = await Tenant.findOne({ _id: req.user!.userId, orgId: req.user!.orgId }).populate('unitId', 'unitNumber rent');
  if (!tenant) return res.status(404).json({ error: 'Not found' });
  res.json(tenant);
};

export const getTenantById = async (req: AuthRequest, res: Response) => { // For admin/landlord use in credits
  const tenant = await Tenant.findOne({ _id: req.params.id, orgId: req.user!.orgId });
  if (!tenant) return res.status(404).json({ error: 'Not found' });
  return tenant;
};