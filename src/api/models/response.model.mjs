import mongoose from 'mongoose';
import { defaultStatus, statusTypes } from '../../config/config.mjs';

const ResponseSchema = new mongoose.Schema(
    {
        submissionId: { type: String },
        submissionTime: { type: Date },
        questions: { type: Array },
        editLink: { type: String },
        status: { type: String, default: defaultStatus, enum: statusTypes },
        // there can be some other keys here as well like the following, but it was requested to consider only the required keys for this assignment:
        // lastUpdatedAt: { type: Date },
        // calculations: { type: Array },
        // urlParameters: { type: Array },
        // quiz: { type: Object },
        // documents: { type: Array },
    }
);

export default mongoose.model("Response", ResponseSchema);