import mongoose, { Document, Schema, Types } from "mongoose";

//services interface

export interface IReport {
  reportsname: string[];
  courierfee: number;
  persornfee: number;
}

export interface IPathologyServices {
  userId: mongoose.Types.ObjectId;
  category: string;
  serviceName: string;
  description: string;
  modes: string[];
  homeServicePrice: number;
  onlineServicePrice: number;
  reports: IReport[];
  image?: {
    url: string;
    public_id: string;
  };

  reviews?: IReview[];
  socialLink?: ISocialLink[];
  isAvailable?: boolean;
  lead?: boolean;
  location?: {
    type: "Point";
    coordinates?: [number, number];
    city?: string;
    state?: string;
    pincode?: string;
    address: string;
    landmark: string;
  };
  serviceType?: string; // e.g., "Consultation", "Surgery", etc.
}

//review interface
export interface IReview {
  userId: mongoose.Types.ObjectId;
  userType: "Patient" | "Doctor";
  rating: number;
  comment?: string;
  createdAt?: Date;
}

//social paltform interface
export interface ISocialLink {
  platform: string;
  url: string;
}

//IReport schema

export const ReportSchema = new mongoose.Schema<IReport>({
  reportsname: [
    {
      type: [String],
    },
  ],
  courierfee: {
    type: Number,
  },
  persornfee: {
    type: Number,
  },
});

//review Schema
export const ReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "reviews.userType",
  },
  userType: { type: String, required: true, enum: ["Patient", "Doctor"] },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
});

//socialLinkSchema
export const socialLinkSchema = new Schema<ISocialLink>(
  {
    platform: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const pathologyServiceSchema = new Schema<IPathologyServices>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: [true, "Please select Category"],
    },
    serviceName: {
      type: String,
      required: [true, "please enter a service name"],
    },
    onlineServicePrice: {
      type: Number,
      required: [true, "please enter a service price "],
    },
    
    image: {
      url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    modes: [
      {
        type: String,
      },
    ],
    homeServicePrice: {
      type: Number,
    },

    description: {
      type: String,
      required: [true, "Please enter a something about servics"],
    },
    reports: [ReportSchema],
    reviews: ReviewSchema,
    socialLink: socialLinkSchema,
    isAvailable: {
      type: Boolean,
      default: true,
    },
    lead: {
      type: Boolean,
      default: false,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number] },
      city: String,
      state: String,
      pincode: String,
      address: String,
      landmark: String,
    },
    serviceType: {
      type: String,
      default: "pathology",
    },
  },
  { timestamps: true }
);

pathologyServiceSchema.index({ location: "2dsphere" });
export const PathologyService = mongoose.model<IPathologyServices>(
  "PathologyService",
  pathologyServiceSchema
);



