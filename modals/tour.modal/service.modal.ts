import mongoose,{Schema,Document} from "mongoose";


export interface TourDetail {
  place: string;
  nights: number;
  activities: string;
  meals: string;
  hotel: string;
}

export interface ReportingInfo {
  date: string; // ISO date string (e.g. "2025-06-13")
  time: string; // e.g. "10:30 AM"
  place: string;
}

export interface OptionalService {
  name: string;
  charge: number;
}

export type GenderOption = "Male" | "Female" | "Both";

export type TourMotive = "Sightseeing" | "Relaxation" | "Self-development";

export interface ITourService {
   userId:mongoose.Types.ObjectId
  category: "Package" | "Custom";
  name: string;
  details: TourDetail[];

  maxSize: number;
  ageRange: {
    min: number;
    max: number;
  };

  genderAllowed: GenderOption[]; // e.g. ["Male", "Female"]

  reporting: ReportingInfo;
  ending: ReportingInfo;

  motive: TourMotive;
  includes: string[]; // e.g. ["Monuments", "Sightseeing", "Museums"]

  totalDays: number;
  totalNights: number;

  basePrice: number;
  optionalServices: OptionalService[];

  createdAt?: Date;
}
  



const TourServiceSchema = new mongoose.Schema<ITourService>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User",required:true },
  category: { type: String},
  name: String,
  details: [
    {
      place: String,
      nights: Number,
      activities: String,
      meals: String,
      hotel: String,
    },
  ],
  maxSize: Number,
  ageRange: {
    min: Number,
    max: Number,
  },
  genderAllowed: [String], // ["Male", "Female", "Both"]
  reporting: {
    date: Date,
    time: String,
    place: String,
  },
  ending: {
    date: Date,
    time: String,
    place: String,
  },
  motive: {
    type: String,
    // enum: ["Sightseeing", "Relaxation", "Self-development"],
  },
  includes: [String],
  totalDays: Number,
  totalNights: Number,
  basePrice: Number,
  optionalServices: [
    {
      name: String,
      charge: Number,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});


export const TourService=mongoose.model<ITourService>("TourService",TourServiceSchema)