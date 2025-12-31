import { Request, Response } from 'express';
import { z } from 'zod';
import { Property } from './model';
import { AuthRequest } from '../../middleware/auth'; // Adjust path if needed

const propertySchema = z.object({
  address: z.string().min(1),
  nickname: z.string().optional(),
});

export const createProperty = async (req: AuthRequest, res: Response) => {
  try {
    const data = propertySchema.parse(req.body);
    const property = new Property({ ...data, orgId: req.user!.orgId });
    await property.save();
    res.status(201).json(property);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const getProperties = async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, city, state } = req.query;
  const filters: any = { orgId: req.user!.orgId };
  if (city) filters.address = { $regex: city as string, $options: 'i' }; // Simple filter example
  if (state) filters.address = { ...filters.address, $regex: state as string, $options: 'i' };

  const properties = await Property.find(filters)
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));
  res.json(properties);
};

export const getPropertyById = async (req: AuthRequest, res: Response) => {
  const property = await Property.findOne({ _id: req.params.id, orgId: req.user!.orgId });
  if (!property) return res.status(404).json({ error: 'Not found' });
  res.json(property);
};