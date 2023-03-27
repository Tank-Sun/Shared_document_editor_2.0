import { Schema, model } from "mongoose";

const Documents = new Schema({
  URL: {
    required: true,
    type: String,
  },

  title: {
    type: String,
    trim: true,
    default: "Mydocument",
  },

  data: {
    required: true,
    type: Object,
  },

  creator: {
    required: true,
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  view_access: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  view_edit_access: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  share_access: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  dateTime: {
    type: Date,
    default: Date.now,
  },
});

export default model("Documents", Documents);
