import fs from "fs";
import path from "path"; // Import path module
import { fileURLToPath } from "url";
import bannerModal from "../models/bannerModel.js";

// Get the current directory of the module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createBanner = async (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  // Check if a file was uploaded
  if (!req.file) {
    return res
      .status(400)
      .send({ message: "No file uploaded. Please provide a banner image." });
  }

  const bannerData = {
    bannerPicture: `${baseUrl}/uploads/${req.file.filename}`, // Use 'filename' instead of 'path'
  };

  try {
    // Create a new banner document and save it
    const banner = new bannerModal(bannerData);
    await banner.save();

    // Send successful response with banner data
    res.status(201).send({
      message: "Banner created successfully.",
      banner,
    });
  } catch (error) {
    // Send error response with error details
    console.error("Error creating banner:", error);
    res.status(500).send({
      message: "An error occurred while creating the banner.",
      error: error.message || error,
    });
  }
};

export const getBanners = async (req, res) => {
  try {
    const banners = await bannerModal.find();

    res.status(200).send({
      message: "Banners fetched successfully.",
      banners,
    });
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).send({
      message: "An error occurred while fetching banners.",
      error: error.message || error,
    });
  }
};

export const deleteBanner = async (req, res) => { 
  const { bannerId } = req.params;

  try {
    // Fetch the banner document
    const banner = await bannerModal.findById(bannerId);

    if (!banner) {
      return res.status(404).send({ message: "Banner not found" });
    }

    // Extract the relative file path from the banner URL
    const relativeFilePath = banner.bannerPicture.replace(
      `${req.protocol}://${req.get("host")}/`,
      ""
    );

    // Construct the absolute file path
    const filePath = path.join(__dirname, "..", relativeFilePath);

    // Verify if the file exists before attempting to delete
    if (!fs.existsSync(filePath)) {
      return res.status(404).send({ message: "File not found on the server." });
    }

    // Delete the file
    fs.unlinkSync(filePath);

    // Remove the banner record from the database
    await bannerModal.deleteOne({ _id: bannerId });

    res.status(200).send({ message: "Banner and image deleted successfully." });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).send({
      message: "An error occurred while deleting the banner.",
      error: error.message || error,
    });
  }
};
