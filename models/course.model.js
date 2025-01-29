const mongoose = require('mongoose')
const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        courseImage: {
            type: String,  // Store the path to the image or URL
            required: false,
        },
    }
)
module.exports = mongoose.model('Course', courseSchema)