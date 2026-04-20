import mongoose from "mongoose";

const headlineSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Headline = mongoose.model("Headline", headlineSchema);

export default Headline;
