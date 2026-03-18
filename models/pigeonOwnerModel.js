import mongoose from "mongoose";

const ownerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerPicture: { type: String }, // URL or path to the image
  address: { type: String },
  phone: { type: String },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
    required: true,
  }, // Reference to the admin model
  tournaments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tournament" }],

  // Array of prize descriptions
});

const owner = mongoose.model("pigeonOwner", ownerSchema);

export default owner;
