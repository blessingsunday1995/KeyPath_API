import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  unitNumber: { type: String, required: true },
  rent: { type: Number, required: true },
  orgId: { type: String, required: true }, // Denormalized for faster queries
}, { timestamps: true });

unitSchema.index({ propertyId: 1, orgId: 1 });

export const Unit = mongoose.model('Unit', unitSchema);