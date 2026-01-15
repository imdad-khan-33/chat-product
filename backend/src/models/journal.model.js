import mongoose from "mongoose";

const journalSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            trim: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        sentiment: {
            type: String, // e.g., "Calm", "Anxious", "Happy", "Sad"
            default: "Neutral",
        },
        syentimentScore: {
            type: Number, // 0 to 1 scaling or similar
            default: 0.5,
        },
        aiFeedback: {
            type: String, // AI's immediate feedback on this specific entry
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

export const Journal = mongoose.model("Journal", journalSchema);
