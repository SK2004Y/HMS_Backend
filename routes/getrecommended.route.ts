import express from "express"

import { getdoctor, getRecommendedDoctors } from "../controllers/getRecommendedDoctors.controller"


export const getrecRouter=express.Router();



getrecRouter.get("/doctors/query",getRecommendedDoctors);

getrecRouter.get("/doctorssed/query", getdoctor);