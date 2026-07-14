import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    _id: { type: String, required: true },

    elements: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: () => new Map(),
    },

    hostToken: { type: String, required: true },

    hostSocketId: { type: String, default: null },

    hostName: { type: String, default: "Host" },

    active: { type: Boolean, default: true },

});

export const Session = mongoose.model("Session", sessionSchema);
