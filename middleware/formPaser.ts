// middleware/formParser.ts
import { Response,Request,NextFunction } from "express";
export const parseFormData = (req:Request, res:Response, next:NextFunction) => {
  try {
    // Convert JSON fields that came as strings
    if (req.body.languages) req.body.languages = JSON.parse(req.body.languages);
    if (req.body.specialization)
      req.body.specialization = JSON.parse(req.body.specialization);
    if (req.body.qualifications)
      req.body.qualifications = JSON.parse(req.body.qualifications);
    if (req.body.qualificationss)
      req.body.qualificationss = JSON.parse(req.body.qualificationss);
    if (req.body.experienced)
      req.body.experienced = JSON.parse(req.body.experienced);
    if (req.body.publications)
      req.body.publications = JSON.parse(req.body.publications);
    if (req.body.rewards) req.body.rewards = JSON.parse(req.body.rewards);
    if (req.body.socialLinks)
      req.body.socialLinks = JSON.parse(req.body.socialLinks);
    if (req.body.availableSlots)
      req.body.availableSlots = JSON.parse(req.body.availableSlots);
    if (req.body.location) req.body.location = JSON.parse(req.body.location);

    next();
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid JSON in form-data" });
  }
};
