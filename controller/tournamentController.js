import Tournament from "../models/tournamentModel.js";
import { normalizeTournamentDoc } from "../config/mediaUrl.js";
import { deleteFileByUrl, uploadBuffer } from "../config/s3.js";

/** Multipart fields arrive as strings; clients often send JSON arrays as one string. */
function parseStringArrayField(value) {
  if (value == null || value === "") return [];
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String);
      if (parsed != null) return [String(parsed)];
      return [];
    } catch {
      return value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [String(value)];
}

export const tournamentController = {
  createTournament: async (req, res) => {
    const logPrefix = "[createTournament]";
    try {
      console.log(`${logPrefix} start`, {
        at: new Date().toISOString(),
        ip: req.ip,
        contentType: req.headers["content-type"],
      });
      console.log(`${logPrefix} raw body keys`, Object.keys(req.body || {}));
      console.log(
        `${logPrefix} raw body (values only; file excluded)`,
        JSON.stringify(req.body || {}, null, 2)
      );

      // If the new tournament is being set as active, deactivate all other tournaments
      if (req.body.status === "Active") {
        await Tournament.updateMany(
          { status: "Active" },
          { status: "Non-active" }
        );
      }

      if (!req.file) {
        console.warn(`${logPrefix} rejected: no tournamentPicture file`);
        return res
          .status(400)
          .send({ message: "Tournament image (tournamentPicture) is required." });
      }

      console.log(`${logPrefix} file`, {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });

      let tournamentPicture;
      try {
        tournamentPicture = await uploadBuffer({
          buffer: req.file.buffer,
          originalName: req.file.originalname,
          contentType: req.file.mimetype,
          folder: "tournaments",
        });
      } catch (uploadErr) {
        console.error(`${logPrefix} S3 upload error:`, uploadErr);
        return res.status(500).send({
          message: "Failed to upload tournament image",
          error: uploadErr.message,
        });
      }

      const participatingLofts = Array.isArray(req.body.participatingLofts)
        ? req.body.participatingLofts.map(String)
        : parseStringArrayField(req.body.participatingLofts);

      const allowedAdmins = Array.isArray(req.body.allowedAdmins)
        ? req.body.allowedAdmins.map(String)
        : parseStringArrayField(req.body.allowedAdmins);

      const prizes = Array.isArray(req.body.prizes)
        ? req.body.prizes.map(String)
        : parseStringArrayField(req.body.prizes);

      const dates = parseStringArrayField(req.body.dates);

      console.log(`${logPrefix} parsed arrays`, {
        datesCount: dates.length,
        datesSample: dates.slice(0, 5),
        datesRawType: typeof req.body.dates,
        participatingLoftsCount: participatingLofts.length,
        prizesCount: prizes.length,
        allowedAdminsCount: allowedAdmins.length,
      });

      const tournamentData = {
        tournamentName: req.body.tournamentName,
        club: req.body.club,
        tournamentPicture,
        tournamentInfo: req.body.tournamentInfo,
        category: req.body.category,
        numberOfDays: req.body.numberOfDays,
        dates,
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

      console.log(`${logPrefix} tournamentData (before save)`, {
        ...tournamentData,
        tournamentPicture: tournamentData.tournamentPicture
          ? "[url set]"
          : undefined,
      });

      const tournament = new Tournament(tournamentData);
      await tournament.save();
      console.log(`${logPrefix} saved ok`, { id: String(tournament._id) });
      res.status(201).send(normalizeTournamentDoc(tournament));
    } catch (error) {
      console.error(`${logPrefix} failed`, {
        message: error?.message,
        name: error?.name,
        errors: error?.errors,
        stack: error?.stack,
      });
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

    res
      .status(200)
      .send(tournaments.map((t) => normalizeTournamentDoc(t)));
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

    res
      .status(200)
      .send(tournaments.map((t) => normalizeTournamentDoc(t)));
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
      tournaments: tournaments.map((t) => normalizeTournamentDoc(t)),
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

    res
      ?.status(200)
      .send(tournaments.map((t) => normalizeTournamentDoc(t)));
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    res?.status(500).send(error);
  }
};

export const getTournamentsForCurrentMonth = async (req, res) => {
  try {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = now.getUTCMonth();
    const startStr = `${y}-${String(m + 1).padStart(2, "0")}-01`;
    const nextUtc = new Date(Date.UTC(y, m + 1, 1));
    const endExclusiveStr = `${nextUtc.getUTCFullYear()}-${String(
      nextUtc.getUTCMonth() + 1
    ).padStart(2, "0")}-01`;

    const tournaments = await Tournament.find({
      dates: {
        $elemMatch: {
          $gte: startStr,
          $lt: endExclusiveStr,
        },
      },
    });

    return res?.status(200).json({
      success: true,
      data: tournaments.map((t) => normalizeTournamentDoc(t)),
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
    res.status(200).json({
      success: true,
      data: normalizeTournamentDoc(tournament),
    });
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

    if (tournament.tournamentPicture) {
      await deleteFileByUrl(tournament.tournamentPicture);
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

    if (req.body.dates) {
      updateData.dates = parseStringArrayField(req.body.dates);
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

    if (req.file) {
      if (existingTournament.tournamentPicture) {
        await deleteFileByUrl(existingTournament.tournamentPicture);
      }
      try {
        updateData.tournamentPicture = await uploadBuffer({
          buffer: req.file.buffer,
          originalName: req.file.originalname,
          contentType: req.file.mimetype,
          folder: "tournaments",
        });
      } catch (uploadErr) {
        console.error("S3 upload error:", uploadErr);
        return res.status(500).send({
          success: false,
          message: "Failed to upload tournament image",
          error: uploadErr.message,
        });
      }
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
      data: normalizeTournamentDoc(updatedTournament),
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
