import mongoose from "mongoose";
import { mongoUri } from "../config/config.mjs";

export const connectDatabase = () => {
    mongoose.connect(mongoUri);
};