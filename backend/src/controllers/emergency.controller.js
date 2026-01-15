import { User } from "../models/users.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { mailSender } from "../utils/mailSender.js";

// Add or Update Emergency Contacts
const updateEmergencyContacts = asyncHandler(async (req, res) => {
    const { contacts } = req.body; // Array of {name, email, phone}
    const userId = req.user?._id;

    if (!Array.isArray(contacts)) {
        throw new ApiError(400, "Contacts must be an array.");
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: { emergencyContacts: contacts } },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, user.emergencyContacts, "Emergency contacts updated."));
});

// Trigger SOS Alert
const triggerSOS = asyncHandler(async (req, res) => {
    const { latitude, longitude } = req.body;
    const user = await User.findById(req.user?._id);

    if (!user.emergencyContacts || user.emergencyContacts.length === 0) {
        throw new ApiError(400, "No emergency contacts found. Please add contacts first.");
    }

    const locationLink = latitude && longitude
        ? `https://www.google.com/maps?q=${latitude},${longitude}`
        : "Location not available";

    const emailTitle = `🚨 EMERGENCY: SOS Alert from ${user.username}`;

    const emailBody = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #ff4d4d; border-radius: 10px;">
      <h1 style="color: #ff4d4d;">🚨 Emergency SOS Alert</h1>
      <p>Hello,</p>
      <p>This is an automated emergency alert from <strong>${user.username}</strong>.</p>
      <p>They have triggered an SOS from the Virtual Therapist app and may need immediate assistance.</p>
      
      <div style="background: #fff5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Current Location:</strong></p>
        <p><a href="${locationLink}" style="color: #007bff; font-weight: bold; text-decoration: none;">Click here to view location on Google Maps</a></p>
      </div>
      
      <p style="color: #666; font-size: 12px;">Please try to contact them immediately.</p>
      <p>Warmly,<br>Virtual Therapist Team</p>
    </div>
  `;

    // Send emails to all contacts
    const emailPromises = user.emergencyContacts.map(contact =>
        mailSender(contact.email, emailTitle, emailBody)
    );

    try {
        await Promise.all(emailPromises);
    } catch (error) {
        console.error("Failed to send some SOS emails:", error.message);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "SOS Alert sent to all emergency contacts."));
});

// Get Emergency Contacts
const getEmergencyContacts = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id);
    return res
        .status(200)
        .json(new ApiResponse(200, user.emergencyContacts || [], "Emergency contacts fetched."));
});

export { updateEmergencyContacts, triggerSOS, getEmergencyContacts };
