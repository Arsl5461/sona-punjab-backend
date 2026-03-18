import mongoose from "mongoose";

const resultsSchema = new mongoose.Schema(
    {
        tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
        pigeonOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'pigeonOwner', required: true },
        startTime: { type: String, required: true },
        date:{ type: String, required: true },
        timeList: [{ type: String, sparse: true }],
    },
    { timestamps: true }
);

const TournamentResult = mongoose.model("TournamentResult", resultsSchema);

export default TournamentResult;
