const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gallerySchema = new Schema({
    title: { type: String, required: true },
    paragraph: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    images: [
        {
            imageUrl: { type: String, required: true },
            originalFilename: { type: String, required: true }
        }
    ],
    videos: [
        {
            videoUrl: { type: String, required: true },
            originalFilename: { type: String, required: true }
        }
    ]
});

gallerySchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Gallery = mongoose.model('Gallery', gallerySchema);

module.exports = Gallery;
