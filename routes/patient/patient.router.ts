import express from "express"
import { Router } from "express"
import { isAuthneticated } from "../../middleware/auth"
import { updateAccessToken } from "../../controllers/user.controller"
import { AllDiagnosticServices, AllDoctorServices, AllGymervices, AllHospitalServices, AllPharmacyServices, AllRadiologyServices, AllResortervices, DoctorallServices, DoctorallServicess, getAllServices, searchServices, SingleDiagnosticService, SingleDoctorService, SingleGymService, SingleHospitalService, SinglePharmacyService, SingleRadiologyService, SingleResortService } from "../../controllers/patient/service.controller"
import { get } from "http"


const PatientRouter= express.Router()


//doctor 
PatientRouter.get("/doctorServices/page",getAllServices);





PatientRouter.get("/Services/pages", DoctorallServices);
PatientRouter.get("/doctorService/p", searchServices);
PatientRouter.get("/doctorService/:id",SingleDoctorService);


//diagnosis 
PatientRouter.get("/diagnosisServices", AllDiagnosticServices);
PatientRouter.get("/diagnosisService/:id", SingleDiagnosticService);



//Hospital
PatientRouter.get("/hospitalServices", AllHospitalServices);
PatientRouter.get("/hospitalService/:id", SingleHospitalService);

//Radiology
PatientRouter.get("/radiologyervices", AllRadiologyServices);
PatientRouter.get("/radiologyService/:id", SingleRadiologyService);



//Pharmacy 
PatientRouter.get("/pharmacyServices", AllPharmacyServices);
PatientRouter.get("/pharmacyService/:id", SinglePharmacyService);



//Resort 
PatientRouter.get("/resortServices",AllResortervices);
PatientRouter.get("/DoctorService/:id", SingleResortService);

//gym

PatientRouter.get("/gymServices", AllGymervices);
PatientRouter.get("/DoctorService/:id", SingleGymService);













export default PatientRouter;