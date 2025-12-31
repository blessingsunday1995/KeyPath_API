import mongoose from 'mongoose';

const creditSchema = new mongoose.Schema({
  orgId: { type: String, required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  type: { type: String, enum: ['EARN', 'ADJUST', 'REDEEM'], required: true },
  amount: { type: Number, required: true }, // Positive for EARN/ADJUST(add), negative for REDEEM/ADJUST(subtract)
  memo: { type: String },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: false }); // Use createdAt field instead

creditSchema.index({ tenantId: 1, orgId: 1, createdAt: -1 }); // For ledger queries and balance calc

export const Credit = mongoose.model('OwnershipCreditTransaction', creditSchema);