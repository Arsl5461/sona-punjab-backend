import Club from "../models/clubModel.js";
import Tournament from "../models/tournamentModel.js";

const createClub = async (req, res) => {
  try {
    const { name } = req?.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Club name is required",
      });
    }

    const club = await Club.findOne({ name: name.trim() });

    if (club) {
      return res.status(400).json({
        success: false,
        message: "Club already exists",
      });
    }

    const newClub = await Club.create({ name: name.trim() });
    return res.status(201).json({
      success: true, // Changed from status to success for consistency
      message: "Club created successfully",
      club: newClub,
    });
  } catch (error) {
    console.error("Error in creating club:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating club",
    });
  }
};

const getAllClubs = async (req, res) => {
  try {
    const clubs = await Club.find();

    if (!clubs) {
      res.status(404).json({ success: false, message: "No clubs found" });
      console.error("No clubs found");
      return;
    }

    res
      .status(200)
      .json({ success: true, message: "Clubs fetched successfully", clubs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
    console.error("Error in getting all clubs", error);
  }
};

const updateClub = async (req, res) => {
  try {
    const { clubId } = req?.params;
    const { name } = req?.body;

    if (!clubId) {
      return res
        .status(404)
        .json({ success: false, message: "Club id is required" });
    }

    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Club name is required" });
    }

    // Get the old club to know its previous name
    const oldClub = await Club.findById(clubId);
    if (!oldClub) {
      return res
        .status(404)
        .json({ success: false, message: "Club not found" });
    }

    // Check if a club with the new name already exists (excluding the current club)
    const existingClub = await Club.findOne({
      name: name.trim(),
      _id: { $ne: clubId },
    });

    if (existingClub) {
      return res.status(400).json({
        success: false,
        message: "Club with this name already exists",
      });
    }

    // Update the club name
    const updatedClub = await Club.findByIdAndUpdate(
      clubId,
      { name: name.trim() },
      { new: true }
    );

    // Update all tournaments that reference the old club name
    await Tournament.updateMany(
      { club: oldClub.name },
      { club: name.trim() }
    );

    return res.status(200).json({
      success: true,
      message: "Club and associated tournaments updated successfully",
      club: updatedClub,
    });
  } catch (error) {
    console.error("Error in updating club", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteClub = async (req, res) => {
  try {
    const { clubId } = req?.params;

    if (!clubId) {
      res.status(404).json({ success: false, message: "Club id is required" });
      console.error("Club id is required");
      return;
    }
    const club = await Club.findByIdAndDelete(clubId);

    if (!club) {
      res.status(404).json({ success: false, message: "Club not found" });
      console.error("Club not found");
      return;
    }
    res
      .status(200)
      .json({ success: true, message: "Club deleted successfully", club });
  } catch (error) {
    res.status(500).json({ success: false, messgae: error.message });
    console.error("Error in deleting club", error);
  }
};

export { createClub, getAllClubs, deleteClub, updateClub };
