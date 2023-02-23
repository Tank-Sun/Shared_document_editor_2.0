const { Schema, model } = require("mongoose");

const Document = new Schema({
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

  access_level: {
    type: String,
    enum: ["easy", "moderate", "strict"],
    default: "easy",
  },

  dateTime: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("Document", Document);
