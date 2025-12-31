// routes.ts
import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middleware/auth';
import { earnCredit, redeemCredit, getLedger, getBalance } from './controller';

const router = Router();

router.post('/:id/credits/earn', authMiddleware, requireRole(['landlord', 'admin']), earnCredit);
router.post('/:id/credits/redeem', authMiddleware, requireRole(['tenant']), redeemCredit);
router.get('/:id/credits/ledger', authMiddleware, getLedger);
router.get('/:id/credits/balance', authMiddleware, getBalance);

export default router;