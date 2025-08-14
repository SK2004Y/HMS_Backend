import mongoose,{Document,Schema,Types} from "mongoose";

//services interface

export interface IResortServices {
  userId: mongoose.Types.ObjectId;
  category: string;
  roomTypes?: string[];
  acRoomPrice?: number;
  nonAcRoomPrice?: number;
  serviceName: string;
  price: number;
  priceDays: number;
  estimatedPrice?: number;
  image?: [
    {
      url: string;
      public_id: string;
    }
  ];
  video?: [
    {
      url: string;
      public_id: string;
    }
  ];
  description: string;
  reviews?: IReview;
  socialLink?: [ISocialLink];
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


const resortServiceSchema = new Schema<IResortServices>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
    },
    roomTypes: [
      {
        type: String,
      },
    ],
    acRoomPrice: {
      type: Number,
    },
    nonAcRoomPrice: {
      type: Number,
    },
    serviceName: {
      type: String,
      required: [true, "please enter a service name"],
    },
    price: {
      type: Number,
    },
    priceDays: {
      type: Number,
    },
    estimatedPrice: {
      type: Number,
    },
    image: [
      {
        url: {
          type: String,
        },
        public_id: {
          type: String,
        },
      },
    ],
    video: [
      {
        url: {
          type: String,
        },
        public_id: {
          type: String,
        },
      },
    ],

    description: {
      type: String,
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
      coordinates: { type: [Number] },
      city: String,
      state: String,
      pincode: String,
      address: String,
      landmark: String,
    },
    serviceType: {
      type: String,
      default: "wellness",
    },
  },
  { timestamps: true }
);

resortServiceSchema.index({ location: "2dsphere" });

export const WellnessTourService = mongoose.model<IResortServices>(
  "WellnessTourService",
  resortServiceSchema
);


