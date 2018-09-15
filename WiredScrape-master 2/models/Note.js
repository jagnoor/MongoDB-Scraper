const mongoose = require("mongoose");

// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

// Using the Schema constructor, create a new NoteSchema object
const NoteSchema = new Schema({
  name: String,
  body: String,
  article: {
    type: Schema.Types.ObjectId,
    ref: "Article"
  }
});

// Create model from the above schema, using mongoose's model method
const Note = mongoose.model("Note", NoteSchema);

// Export the Note model
module.exports = Note;
