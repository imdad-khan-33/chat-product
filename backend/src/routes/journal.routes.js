import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middlewares.js";
import { addJournalEntry, getJournalEntries, getJournalSummary, updateJournalEntry, deleteJournalEntry } from "../controllers/journal.controller.js";

const router = Router();

// Secure all routes with JWT
router.use(verifyJwt);

router.route("/add").post(addJournalEntry);
router.route("/all").get(getJournalEntries);
router.route("/summary").get(getJournalSummary);
router.route("/:id").put(updateJournalEntry).delete(deleteJournalEntry);

export default router;
