import bannerModal from "../models/bannerModel.js";
import { normalizeBannerDoc } from "../config/mediaUrl.js";
import { deleteFileByUrl, uploadBuffer } from "../config/s3.js";

export const createBanner = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .send({ message: "No file uploaded. Please provide a banner image." });
  }

  try {
    const bannerPicture = await uploadBuffer({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      contentType: req.file.mimetype,
      folder: "banners",
    });

    const bannerData = { bannerPicture };

    const banner = new bannerModal(bannerData);
    await banner.save();

    res.status(201).send({
      message: "Banner created successfully.",
      banner: normalizeBannerDoc(banner),
    });
  } catch (error) {
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
    const normalized = banners.map((b) => normalizeBannerDoc(b));

    res.status(200).send({
      message: "Banners fetched successfully.",
      banners: normalized,
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
    const banner = await bannerModal.findById(bannerId);

    if (!banner) {
      return res.status(404).send({ message: "Banner not found" });
    }

    await deleteFileByUrl(banner.bannerPicture);
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
