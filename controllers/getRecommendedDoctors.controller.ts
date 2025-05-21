import {redis }from "../utils/redis"; // adjust path
import {DoctorModel} from "../modals/doctor.model";
import {OfficeModel} from "../modals/office.model";
import { Request, Response } from "express";
import crypto from "crypto";

export const getRecommendedDoctors = async (req: Request, res: Response) => {
  try {
    const {
      lat,
      lng,
      specialization,
      gender,
      language,
      day,
      minPrice,
      maxPrice,
    } = req.query;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ success: false, message: "Location required" });
    }

    // ✅ Create unique hash key from all query parameters
    const queryKey = crypto
      .createHash("md5")
      .update(JSON.stringify(req.query))
      .digest("hex");

    const redisKey = `recommended_doctors:${queryKey}`;

    // 🔁 Try fetching from Redis cache
    // const cachedString = await redis.get(redisKey);
    // if (cachedString) {
    //   const cachedDoctors = JSON.parse(cachedString);
    //   return res.status(200).json({
    //     success: true,
    //     source: "cache",
    //     ...cachedDoctors,
    //   });
    // }

    // 🛰 Step 1: Get Nearby Offices
    const nearbyOffices = await OfficeModel.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(lng as string), parseFloat(lat as string)],
          },
          key: "location",
          distanceField: "dist.calculated",
          spherical: true,
          maxDistance: 10000 * 1609, // 10km
        },
      },
    ]);
    // console.log("Nearby offices:", nearbyOffices);
    const officeIds = nearbyOffices.map((o) => o._id);

    // 🧠 Step 2: Get dentist IDs from offices
    const dentistIds = nearbyOffices
      .filter((o) => o.assignedTo) // Ensure only assigned offices
      .map((o) => o.assignedTo);

      console.log(`dentistId is here ${dentistIds}`);
const test = await DoctorModel.findById(dentistIds).lean();
console.log("Doctor Data:", test);

      const filters: any = {
        _id: { $in: dentistIds },
        isApproved: true,
        isAvailable: true,
      };

   if (specialization)
     filters.specialization = (specialization as string).trim();
   if (gender) filters.gender = gender;
   if (language) filters.languages = { $in: [language] };

      if (minPrice || maxPrice) {
        filters.consultationFee = {};
        if (minPrice)
          filters.consultationFee.$gte = parseInt(minPrice as string);
        if (maxPrice)
          filters.consultationFee.$lte = parseInt(maxPrice as string);
      }

      console.log("Filters used:", filters);

      const doctors = await DoctorModel.find(filters).lean();

    // 🧠 Step 2: Filter Doctors
    const doctorss = await DoctorModel.find({
      _id: { $in: dentistIds },
      isApproved: true,
      isAvailable: true,
      ...(specialization && { specialization }),
      ...(gender && { gender }),
      ...(language && { languages: { $in: [language] } }),
      ...(minPrice || maxPrice
        ? {
            consultationFee: {
              ...(minPrice && { $gte: parseInt(minPrice as string) }),
              ...(maxPrice && { $lte: parseInt(maxPrice as string) }),
            },
          }
        : {}),
    }).lean();
    // console.log(`doctors is`, doctors);
    // 🗓 Filter by available day
    let filteredDoctors = doctors;
    if (day) {
      filteredDoctors = doctors.filter((doctor: { availableSlots: any[] }) =>
        doctor.availableSlots?.some(
          (slot) => slot.day.toLowerCase() === (day as string).toLowerCase()
        )
      );
    }


    const doc = await DoctorModel.findById("67f0e7d428d376dcbc8f7fab");
    console.log(doc);

    // ⭐ Sort by rating
    filteredDoctors.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    const result = {
      count: filteredDoctors.length,
      doctors: filteredDoctors,
    };

    console.log("Nearby offices:with id ", JSON.stringify(officeIds, null, 2));


    // 🔁 Save to Redis for 5 minutes
    // await redis.set(redisKey, JSON.stringify({ count, doctors }));
    await redis.set(redisKey, JSON.stringify(result));

    const cached = await redis.get(redisKey);

    if (cached) {
      const parsed = JSON.parse(cached);
      return res.status(200).json({
        success: true,
        source: "cache",
        ...parsed,
      });
    }

    return res.status(200).json({ success: true, source: "mongo", ...result });
  } catch (err) {
    console.error("Doctor Recommendation Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};











export const getdoctor = async (req: Request, res: Response) => {
  try {
    const {
      lat,
      lng,
    } = req.query;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ success: false, message: "Location required" });
    }


    const near=await OfficeModel.aggregate([
      {
        $geoNear:{
          near:{type:"Point",coordinates:[parseFloat(lng as string),parseFloat(lat as string)]},
          key:"location",
          maxDistance:100*1609,
          distanceField:"dist.calculated",
          spherical:true,
        }
      },
    ]);

console.log(`near location is `, near);
    const assignedIdd=near[0].assignedTo;
    if(assignedIdd){
      // const id= await DoctorModel.findById(assignedIdd);
        // console.log(`assigneddoctor id `,id);
        
    }






   





    // ✅ Create unique hash key from all query parameters
    const queryKey = crypto
      .createHash("md5")
      .update(JSON.stringify(req.query))
      .digest("hex");
 

      //i'm creating index using name so that search can be fast 
        //  const send = await DoctorModel.createIndexes({
        //   name:String

        //  });
        //  console.log(`indexes is `,send);
        //  const find = await DoctorModel.find({ send });
        //  console.log(`creating indexes by using name `, find);

   
  } catch (err) {
    console.error("Doctor Recommendation Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};