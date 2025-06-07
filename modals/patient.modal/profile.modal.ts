// models/ProfileCompletion.model.ts
import mongoose, { Schema } from "mongoose";

export interface IProfile {
    userId: mongoose.Types.ObjectId;
    name: string;
    bloodGroup: string;
    dob: string;
    allergies?: string[];
    gender?: string;
    address?: string;
    location?: {
        type: "Point";
        coordinates: [number, number];
        city?: string;
        state?: string;
        pincode?: string;
        address: string;
        landmark: string;
    };
    avatar?: {
        url: string;
        public_id: string;
    };
    emergencyContacts?: EmergencyContact[];
}

export interface EmergencyContact {
    name: string;
    phone: string;
    relation: string;
}


const EmergencyContactSchema = new Schema<EmergencyContact>({
    name: { type: String, required: [true, 'please enter name'] },
    phone: { type: String, required: [true, 'please enter number'] },
    relation: { type: String },
});

const ProfileCompletionSchema = new Schema<IProfile>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: {
        type: String,
        required: [true, "please enter a name"]
    },
    bloodGroup: {
        type: String,
    },
    dob: {
        type: String,
        required: [true, 'please enter a Date of birth']
    },
    allergies:{
type:String,
    },
    address:{
type:String,
    },

    gender: {
        type: String,
    },
    avatar: {
        url: {
            type: String,
        },
        public_id: {
            type: String,
        },
    },
    emergencyContacts: [EmergencyContactSchema],
});

export const PatientProfile = mongoose.model(
    "PatientProfile",
    ProfileCompletionSchema
);
