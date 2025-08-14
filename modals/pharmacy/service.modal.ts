// models/pharmacyService.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IPharmacyService extends Document {
  userId: mongoose.Types.ObjectId;
  category: string;
  medicineName: string;
  composition?: string; // stored as JSON string
  segment: "Over-the-Counter" | "Supplements" | "Prescription";
  suppliedAs: string[]; // e.g., Tablet, Capsule, Syrup
  mrp: number;
  per: "Strip" | "Bottles" | "Tube" | "Ampule" | "Vial" | "Other";
  size: string;
  image?: { url: string; public_id: string }[];
  description?: string;
  isAvailable?: boolean;
  lead?: boolean;
  location?: {
    type: "Point";
    coordinates?: [number, number];
    city?: string;
    state?: string;
    pincode?: string;
    address?: string;
    landmark?: string;
  };
  serviceType?: string;
}

// Keep location fully optional; DO NOT set a default "Point" when no coordinates
const LocationSubSchema = new Schema(
  {
    type: { type: String, enum: ["Point"] },
    coordinates: { type: [Number] },
    city: String,
    state: String,
    pincode: String,
    address: String,
    landmark: String,
  },
  { _id: false }
);

const pharmacyServiceSchema = new Schema<IPharmacyService>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true, default: "Pharmacy" },
    medicineName: {
      type: String,
      required: [true, "Please enter medicine name"],
    },
    composition: { type: String }, // JSON string
    segment: {
      type: String,
      enum: ["Over-the-Counter", "Supplements", "Prescription"],
      required: true,
    },
    suppliedAs: [{ type: String }],
    mrp: { type: Number, required: true },
    per: {
      type: String,
      enum: ["Strip", "Bottles", "Tube", "Ampule", "Vial", "Other"],
      required: true,
    },
    size: String,
    image: [
      {
        url: String,
        public_id: String,
      },
    ],
    description: String,
    isAvailable: { type: Boolean, default: true },
    lead: { type: Boolean, default: false },
    // IMPORTANT: make the whole subdocument optional; don't set defaults here
    location: { type: LocationSubSchema, default: undefined },
    serviceType: { type: String, default: "pharmacy" },
  },
  { timestamps: true }
);

// Auto-clean invalid location before validation to avoid 2dsphere errors
pharmacyServiceSchema.pre("validate", function (next) {
  const doc = this as any;
  if (
    doc.location &&
    (!Array.isArray(doc.location.coordinates) ||
      doc.location.coordinates.length !== 2 ||
      doc.location.coordinates.some(
        (n: any) => typeof n !== "number" || Number.isNaN(n)
      ))
  ) {
    doc.location = undefined;
  }
  next();
});

// Only index docs that actually have valid coordinates
pharmacyServiceSchema.index(
  { location: "2dsphere" },
  { partialFilterExpression: { "location.coordinates": { $type: "array" } } }
);

export const PharmacyServices =
  mongoose.models.PharmacyServices ||
  mongoose.model<IPharmacyService>("PharmacyServices", pharmacyServiceSchema);
