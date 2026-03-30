import pigeonOwner from "../models/pigeonOwnerModel.js";
import Tournament from "../models/tournamentModel.js";
import mongoose from "mongoose";
import { normalizeOwnerDoc } from "../config/mediaUrl.js";
import { deleteFileByUrl, uploadBuffer } from "../config/s3.js";

export const createPigeonOwner = async (req, res) => {
  if (!req.body.name || !req.body.adminId) {
    return res.status(400).send({
      message: "Missing required fields: name, adminId",
    });
  }

  let ownerPicture = "";
  if (req.file) {
    try {
      ownerPicture = await uploadBuffer({
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        contentType: req.file.mimetype,
        folder: "owners",
      });
    } catch (err) {
      console.error("S3 upload error:", err);
      return res.status(500).send({
        message: "Failed to upload owner image",
        error: err.message,
      });
    }
  }

  const pigeonOwnerData = {
    name: req.body.name,
    ownerPicture,
    address: req.body.address,
    adminId: req.body.adminId,
    phone: req.body.phone,
  };

  try {
    const owner = new pigeonOwner(pigeonOwnerData);
    await owner.save();
    res.status(201).send(normalizeOwnerDoc(owner));
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
    const normalized = owner.map((o) => normalizeOwnerDoc(o));

    res.status(200).send({
      message: "Banners fetched successfully.",
      owner: normalized,
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

    if (!adminId) {
      return res.status(400).send({
        message: "adminId is required",
      });
    }

    const owners = await pigeonOwner.find({ adminId });
    const normalized = owners.map((o) => normalizeOwnerDoc(o));

    res.status(200).send({
      message: "Pigeon owners fetched successfully.",
      owners: normalized,
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
      owner: normalizeOwnerDoc(owner),
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

    if (!ownerId) {
      return res.status(400).send({
        message: "Owner ID is required",
      });
    }

    const existingOwner = await pigeonOwner.findById(ownerId);
    if (!existingOwner) {
      return res.status(404).send({
        message: "Pigeon owner not found",
      });
    }

    const updateData = {
      name: req.body.name,
      address: req.body.address,
      phone: req.body.phone,
    };

    if (req.file) {
      if (existingOwner.ownerPicture) {
        await deleteFileByUrl(existingOwner.ownerPicture);
      }
      try {
        updateData.ownerPicture = await uploadBuffer({
          buffer: req.file.buffer,
          originalName: req.file.originalname,
          contentType: req.file.mimetype,
          folder: "owners",
        });
      } catch (err) {
        console.error("S3 upload error:", err);
        return res.status(500).send({
          message: "Failed to upload owner image",
          error: err.message,
        });
      }
    }

    const updatedOwner = await pigeonOwner.findByIdAndUpdate(
      ownerId,
      updateData,
      { new: true }
    );

    res.status(200).send({
      message: "Pigeon owner updated successfully",
      owner: normalizeOwnerDoc(updatedOwner),
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

    if (!ownerId) {
      return res.status(400).send({
        message: "Owner ID is required",
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const owner = await pigeonOwner.findById(ownerId);

      if (!owner) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).send({
          message: "Pigeon owner not found",
        });
      }

      await Tournament.updateMany(
        { participatingLofts: owner.name },
        { $pull: { participatingLofts: owner.name } }
      );

      if (owner.ownerPicture) {
        await deleteFileByUrl(owner.ownerPicture);
      }

      const deletedOwner = await pigeonOwner.findByIdAndDelete(ownerId);

      await session.commitTransaction();
      session.endSession();

      res.status(200).send({
        message: "Pigeon owner and related data deleted successfully",
        owner: deletedOwner ? normalizeOwnerDoc(deletedOwner) : deletedOwner,
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
