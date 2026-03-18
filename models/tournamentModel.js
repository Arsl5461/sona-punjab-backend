import mongoose from "mongoose";

const tournamentSchema = new mongoose.Schema({
  tournamentName: { type: String, required: true },
  tournamentPicture: { type: String, required: true }, // URL or path to the image
  tournamentInfo: { type: String },
  category: { type: String },
  dates: { type: [String], required: true }, // Array of dates
  club: { type: String, required: true },
  numberOfDays: { type: Number, required: true },
  startTime: { type: String, required: true },
  numberOfPigeons: { type: Number, required: true },
  helperPigeons: { type: Number },
  continueDays: { type: Number, required: true },
  status: { type: String, required: true },
  participatingLofts: { type: [String] }, // Array of loft names
  numberOfPrizes: { type: Number },
  prizes: { type: [String] }, // Array of prize descriptions
  allowedAdmins: { type: [String] },
});

const Tournament = mongoose.model("Tournament", tournamentSchema);

export default Tournament;
