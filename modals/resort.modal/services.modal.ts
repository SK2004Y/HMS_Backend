import mongoose,{Document,Schema,Types} from "mongoose";

//services interface

export interface IResortServices{
    userId:mongoose.Types.ObjectId
    name:string;
    price:number;
    discount?:number;
    picture?:{
        url:string;
        public_id:string;
    };
    mode:string;
    description:string;
    reviews?:IReview;
    socialLink?:[ISocialLink]
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


const resortServiceSchema=new Schema<IResortServices>({
userId:{
    type:Schema.Types.ObjectId,
    ref:"User",
    required:true
},
name:{
    type:String,
    required:[true,"please enter a service name"]
},
price:{
    type:Number,
    required:[true,"please enter a service price "]
},
discount:{
    type:Number
},
picture:{
    url:{
        type:String,
    },
    public_id:{
        type:String,

    }
},
mode:{
    type:String,
    enum:["Online","Offline","Hybrid","InHome","e-Clinic"]
},
description:{
    type:String,
    required:[true,"Please enter a something about servics"]
},
reviews:ReviewSchema,
socialLink:socialLinkSchema
},{timestamps:true});


export const ResortService =mongoose.model<IResortServices>("ResortService",resortServiceSchema);


