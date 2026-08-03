import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    comment_id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    post_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
    cmt_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    description: {
      type: String,
      minlength: 3,
      maxlength: 150,
      required: true,
    },
    cmt_at: {
      type: Date,
      default: Date.now,
    },
    delete_status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("comment", commentSchema);
