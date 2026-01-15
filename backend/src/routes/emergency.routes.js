import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middlewares.js";
import {
    updateEmergencyContacts,
    triggerSOS,
    getEmergencyContacts
} from "../controllers/emergency.controller.js";

const router = Router();

router.use(verifyJwt);

router.route("/contacts").get(getEmergencyContacts).post(updateEmergencyContacts);
router.route("/sos").post(triggerSOS);

export default router;
