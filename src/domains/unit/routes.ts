// routes.ts
import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middleware/auth';
import { createUnit, getUnits } from './controller';

const router = Router({ mergeParams: true }); // For /properties/:id/units

router.post('/', authMiddleware, requireRole(['landlord', 'admin']), createUnit);
router.get('/', authMiddleware, requireRole(['landlord', 'admin']), getUnits);

export default router;