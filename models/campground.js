const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const CampgroundSchema = new Schema ({
    title: String,
    price: String,
    description: String,
    location: String

});

const db = mongoose.connection;
const camp = db.model('camp', CampgroundSchema);

module.exports = camp;
