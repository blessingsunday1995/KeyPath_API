import { Router } from 'express';
import propertyRoutes from '../domains/property/routes';
import unitRoutes from '../domains/unit/routes';
import tenantRoutes from '../domains/tenant/routes'; // For /units/:id/tenants
import creditRoutes from '../domains/credit/routes';
import { getMyTenantProfile } from '../domains/tenant/controller'; // For /tenants/me
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

router.use('/properties', propertyRoutes);
router.use('/properties/:id/units', unitRoutes);
router.use('/units/:id/tenants', tenantRoutes);
router.use('/tenants', creditRoutes); // Mount credits under /tenants/:id/...
router.get('/tenants/me', authMiddleware, requireRole(['tenant']), getMyTenantProfile);

export default router;