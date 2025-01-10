const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema({
    _id: { type: String, required: true },  // State hash as the unique identifier
    entityId: { type: Number, required: true, index: true },  // The entityId for fast retrieval
    data: { type: mongoose.Schema.Types.Mixed, required: true },  // JSON object
    lastUpdated: { type: Date, default: Date.now }
});

const State = mongoose.model('State', stateSchema);

module.exports = State;

