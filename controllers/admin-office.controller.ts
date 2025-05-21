import { Request, Response } from "express";
import { OfficeModel } from "../modals/office.model";
import {CatchAsyncError} from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";

// ✅ Create Office
// export const createOffice = CatchAsyncError(
//   async (req: Request, res: Response) => {
//     const { name, type, location, schedule } = req.body;

//     const office = await OfficeModel.create({
//       name,
//       type,
//       location: type === "physical" ? location : undefined,
//       schedule,
//     });

//     res.status(201).json({ success: true, office });
//   }
// );


export const createOffice = async (req: Request, res: Response) => {
  const office = await OfficeModel.create(req.body);

  res.status(201).json({
    success: true,
    message: "Office created successfully",
    office,
  });
};

//  Edit Office Info
export const updateOffice = CatchAsyncError(
  async (req: Request, res: Response) => {
    const {officeId}  = req.params;
    console.log(`office id ${officeId}`)
    const updateData = req.body;

    const office = await OfficeModel.findByIdAndUpdate(officeId, updateData, {
      new: true,
    });

    if (!office) throw new ErrorHandler("Office not found", 404);

    res.status(200).json({ success: true, office });
  }
);

// Assign Dentist office 
export const assignDentist = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { officeId, dentistId, officetype } = req.body;

    console.log(`officeId is ${officeId}`);

    const office = await OfficeModel.findById(officeId);

    if (!office) {
      throw new ErrorHandler("Office not found", 404);
    }

    if (office.assignedTo) {
      throw new ErrorHandler("Office already assigned to another dentist", 400);
    }

    // 🧠 Check if office type is valid before assignment
      if (!["physical", "virtual"].includes(office.officetype)) {
        console.log(`Office officetype in DB: ${office.officetype}`);
        throw new ErrorHandler("Invalid office type", 400);
      }

    // ✅ Assign dentist with type-specific logic (can customize more if needed)
    console.log(`dentistId is ${dentistId}`);
    office.assignedTo = dentistId;
    office.officetype = office.officetype
    office.assignedDate = new Date();

    await office.save();

    res.status(200).json({
      success: true,
      message: `Dentist assigned to ${office.officetype} office`,
      office,
    });
  }
);



// ♻️ Free Office
export const freeOffice = CatchAsyncError(
  async (req: Request, res: Response) => {
    const { officeId } = req.params;

    const office = await OfficeModel.findById(officeId);
    if (!office) throw new ErrorHandler("Office not found", 404);

    office.assignedTo = undefined;
    office.isPermanent= true;
    office.officetype = "virtual";
    await office.save();

    res
      .status(200)
      .json({ success: true, message: "Office unassigned", office });
  }
);
