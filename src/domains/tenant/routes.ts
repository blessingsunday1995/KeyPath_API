// routes.ts
import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middleware/auth';
import { createTenant, getMyTenantProfile } from './controller';

const router = Router({ mergeParams: true }); // For /units/:id/tenants

router.post('/', authMiddleware, requireRole(['landlord', 'admin']), createTenant);
router.get('/me', authMiddleware, requireRole(['tenant']), getMyTenantProfile); // Separate route for /tenants/me

// Note: /tenants/me is mounted at root level in routes/index.ts
export default router;