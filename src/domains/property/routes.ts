import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middleware/auth';
import { createProperty, getProperties, getPropertyById } from './controller';

const router = Router();

router.post('/', authMiddleware, requireRole(['landlord', 'admin']), createProperty);
router.get('/', authMiddleware, requireRole(['landlord', 'admin']), getProperties);
router.get('/:id', authMiddleware, getPropertyById); // Scoped to any role, but org-checked

export default router;