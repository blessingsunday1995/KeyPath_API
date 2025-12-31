import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  orgId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
}, { timestamps: true });

tenantSchema.index({ orgId: 1, unitId: 1 });

export const Tenant = mongoose.model('Tenant', tenantSchema);