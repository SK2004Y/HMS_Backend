
require("dotenv").config();
import mongoose from "mongoose";
import { DoctorModel } from "../modals/doctor.model";



const dbUrl:string=process.env.DB_URL||'';


const connectDB = async()=>{

    try{
        await mongoose.connect(dbUrl).then((data:any)=>{
            console.log(`Database Connected with ${data.connection.host}`)

        })

        //  await DoctorModel.syncIndexes();
           
         
    }

    catch(error:any){
        console.log(error.message);
        setTimeout(connectDB,5000);

    }



}


export default connectDB;