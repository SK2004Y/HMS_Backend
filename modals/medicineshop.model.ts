import mongoose,{ Document,Schema } from "mongoose";
import { ISocialInteraction ,ISocialLink} from "./clinic.model";


export interface IMedicineService{
    // toObject(): unknown;
    _id: any;
    name:string;
    rate:number;
    discount:number;
    remark:string;
    picture?:[
        {
            url:string;
            public_id:string;
        }
    ];
    videolink?:string;
}

export interface IMedicineReview {
  userId: mongoose.Types.ObjectId;
  userType: "Patient" | "Doctor";
  rating: number;
  comment?: string;
  createdAt?: Date;
}

// export interface ISocialInteraction{

//     camps:string;
//     awareness:string[];
//     programs:string[];
//     outreach:string;
//     donations:string;  // for payment integration
//     images:string[];
// }


// export interface ISocialLink {
//   platform: string;  //like facebook, insta,twitter and so on..
//   url: string;
// }

export interface IMedicineShop extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  image?: {
    url: string;
    public_id: string;
  }; //medicineShop picture
  bio?: string; //about medicineShop
  location: {
    type: "Point";
    coordinates: [number, number];
    city?: string;
    state?: string;
    pincode?: string;
    address: string;
    landmark: string;
  };
  medicineService: IMedicineService[];

  isApproved: boolean;
  onlineStatus: boolean;
  status: "active" | "inactive";
  charge: number;
  chargeoffer?: number;
  socketId: string; //Used for real-time chat, video call, notifications
  socialLinks?: ISocialLink[];
  
  reviews?: IMedicineReview[];
  doctor?: mongoose.Types.ObjectId;
}



//sub schema


const medicineReviewSchema = new mongoose.Schema({
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


const medicineSubShema = new Schema<IMedicineService>({
  name: { type: String, required: true },
  rate: { type: Number, required: true },
  discount: { type: Number, required: true },
  remark: { type: String, required: true },
  picture: [{
    url:{type:String, required:true},
    public_id:{type:String,required:true},
  }],
  videolink: String,
});

const medicineSchema = new Schema<IMedicineShop>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },

   image: {
    url:{type:String },
    public_id:{type:String}
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
    medicineService:[medicineSubShema],
    isApproved: { type: Boolean, default: false },
    onlineStatus: { type: Boolean, default: false },
    socketId: String, //for communication via audio, video and chat b/w patient and doctor
    status: { type: String, enum: ["active", "inactive"], default: "active" },

    charge: { type: Number, required: true },
    chargeoffer: Number,

    socialLinks: [socialLinkSchema],

    
    reviews: [medicineReviewSchema],
    doctor: { type: Schema.Types.ObjectId, ref: "DoctorModel" },
  },
  { timestamps: true }
);



// medicineSchema.index({ location: "2dsphere" });

export const MedicineModel = mongoose.model<IMedicineShop>("MedicineModel", medicineSchema);



