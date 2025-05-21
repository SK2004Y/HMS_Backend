import mongoose, { Schema, Document } from "mongoose";


export interface ImedicalReport {
  fileUrl: {
    url:string;
    public_id:string;
  };
  fileName: string;
  uploadedAt:Date,
}



export interface IReportPatient {
  
  fileUrl:{
    url:string;
    public_id:string;
  };
  fileName:string;
  text?:string;
  uploadedAt: Date;
}

const patientReportsSchema = new Schema<IReportPatient>(
  {
    fileUrl: { 
      url:String,
      public_id:String,
     },
    fileName: {type:String}, 
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true } // Mongoose auto-generates _id
);



const medicalReportsSchema = new Schema<ImedicalReport>(
  {
    fileUrl: { 
      url:String,
      public_id:String,
    },
    fileName: [{ type: String}],
    uploadedAt:[{type:Date,default:Date.now}]
  },
  {_id:true}
);


export interface IPatient extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  contactNumber: string;
  address: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
    city?: string;
    state?: string;
    pincode?: string;
  };
  bloodGroup?: string;
  avatar?: {
    url:string;
    public_id:string;
  };
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  medicalHistory?: string[];
  medicalReport?: ImedicalReport[];
  patientreports?: IReportPatient[]; 
  notifications: boolean;
  allergies?: string[];
  communicationPreference?: {
    sms: boolean;
    email: boolean;
  };
  displine?: string[];
}

const patientSchema = new Schema<IPatient>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    contactNumber: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      city: String,
      state: String,
      pincode: String,
    },
    bloodGroup: { type: String },
    avatar: { 
      url:String,
      public_id:String,
     },
    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
    },
    medicalHistory: [String],
    allergies: [String],
    medicalReport: [medicalReportsSchema],
    patientreports: [patientReportsSchema],

    notifications: {
      appointmentReminders: { type: Boolean, default: true },
      reportUploadAlerts: { type: Boolean, default: true },
      promotionalMessages: { type: Boolean, default: false },
    },
    communicationPreference: {
      sms: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
    },

    displine: [{type:String}],
  },
  { timestamps: true }
);



patientSchema.index({ location: "2dsphere" });
export const PatientModel = mongoose.model<IPatient>("Patient", patientSchema);




