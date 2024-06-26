const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vlogSchema = new Schema({
    title: { type: String, required: true },
    paragraph: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    videos: [
        {
            videoUrl: { type: String, required: true },
            originalFilename: { type: String, required: true }
        }
    ]
});

vlogSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Vlog = mongoose.model('Vlog', vlogSchema);

module.exports = Vlog;
