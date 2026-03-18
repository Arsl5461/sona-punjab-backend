import pigeonOwner from "../models/pigeonOwnerModel.js";
import Tournament from "../models/tournamentModel.js";
import mongoose from "mongoose";

export const createPigeonOwner = async (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  // Check if the required fields are present in the request body
  if (!req.body.name || !req.body.adminId) {
    return res.status(400).send({
      message: "Missing required fields: name, adminId",
    });
  }

  const pigeonOwnerData = {
    name: req.body.name,
    ownerPicture: req?.file?.path ? `${baseUrl}/${req.file.path}` : "",
    address: req.body.address,
    adminId: req.body.adminId, // Include the adminId in the pigeonOwnerData
    phone: req.body.phone, // Added phone to the pigeonOwnerData
  };

  try {
    const owner = new pigeonOwner(pigeonOwnerData);
    await owner.save();
    res.status(201).send(owner);
  } catch (error) {
    console.error("Error saving pigeon owner:", error);
    res.status(400).send({
      message: "Failed to save pigeon owner",
      error: error.message,
    });
  }
};

export const getPigeonOwner = async (req, res) => {
  try {
    const owner = await pigeonOwner.find();

    res.status(200).send({
      message: "Banners fetched successfully.",
      owner,
    });
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).send({
      message: "An error occurred while fetching banners.",
      error: error.message || error,
    });
  }
};

export const getPigeonOwnerById = async (req, res) => {
  try {
    const adminId = req.params.adminId;

    // Validate adminId
    if (!adminId) {
      return res.status(400).send({
        message: "adminId is required",
      });
    }

    const owners = await pigeonOwner.find({ adminId });

    res.status(200).send({
      message: "Pigeon owners fetched successfully.",
      owners,
    });
  } catch (error) {
    console.error("Error fetching pigeon owners:", error);
    res.status(500).send({
      message: "An error occurred while fetching pigeon owners.",
      error: error.message || error,
    });
  }
};

export const getSingleOwnerById = async (req, res) => {
  try {
    const ownerId = req.params.ownerId;

    if (!ownerId) {
      return res.status(400).send({
        message: "ownerId is required",
      });
    }

    const owner = await pigeonOwner.findOne({ _id: ownerId });

    if (!owner) {
      return res.status(400).send({
        message: "owner is required",
      });
    }
    res.status(200).send({
      message: "Pigeon owners fetched successfully.",
      owner,
    });
  } catch (error) {
    console.error("Error fetching Single pigeon owners:", error);
    res.status(500).send({
      message: "An error occurred while fetching single pigeon owners.",
    });
  }
};

export const updatePigeonOwner = async (req, res) => {
  try {
    const ownerId = req.params.ownerId;
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // Check if ownerId is provided
    if (!ownerId) {
      return res.status(400).send({
        message: "Owner ID is required",
      });
    }

    // Prepare update data
    const updateData = {
      name: req.body.name,
      address: req.body.address,
      phone: req.body.phone, // Added phone to updateData
    };

    // If a new image is uploaded, update the ownerPicture
    if (req.file) {
      updateData.ownerPicture = req?.file?.path
        ? `${baseUrl}/${req?.file?.path}`
        : "";
    }

    // Find and update the pigeon owner
    const updatedOwner = await pigeonOwner.findByIdAndUpdate(
      ownerId,
      updateData,
      { new: true } // This option returns the updated document
    );

    if (!updatedOwner) {
      return res.status(404).send({
        message: "Pigeon owner not found",
      });
    }

    res.status(200).send({
      message: "Pigeon owner updated successfully",
      owner: updatedOwner,
    });
  } catch (error) {
    console.error("Error updating pigeon owner:", error);
    res.status(500).send({
      message: "An error occurred while updating pigeon owner",
      error: error.message || error,
    });
  }
};

export const deletePigeonOwner = async (req, res) => {
  try {
    const ownerId = req.params.ownerId;

    // Check if ownerId is provided
    if (!ownerId) {
      return res.status(400).send({
        message: "Owner ID is required",
      });
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find the owner first to get their tournaments
      const owner = await pigeonOwner.findById(ownerId);

      if (!owner) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).send({
          message: "Pigeon owner not found",
        });
      }

      // Delete all tournaments where this owner's loft is participating
      await Tournament.updateMany(
        { participatingLofts: owner.name },
        { $pull: { participatingLofts: owner.name } }
      );

      // Delete the owner
      const deletedOwner = await pigeonOwner.findByIdAndDelete(ownerId);

      await session.commitTransaction();
      session.endSession();

      res.status(200).send({
        message: "Pigeon owner and related data deleted successfully",
        owner: deletedOwner,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error deleting pigeon owner:", error);
    res.status(500).send({
      message: "An error occurred while deleting pigeon owner",
      error: error.message || error,
    });
  }
};
