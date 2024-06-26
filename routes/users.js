const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true, unique: true },
  message: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
