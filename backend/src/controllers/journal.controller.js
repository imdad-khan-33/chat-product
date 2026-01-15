import { Journal } from "../models/journal.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { analyzeJournalEntry, generateJournalSummary } from "../services/deepSeek.service.js";
import { extractJson } from "../utils/commonFunctions.js";

// Add a new journal entry
const addJournalEntry = asyncHandler(async (req, res) => {
    const { title, content } = req.body;
    const userId = req.user?._id;
    const username = req.user?.username;

    if (!content) {
        throw new ApiError(400, "Content is required for a journal entry.");
    }

    // 1. Analyze sentiment via AI
    const aiResult = await analyzeJournalEntry(content, username);
    const cleanJson = extractJson(aiResult.content);

    let sentiment = "Neutral";
    let sentimentScore = 0.5;
    let aiFeedback = "Thank you for sharing.";

    try {
        const parsed = JSON.parse(cleanJson);
        sentiment = parsed.sentiment || sentiment;
        sentimentScore = parsed.sentimentScore || sentimentScore;
        aiFeedback = parsed.aiFeedback || aiFeedback;
    } catch (error) {
        console.warn("AI Sentiment Parse Failed:", error.message);
    }

    // 2. Save to database
    const journalEntry = await Journal.create({
        userId,
        title: title || "Daily Journal",
        content,
        sentiment,
        sentimentScore,
        aiFeedback
    });

    if (!journalEntry) {
        throw new ApiError(500, "Something went wrong while saving the journal entry.");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, journalEntry, "Journal entry saved and analyzed."));
});

// Get all journal entries for the current user
const getJournalEntries = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    const entries = await Journal.find({ userId }).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, entries, "Journal entries fetched successfully."));
});

// Get 7-day AI mood trend summary
const getJournalSummary = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const username = req.user?.username;

    // Get entries from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const entries = await Journal.find({
        userId,
        createdAt: { $gte: sevenDaysAgo }
    });

    if (entries.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, { summary: "No entries in the last 7 days to analyze. Start journaling today!" }, "No entries found."));
    }

    // Generate summary via AI
    const aiSummary = await generateJournalSummary(entries, username);

    return res
        .status(200)
        .json(new ApiResponse(200, { summary: aiSummary.content }, "7-day summary generated."));
});

// Update a journal entry
const updateJournalEntry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user?._id;
    const username = req.user?.username;

    const entry = await Journal.findOne({ _id: id, userId });

    if (!entry) {
        throw new ApiError(404, "Journal entry not found or unauthorized.");
    }

    if (title) entry.title = title;

    if (content && content !== entry.content) {
        entry.content = content;
        // Re-analyze sentiment if content changed
        const aiResult = await analyzeJournalEntry(content, username);
        const cleanJson = extractJson(aiResult.content);

        try {
            const parsed = JSON.parse(cleanJson);
            entry.sentiment = parsed.sentiment || entry.sentiment;
            entry.sentimentScore = parsed.sentimentScore || entry.sentimentScore;
            entry.aiFeedback = parsed.aiFeedback || entry.aiFeedback;
        } catch (error) {
            console.warn("AI Sentiment Parse Failed during update:", error.message);
        }
    }

    await entry.save();

    return res
        .status(200)
        .json(new ApiResponse(200, entry, "Journal entry updated successfully."));
});

// Delete a journal entry
const deleteJournalEntry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?._id;

    const entry = await Journal.findOneAndDelete({ _id: id, userId });

    if (!entry) {
        throw new ApiError(404, "Journal entry not found or unauthorized.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Journal entry deleted successfully."));
});

export { addJournalEntry, getJournalEntries, getJournalSummary, updateJournalEntry, deleteJournalEntry };
