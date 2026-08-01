import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        post_id: {
            type: String,
            auto: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
        },
        title: { 
            type: String, 
            required: true, 
            minlength: 10, 
            maxlength: 100 
        },
        caption: { 
            type: String 
        },
        media_type: {
            type: String,
            enum: ["Text", "Video", "Image"],
            default: "Text",
        },
        media_link: { 
            type: String, 
            required: true 
        },
        posted_at: { 
            type: Date, 
            default: Date.now 
        },
        deleted_status: { 
            type: Boolean, 
            default: false 
        },
    },
    { timestamps: true },
);

export default mongoose.model("post", postSchema);
