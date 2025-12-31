// controller.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import { Unit } from './model';
import { Property } from '../property/model';
import { AuthRequest } from '../../middleware/auth';

const unitSchema = z.object({
  unitNumber: z.string().min(1),
  rent: z.number().positive(),
});

export const createUnit = async (req: AuthRequest, res: Response) => {
  const { id: propertyId } = req.params;
  const property = await Property.findOne({ _id: propertyId, orgId: req.user!.orgId });
  if (!property) return res.status(404).json({ error: 'Property not found' });

  const data = unitSchema.parse(req.body);
  const unit = new Unit({ ...data, propertyId, orgId: req.user!.orgId });
  await unit.save();
  res.status(201).json(unit);
};

export const getUnits = async (req: AuthRequest, res: Response) => {
  const { id: propertyId } = req.params;
  const units = await Unit.find({ propertyId, orgId: req.user!.orgId });
  res.json(units);
};