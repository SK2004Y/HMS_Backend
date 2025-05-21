// import mongoose,{ Document,Schema } from "mongoose";
// import { ISocialInteraction ,ISocialLink} from "./clinic.model";


// export interface IDiagnosticService{
//     name:string;
//     rate:number;
//     discount:number;
//     remark:string;
//     picture?:[
//         url:string,
//         public_id:string,
//     ];
//     videolink?:string;
// }

// // export interface ISocialInteraction{

// //     camps:string;
// //     awareness:string[];
// //     programs:string[];
// //     outreach:string;
// //     donations:string;  // for payment integration
// //     images:string[];
// // }


// // export interface ISocialLink {
// //   platform: string;  //like facebook, insta,twitter and so on..
// //   url: string;
// // }

// export interface IDiagnostic extends Document {
//   userId: mongoose.Types.ObjectId;
//   name: string;
//   image?: string;
//   bio?: string;
//   location: {
//     type: "Point";
//     coordinates: [number, number];
//     city?: string;
//     state?: string;
//     pincode?: string;
//     address: string;
//     landmark: string;
//   };
//   diagnostic: IDiagnostic[];

//   isApproved: boolean;
//   onlineStatus: boolean;
//   status: "active" | "inactive";
//   charge: number;
//   chargeoffer?: number;
//   socketId: string; //Used for real-time chat, video call, notifications
//   socialLinks?: ISocialLink[];

//   rating?: number;
//   reviews?: string[];
//   doctor?: mongoose.Types.ObjectId;
// }



// //sub schema
// const socialLinkSchema = new Schema<ISocialLink>(
//   {
//     platform: { type: String, required: true },
//     url: { type: String, required: true },
//   },
//   { _id: false }
// );

// const diagnosticsShema = new Schema<IDiagnosticService>({
//   name: { type: String, required: true },
//   rate: { type: Number, required: true },
//   discount: { type: Number, required: true },
//   remark: { type: String, required: true },
//   picture: {
//     url:{type:String, required:true},
//     public_id:{type:String,required:true},
//   },
//   videolink: String,
// });


// const diagnosticShema = new Schema<IDiagnostic>(
//   {
//     userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
//     name: { type: String, required: true },

//    image: String,
//     bio: String,
//     location: {
//       type: {
//         type: String,
//         enum: ["Point"],
//         default: "Point",
//       },
//       coordinates: { type: [Number], required: true },
//       city: String,
//       state: String,
//       pincode: String,
//       address:String,
//       landmark:String,
//     },
//     isApproved: { type: Boolean, default: false },
//     onlineStatus: { type: Boolean, default: false },
//     socketId: String, //for communication via audio, video and chat b/w patient and doctor
//     status: { type: String, enum: ["active", "inactive"], default: "active" },

//     charge: { type: Number, required: true },
//     chargeoffer: Number,

//     socialLinks: [socialLinkSchema],
//     diagnostic:[diagnosticsShema],

//     rating: { type: Number, default: 0 },
//     reviews: [{ type: String }],
//     doctor: [{ type: Schema.Types.ObjectId, ref: "Office" }],
//   },
//   { timestamps: true }
// );

// diagnosticShema.index({ location: "2dsphere" });

// export const DiagnosticModel = mongoose.model<IDiagnostic>("DiagnosticModel", diagnosticShema);


























import mongoose, { Document, Schema } from "mongoose";
import { ISocialLink } from "./clinic.model";

// 1. Sub-schema for individual tests/services
export interface IDiagnosticService {
  name: string;
  rate: number;
  discount?: number;
  remark?: string;
  picture?: { url: string; public_id: string }[];
  videolink?: string;
}

export interface IDiagnosticReview {
  userId: mongoose.Types.ObjectId;
  userType: "Patient" | "Doctor";
  rating: number;
  comment?: string;
  createdAt?: Date;
}





const diagnosticServiceSchema = new Schema<IDiagnosticService>(
  {
    name: { type: String, required: true },
    rate: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    remark: String,
    picture: [{ url: String, public_id: String }],
    videolink: String,
  },
  { _id: true,timestamps:true }
);

// 2. Sub-schema for reviews

const diagnoticReviewSchema = new mongoose.Schema({
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

// 3. Main Diagnostic schema
export interface IDiagnostic extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  image?: string;
  bio?: string;
  location: {
    type: "Point";
    coordinates: [number, number];
    city?: string;
    state?: string;
    pincode?: string;
    address: string;
    landmark: string;
  };
  isApproved: boolean;
  onlineStatus: boolean;
  status: "active" | "inactive";
  charge: number;
  chargeoffer?: number;
  socketId?: string;
  socialLinks?: ISocialLink[];  //optinal

  // corrected field name: tests offered
  tests: IDiagnosticService[];

  // overall rating is computed from reviews
 
  reviews: IDiagnosticReview[];

  doctor?: mongoose.Types.ObjectId[];
}

const diagnosticSchema = new Schema<IDiagnostic>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    image: String,
    bio: String,

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
      city: String,
      state: String,
      pincode: String,
      address: String,
      landmark: String,
    },

    isApproved: { type: Boolean, default: false },
    onlineStatus: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "inactive"], default: "active" },

    charge: { type: Number, required: true },
    chargeoffer: Number,
    socketId: String,

    socialLinks: [{ platform: String, url: String }],

    tests: [diagnosticServiceSchema],

    reviews: [diagnoticReviewSchema],

    doctor: [{ type: Schema.Types.ObjectId, ref: "DoctorModel" }],
  },
  { timestamps: true }
);

diagnosticSchema.index({ location: "2dsphere" });

export const DiagnosticModel = mongoose.model<IDiagnostic>(
  "DiagnosticModel",
  diagnosticSchema
);
