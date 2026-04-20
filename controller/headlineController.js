import Headline from "../models/headlineModel.js";

function bodyText(body) {
  if (typeof body === "string") return body;
  if (body && typeof body.text === "string") return body.text;
  if (body && Array.isArray(body.text) && body.text.length) {
    return String(body.text[0]);
  }
  return "";
}

const createHeadline = async (req, res) => {
  try {
    const text = bodyText(req?.body);

    if (!text || String(text).trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Headline text is required",
      });
    }

    const headline = await Headline.create({ text: String(text).trim() });
    return res.status(201).json({
      success: true,
      message: "Headline created successfully",
      headline,
    });
  } catch (error) {
    console.error("Error in creating headline:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating headline",
    });
  }
};

const getAllHeadlines = async (req, res) => {
  try {
    const headlines = await Headline.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Headlines fetched successfully",
      headlines,
    });
  } catch (error) {
    console.error("Error in getting all headlines", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateHeadline = async (req, res) => {
  try {
    const { headlineId } = req?.params;
    const text = bodyText(req?.body);

    if (!headlineId) {
      return res.status(400).json({
        success: false,
        message: "Headline id is required",
      });
    }

    if (!text || String(text).trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Headline text is required",
      });
    }

    const updated = await Headline.findByIdAndUpdate(
      headlineId,
      { text: String(text).trim() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Headline not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Headline updated successfully",
      headline: updated,
    });
  } catch (error) {
    console.error("Error in updating headline", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteHeadline = async (req, res) => {
  try {
    const { headlineId } = req?.params;

    if (!headlineId) {
      return res.status(400).json({
        success: false,
        message: "Headline id is required",
      });
    }

    const headline = await Headline.findByIdAndDelete(headlineId);

    if (!headline) {
      return res.status(404).json({
        success: false,
        message: "Headline not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Headline deleted successfully",
      headline,
    });
  } catch (error) {
    console.error("Error in deleting headline", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { createHeadline, getAllHeadlines, updateHeadline, deleteHeadline };
