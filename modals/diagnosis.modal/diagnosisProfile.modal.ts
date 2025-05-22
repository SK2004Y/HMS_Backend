//doctor profile completion 
import mongoose,{Schema,Document,Types} from "mongoose";

//interface 
export interface IProfile{
    userId: mongoose.Types.ObjectId;
    specialization:string[];
    registrationNumber:string;
    experience:number;
    gstNumber?:string;
    licenceNumber?:string;
    gender?:string;
    address:string;
    location?: {
        type: "Point";
        coordinates: [number, number];
        city?: string;
        state?: string;
        pincode?: string;
        address: string;
        landmark: string;
      };
    avatar?:{
        url:string;
        public_id:string;
    },
    accountDetails:{
      HolderName:string;
      Ifsc:string;
      accountNumber:number;
      bankName:string;
    }
}


const profileSchema = new Schema<IProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    specialization: [
      {
        type: String,
        require: [true, "Please enter your specialization"],
      },
    ],
    registrationNumber: {
      type: String,
      required: [true, "Please enter your Registration Number"],
    },
    experience: {
      type: Number,
      required: [true, "please enter your experience"],
    },
    gstNumber: {
      type: String,
    },
    gender: {
      type: String,
    },
    address: {
      type: String,
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
    avatar: {
      url: String,
      public_id: String,
    },
    accountDetails: {
      HolderName: {
        type: String,
      },
      Ifsc: {
        type: String,
        required: [true, "Please enter a IFSC code"],
      },
      accountNumber: {
        type: Number,
        required: [true, "Please enter a Account Number"],
      },
      bankName: {
        type: String,
        required: [true, "Please enter a Bank Name"],
      },
    },
  },
  { timestamps: true }
);

export const DoctorProfile=mongoose.model<IProfile>("DoctorProfile",profileSchema);
