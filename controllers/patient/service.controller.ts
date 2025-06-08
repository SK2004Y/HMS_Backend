import { CatchAsyncError } from "../../middleware/catchAsyncErrors";
import { DoctorService } from "../../modals/doctor.modal/services.modal";
import { DiagnosticService } from "../../modals/diagnosis.modal/services.modal";
import { GymService } from "../../modals/gym.modal.ts/services.modal";
import { RadiologyService } from "../../modals/radiology.modal.ts/services.modal";
import { HospitalService } from "../../modals/hospital.modal/services.modal";
import { ResortService } from "../../modals/resort.modal/services.modal";
import { AmbulanceService } from "../../modals/ambulance.modal/services.modal";
import { PharmacyService } from "../../modals/medicine.modal/services.modal";
import ErrorHandler from "../../utils/ErrorHandler";
import express, {NextFunction,Request,Response}  from "express"

//patient services get pay for it 
export const SingleDoctorService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    console.log(`id is receive${id}`, id);
    const service = await DoctorService.findById(id);
    if (!service) {
      return next(new ErrorHandler("Service not found", 404));
    }
    res.status(200).json({ success: true, service });
  }
);
//all doctor services without pagination for patient shows 
export const AllDoctorServices = CatchAsyncError(
  async (req: Request, res: Response) => {

    console.log(`all doctor services page hitted doctors`);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Query params
    const search = (req.query.search as string)?.trim();
    const sortBy = (req.query.sortBy as string) || "createdAt"; // e.g., 'createdAt', 'professional'
    const order = (req.query.order as string) === "asc" ? 1 : -1;
    const filterByDate = req.query.filterByDate as string; // e.g., "lastMonth"

    const filter: any = {};

    // Search by serviceName (case-insensitive)
    if (search) {
      filter.serviceName = { $regex: search, $options: "i" };
    }

    // Optional filter for "last month"
    if (filterByDate === "lastMonth") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filter.createdAt = { $gte: oneMonthAgo };
    }

    try {
      console.log("Fetching services with:", {
        page,
        limit,
        skip,
        search,
        sortBy,
        order,
        filterByDate,
        filter,
      });

      const services = await DoctorService.find(filter)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit);

      const total = await DoctorService.countDocuments(filter);

      res.status(200).json({
        services,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error("Error in getAllDoctorServices:", error);
      res.status(500).json({ message: "Failed to fetch services", error });
    }
  }
);






//Diagnosis services handler for showing patient 
export const SingleDiagnosticService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    console.log(`id is receive${id}`, id);
    const service = await DiagnosticService.findById(id);
    if (!service) {
      return next(new ErrorHandler("Service not found", 404));
    }
    res.status(200).json({ success: true, service });
  }
);

//all Diagnostic services
export const AllDiagnosticServices = CatchAsyncError(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Query params
    const search = (req.query.search as string)?.trim();
    const sortBy = (req.query.sortBy as string) || "createdAt"; // e.g., 'createdAt', 'professional'
    const order = (req.query.order as string) === "asc" ? 1 : -1;
    const filterByDate = req.query.filterByDate as string; // e.g., "lastMonth"

    const filter: any = {};

    // Search by serviceName (case-insensitive)
    if (search) {
      filter.serviceName = { $regex: search, $options: "i" };
    }

    // Optional filter for "last month"
    if (filterByDate === "lastMonth") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filter.createdAt = { $gte: oneMonthAgo };
    }

    try {
      console.log("Fetching services with:", {
        page,
        limit,
        skip,
        search,
        sortBy,
        order,
        filterByDate,
        filter,
      });

      const services = await DiagnosticService.find(filter)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit);

      const total = await DiagnosticService.countDocuments(filter);

      res.status(200).json({
        services,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error("Error in getAllDoctorServices:", error);
      res.status(500).json({ message: "Failed to fetch services", error });
    }
  }
);
  





//Hospital services 
export const SingleHospitalService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    console.log(`id is receive${id}`, id);
    const service = await HospitalService.findById(id);
    if (!service) {
      return next(new ErrorHandler("Service not found", 404));
    }
    res.status(200).json({ success: true, service });
  }
);

//all Hospital services
export const AllHospitalServices = CatchAsyncError(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Query params
    const search = (req.query.search as string)?.trim();
    const sortBy = (req.query.sortBy as string) || "createdAt"; // e.g., 'createdAt', 'professional'
    const order = (req.query.order as string) === "asc" ? 1 : -1;
    const filterByDate = req.query.filterByDate as string; // e.g., "lastMonth"

    const filter: any = {};

    // Search by serviceName (case-insensitive)
    if (search) {
      filter.serviceName = { $regex: search, $options: "i" };
    }

    // Optional filter for "last month"
    if (filterByDate === "lastMonth") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filter.createdAt = { $gte: oneMonthAgo };
    }

    try {
      console.log("Fetching services with:", {
        page,
        limit,
        skip,
        search,
        sortBy,
        order,
        filterByDate,
        filter,
      });

      const services = await HospitalService.find(filter)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit);

      const total = await HospitalService.countDocuments(filter);

      res.status(200).json({
        services,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error("Error in getAllDoctorServices:", error);
      res.status(500).json({ message: "Failed to fetch services", error });
    }
  }
);



//Radiology services 
export const SingleRadiologyService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    console.log(`id is receive${id}`, id);
    const service = await RadiologyService.findById(id);
    if (!service) {
      return next(new ErrorHandler("Service not found", 404));
    }
    res.status(200).json({ success: true, service });
  }
);

//all Hospital services
export const AllRadiologyServices = CatchAsyncError(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Query params
    const search = (req.query.search as string)?.trim();
    const sortBy = (req.query.sortBy as string) || "createdAt"; // e.g., 'createdAt', 'professional'
    const order = (req.query.order as string) === "asc" ? 1 : -1;
    const filterByDate = req.query.filterByDate as string; // e.g., "lastMonth"

    const filter: any = {};

    // Search by serviceName (case-insensitive)
    if (search) {
      filter.serviceName = { $regex: search, $options: "i" };
    }

    // Optional filter for "last month"
    if (filterByDate === "lastMonth") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filter.createdAt = { $gte: oneMonthAgo };
    }

    try {
      console.log("Fetching services with:", {
        page,
        limit,
        skip,
        search,
        sortBy,
        order,
        filterByDate,
        filter,
      });

      const services = await RadiologyService.find(filter)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit);

      const total = await RadiologyService.countDocuments(filter);

      res.status(200).json({
        services,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error("Error in getAllDoctorServices:", error);
      res.status(500).json({ message: "Failed to fetch services", error });
    }
  }
);






//medicine/pharmacy  services 
export const SinglePharmacyService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    console.log(`id is receive${id}`, id);
    const service = await PharmacyService.findById(id);
    if (!service) {
      return next(new ErrorHandler("Service not found", 404));
    }
    res.status(200).json({ success: true, service });
  }
);

//all pharmacy services
export const AllPharmacyServices = CatchAsyncError(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Query params
    const search = (req.query.search as string)?.trim();
    const sortBy = (req.query.sortBy as string) || "createdAt"; // e.g., 'createdAt', 'professional'
    const order = (req.query.order as string) === "asc" ? 1 : -1;
    const filterByDate = req.query.filterByDate as string; // e.g., "lastMonth"

    const filter: any = {};

    // Search by serviceName (case-insensitive)
    if (search) {
      filter.serviceName = { $regex: search, $options: "i" };
    }

    // Optional filter for "last month"
    if (filterByDate === "lastMonth") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filter.createdAt = { $gte: oneMonthAgo };
    }

    try {
      console.log("Fetching services with:", {
        page,
        limit,
        skip,
        search,
        sortBy,
        order,
        filterByDate,
        filter,
      });

      const services = await PharmacyService.find(filter)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit);

      const total = await PharmacyService.countDocuments(filter);

      res.status(200).json({
        services,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error("Error in getAllDoctorServices:", error);
      res.status(500).json({ message: "Failed to fetch services", error });
    }
  }
);
  

//resort services
export const SingleResortService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    console.log(`id is receive${id}`, id);
    const service = await ResortService.findById(id);
    if (!service) {
      return next(new ErrorHandler("Service not found", 404));
    }
    res.status(200).json({ success: true, service });
  }
);


export const AllResortervices = CatchAsyncError(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Query params
    const search = (req.query.search as string)?.trim();
    const sortBy = (req.query.sortBy as string) || "createdAt"; // e.g., 'createdAt', 'professional'
    const order = (req.query.order as string) === "asc" ? 1 : -1;
    const filterByDate = req.query.filterByDate as string; // e.g., "lastMonth"

    const filter: any = {};

    // Search by serviceName (case-insensitive)
    if (search) {
      filter.serviceName = { $regex: search, $options: "i" };
    }

    // Optional filter for "last month"
    if (filterByDate === "lastMonth") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filter.createdAt = { $gte: oneMonthAgo };
    }

    try {
      console.log("Fetching services with:", {
        page,
        limit,
        skip,
        search,
        sortBy,
        order,
        filterByDate,
        filter,
      });

      const services = await ResortService.find(filter)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit);

      const total = await ResortService.countDocuments(filter);

      res.status(200).json({
        services,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error("Error in getAllDoctorServices:", error);
      res.status(500).json({ message: "Failed to fetch services", error });
    }
  }
);



//Gym services
export const SingleGymService = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    console.log(`id is receive${id}`, id);
    const service = await GymService.findById(id);
    if (!service) {
      return next(new ErrorHandler("Service not found", 404));
    }
    res.status(200).json({ success: true, service });
  }
);

export const AllGymervices = CatchAsyncError(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Query params
    const search = (req.query.search as string)?.trim();
    const sortBy = (req.query.sortBy as string) || "createdAt"; // e.g., 'createdAt', 'professional'
    const order = (req.query.order as string) === "asc" ? 1 : -1;
    const filterByDate = req.query.filterByDate as string; // e.g., "lastMonth"

    const filter: any = {};

    // Search by serviceName (case-insensitive)
    if (search) {
      filter.serviceName = { $regex: search, $options: "i" };
    }

    // Optional filter for "last month"
    if (filterByDate === "lastMonth") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filter.createdAt = { $gte: oneMonthAgo };
    }

    try {
      console.log("Fetching services with:", {
        page,
        limit,
        skip,
        search,
        sortBy,
        order,
        filterByDate,
        filter,
      });

      const services = await GymService.find(filter)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit);

      const total = await GymService.countDocuments(filter);

      res.status(200).json({
        services,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error("Error in getAllGymServices:", error);
      res.status(500).json({ message: "Failed to fetch services", error });
    }
  }
);




