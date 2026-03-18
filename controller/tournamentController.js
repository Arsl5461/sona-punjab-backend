import Tournament from "../models/tournamentModel.js"; // Ensure correct path and .js extension
import path from "path";
import fs from "fs";

export const tournamentController = {
  createTournament: async (req, res) => {
    try {
      // If the new tournament is being set as active, deactivate all other tournaments
      if (req.body.status === "Active") {
        await Tournament.updateMany(
          { status: "Active" },
          { status: "Non-active" }
        );
      }

      const baseUrl = `${req.protocol}://${req.get("host")}`;

      // Check if participatingLofts is a string, then split it. If it's already an array, use it directly.
      const participatingLofts = Array.isArray(req.body.participatingLofts)
        ? req.body.participatingLofts
        : req.body.participatingLofts
        ? req.body.participatingLofts.split(",")
        : [];

      const allowedAdmins = Array.isArray(req.body.allowedAdmins)
        ? req.body.allowedAdmins
        : [];

      // Check if prizes is a string, then split it. If it's already an array, use it directly.
      const prizes = Array.isArray(req.body.prizes)
        ? req.body.prizes
        : req.body.prizes
        ? req.body.prizes.split(",")
        : [];
      const tournamentData = {
        tournamentName: req.body.tournamentName,
        club: req.body.club,
        tournamentPicture: `${baseUrl}/${req.file.path}`,
        tournamentInfo: req.body.tournamentInfo,
        category: req.body.category,
        numberOfDays: req.body.numberOfDays,
        dates: req.body.dates, // Array of dates
        startTime: req.body.startTime,
        numberOfPigeons: req.body.numberOfPigeons,
        noteTimeForPigeons: req.body.noteTimeForPigeons,
        helperPigeons: req.body.helperPigeons,
        continueDays: req.body.continueDays,
        status: req.body.status,
        type: req.body.type,
        participatingLofts: participatingLofts,
        numberOfPrizes: req.body.numberOfPrizes,
        prizes: prizes,
        allowedAdmins: allowedAdmins,
      };

      const tournament = new Tournament(tournamentData);
      await tournament.save();
      res.status(201).send(tournament);
    } catch (error) {
      res.status(400).send(error);
    }
  },
};

export const getAllTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find();

    if (!tournaments || tournaments.length === 0) {
      return res.status(404).json({ error: "No tournaments found" });
    }

    res.status(200).send(tournaments);
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    res.status(500).send(error);
  }
};

export const getAllAllowedTournaments = async (req, res) => {
  const { subadminId } = req.params;

  if (!subadminId) {
    res.status(400).json({ message: "subadminId is required" });
    return;
  }

  try {
    // Fetch tournaments where subadminId is in the allowedAdmins array
    const tournaments = await Tournament.find({
      allowedAdmins: { $in: [subadminId] }, // Check if subadminId exists in allowedAdmins array
    });

    if (!tournaments || tournaments.length === 0) {
      return res
        .status(404)
        .json({ error: "No tournaments found for this subadmin" });
    }

    res.status(200).send(tournaments);
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    res.status(500).send(error);
  }
};

export const getAllTournamentsByClub = async (req, res) => {
  try {
    const { clubName } = req.params;

    if (!clubName) {
      res
        .status(404)
        .json({ success: false, message: "club name is required" });
      console.error("Club name is required");
      return;
    }

    const tournaments = await Tournament.find({ club: clubName });

    if (!tournaments || tournaments.length === 0) {
      res.status(404).json({
        success: false,
        message: "No tournaments found for this club name",
      });
      console.error("No tournaments found for this club name");
      return;
    }

    res.status(200).json({
      success: true,
      message: "Tournaments fetched successfully",
      tournaments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in fetching tournaments by club",
    });
    console.error("Error in fetching tournaments by club", error);
  }
};

export const getSingleTournament = async (req, res) => {
  const { id } = req.params;

  const tournament = Tournament.find({ _id: id });
  try {
    const tournaments = await Tournament.find(tournament);

    if (!tournaments || tournaments.length === 0) {
      return res?.status(404).json({ error: "No tournaments found" });
    }

    res?.status(200).send(tournaments);
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    res?.status(500).send(error);
  }
};

export const getTournamentsForCurrentMonth = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), 1)
    ); // UTC start of the month
    const endOfMonth = new Date(
      Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    ); // UTC end of the month

    const tournaments = await Tournament.find({
      dates: {
        $elemMatch: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      },
    });

    return res?.status(200).json({
      success: true,
      data: tournaments,
    });
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    throw error;
  }
};

export const getActiveTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findOne({ status: "Active" });
    if (!tournament) {
      return res.status(404).json({ error: "No active tournament found" });
    }
    res.status(200).json({ success: true, data: tournament });
  } catch (error) {
    console.error("Error fetching active tournament:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteTournament = async (req, res) => {
  const { id } = req.params;

  try {
    // Find and delete the tournament
    const tournament = await Tournament.findByIdAndDelete(id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    // If tournament had an image, you might want to delete it from the uploads folder
    if (tournament.tournamentPicture) {
      const imagePath = tournament.tournamentPicture.split("/").pop();
      const fullPath = path.join("uploads", imagePath);

      // Delete the image file if it exists
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    res.status(200).json({
      success: true,
      message: "Tournament deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tournament:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting tournament",
      error: error.message,
    });
  }
};

export const updateTournament = async (req, res) => {
  const { id } = req.params;
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  try {
    // If updating status to Active, deactivate all other tournaments first
    if (req.body.status === "Active") {
      await Tournament.updateMany(
        { _id: { $ne: id }, status: "Active" },
        { status: "Non-active" }
      );
    }

    const allowedAdmins = Array.isArray(req.body.allowedAdmins)
      ? req.body.allowedAdmins
      : req.body.allowedAdmins
      ? JSON.parse(req.body.allowedAdmins)
      : [];

    // First get the existing tournament
    const existingTournament = await Tournament.findById(id);
    if (!existingTournament) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    // Prepare update data
    const updateData = {
      tournamentName: req.body.tournamentName,
      tournamentInfo: req.body.tournamentInfo,
      category: req.body.category,
      numberOfDays: req.body.numberOfDays,
      startTime: req.body.startTime,
      numberOfPigeons: req.body.numberOfPigeons,
      noteTimeForPigeons: req.body.noteTimeForPigeons,
      helperPigeons: req.body.helperPigeons,
      continueDays: req.body.continueDays,
      status: req.body.status,
      type: req.body.type,
      numberOfPrizes: req.body.numberOfPrizes,
      allowedAdmins: allowedAdmins,
    };

    // Parse dates array if it exists
    if (req.body.dates) {
      try {
        updateData.dates = JSON.parse(req.body.dates);
      } catch (e) {
        console.error("Error parsing dates:", e);
        updateData.dates = req.body.dates; // Use as is if parsing fails
      }
    }

    // Handle participatingLofts updates
    if (req.body.participatingLofts) {
      try {
        const parsedLofts = JSON.parse(req.body.participatingLofts);

        if (req.body.action === "add") {
          updateData.participatingLofts = [
            ...new Set([
              ...existingTournament.participatingLofts,
              ...parsedLofts,
            ]),
          ];
        } else if (req.body.action === "remove") {
          updateData.participatingLofts =
            existingTournament.participatingLofts.filter(
              (loft) => !parsedLofts.includes(loft)
            );
        } else {
          updateData.participatingLofts = parsedLofts;
        }
      } catch (e) {
        console.error("Error parsing participatingLofts:", e);
      }
    }

    // Handle prizes updates
    if (req.body.prizes) {
      try {
        updateData.prizes = JSON.parse(req.body.prizes);
      } catch (e) {
        console.error("Error parsing prizes:", e);
        updateData.prizes = req.body.prizes; // Use as is if parsing fails
      }
    }

    // Handle new tournament picture if uploaded
    if (req.file) {
      // Delete old image if it exists
      if (existingTournament.tournamentPicture) {
        const oldImagePath = existingTournament.tournamentPicture
          .split("/")
          .pop();
        const fullPath = path.join("uploads", oldImagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      updateData.tournamentPicture = `${baseUrl}/${req.file.path}`;
    }

    // Update the tournament
    const updatedTournament = await Tournament.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTournament) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedTournament,
    });
  } catch (error) {
    console.error("Error updating tournament:", error);
    res.status(500).json({
      success: false,
      message: "Error updating tournament",
      error: error.message,
    });
  }
};

getTournamentsForCurrentMonth()
  .catch((error) => {
    console.error("Error:", error);
  });
