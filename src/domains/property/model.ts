import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  address: { type: String, required: true },
  orgId: { type: String, required: true },
  nickname: { type: String },
}, { timestamps: true });

propertySchema.index({ orgId: 1 }); // For org-scoping queries

export const Property = mongoose.model('Property', propertySchema);