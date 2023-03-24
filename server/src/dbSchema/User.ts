import { Schema, model } from "mongoose";

const User = new Schema({
  username: {
    required: true,
    type: String,
  },

  email: {
    required: true,
    type: String,
  },

  password: {
    required: true,
    type: String,
  },

  profilePic: {
    type: String,
    default: "https://i02piccdn.sogoucdn.com/88a059cd94768c2a",
  },

  documents: {
    type: Schema.Types.ObjectId,
    ref: "Document",
  },
});

export default  model("User", User);
