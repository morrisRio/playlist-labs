import mongoose, { Schema } from "mongoose";
import { playlistSchema } from "@/models/playlistSchema";

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },

    spotify_id: {
        type: String,
        required: true,
        unique: true,
    },

    playlists: [playlistSchema],
});

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

export default UserModel;
