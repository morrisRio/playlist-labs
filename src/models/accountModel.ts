import mongoose, { Schema } from "mongoose";

const accountSchema = new Schema({
    spotify_id: {
        type: String,
        required: true,
        unique: true,
    },
    access_token: {
        type: String,
        required: true,
    },
    refresh_token: {
        type: String,
        required: true,
    },
    token_expires: {
        type: Date,
        required: true,
    },
});

const AccountModel = mongoose.models.Account || mongoose.model("Account", accountSchema);

export default AccountModel;
