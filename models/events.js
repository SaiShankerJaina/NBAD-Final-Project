const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const connectionSchema = new Schema({
  title: {
    type: String,
    required: [true, "is required"],
  },
  category: {
    type: String,
    required: [true, "is required"],
  },
  host:{ 
    type: Schema.Types.ObjectId, ref: 'User',
    required: [true, "is required"],
  },
  pic: {
    type: String,
    required: [true, "is required"],
    matches: [/^(http:\/\/|https:\/\/).+/, "is not a valid url"],
  },
  location: {
    type: String,
    required: [true, "is required"],
  },
  date: {
    type: String,
    required: [true, "is required"],
    match: [/^\d{4}-\d{2}-\d{2}$/, "is not a valid date"],
  },
  start: {
    type: String,
    required: [true, "is required"],
    match: [/^\d{2}:\d{2}$/, "is not a valid time"],
  },
  end: {
    type: String,
    required: [true, "is required"],
    match: [/^\d{2}:\d{2}$/, "is not a valid time"],
  },
  description: {
    type: String,
    required: [true, "is required"],
    minlength: [10, "must be at least 10 characters long"],
  },
});

// create and export model
module.exports = mongoose.model("Connection", connectionSchema);

