import mongoose,{ Document,Schema } from "mongoose";

export interface ISocialInteraction{

    camps:string;
    awareness:string[];
    programs:string[];
    outreach:string;
    donations:string;  // for payment integration
    images:string[];
}





export interface ISocialLink {
  platform: string;  //like facebook, insta,twitter and so on..
  url: string;
}
export interface IResortReview {
  userId: mongoose.Types.ObjectId;
  userType: "Patient" | "Doctor";
  rating: number;
  comment?: string;
  createdAt?: Date;
}

export interface IResort extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  image?: {
    url:string,
    public_id:string;
  }; //clinic picture
  bio?: string; //about clinic 
  location: {
    type: "Point";
    coordinates: [number, number];
    city?: string;
    state?: string;
    pincode?: string;
    address:string;
    landmark:string;
  };

  isApproved: boolean;   
  onlineStatus: boolean;
  status: "active" | "inactive";
  charge: number;
  chargeoffer?: number;
  socketId:string; 
  socialLinks?: ISocialLink[];
  reviews?: IResort[];
 
}



//sub schema


const resortReviewSchema = new mongoose.Schema({
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


const socialLinkSchema = new Schema<ISocialLink>(
  {
    platform: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const resortSchema = new Schema<IResort>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },

   image: {
    url:String,
    public_id:String,
   },
    bio: String,
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
      address:String,
      landmark:String,
    },
    isApproved: { type: Boolean, default: false },
    onlineStatus: { type: Boolean, default: false },
    socketId: String, //for communication via audio, video and chat b/w patient and doctor
    status: { type: String, enum: ["active", "inactive"], default: "active" },

    charge: { type: Number, required: true },
    chargeoffer: Number,

    socialLinks: [socialLinkSchema],
    reviews: [resortReviewSchema],
  },
  { timestamps: true }
);

resortSchema.index({ location: "2dsphere" });

export const ResortModel = mongoose.model<IResort>("ResortModel", resortSchema);


