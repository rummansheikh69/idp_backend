import mongoose, { Schema } from "mongoose";

const bannerSchema = new Schema(
  {
    image: {
      type: String,
      required: true,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    tag: {
      type: String,
    },
  },
  { timestamps: true },
);

export const Banner = mongoose.model("Banner", bannerSchema);
