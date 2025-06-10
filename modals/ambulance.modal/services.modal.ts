import mongoose,{Document,Schema,Types} from "mongoose";

//services interface

export interface IAmbulanceServices {
  userId: mongoose.Types.ObjectId;
  serviceName: string;
  fee: number;
  estimatedPrice?: number;
  image?: {
    url: string;
    public_id: string;
  };
  mode: string;
  description: string;
  reviews?: IReview;
  socialLink?: [ISocialLink];
  isAvailable?: boolean;
  lead?: boolean;
  serviceType?: string; // e.g., "Consultation", "Surgery", etc.
  location?: {
    type: "Point";
    coordinates: [number, number];
    city?: string;
    state?: string;
    pincode?: string;
    address: string;
    landmark: string;
  };
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
export interface ISocialLink{
    platform:string;
    url:string;
}


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


const ambulanceServiceSchema = new Schema<IAmbulanceServices>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceName: {
      type: String,
      required: [true, "please enter a service name"],
    },
    fee: {
      type: Number,
      required: [true, "please enter a service price "],
    },
    estimatedPrice: {
      type: Number,
    },
    image: {
      url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    mode: {
      type: String,
      enum: ["Online", "Offline", "Hybrid", "InHome", "e-Clinic"],
    },
    description: {
      type: String,
      required: [true, "Please enter a something about servics"],
    },
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
      coordinates: { type: [Number], required: true },
      city: String,
      state: String,
      pincode: String,
      address: String,
      landmark: String,
    },
    serviceType: {
      type: String,
      default: "ambulance",
    },
  },
  { timestamps: true }
);

ambulanceServiceSchema.index({ location: "2dsphere" }); // Index for geospatial queries

export const AmbulanceService =mongoose.model<IAmbulanceServices>("AmbulanceService",ambulanceServiceSchema);


