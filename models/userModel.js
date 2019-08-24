const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const catchAsync = require('./../utils/catchAsync');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name.']
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],

    validate: {
      // This only works on create and save, not on update!!
      validator: function(el) {
        return el === this.password;
      },
      message: 'The password do not match.'
    }
  },
  passwordChangedAt: {
    type: Date
  },
  passwordResetToken: String,
  passwordResetExpires: Date
});

// async middleware due to the fact bcrypt takes a bit of time
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next(); // Check if the acutal field has been updated, maybe teh user only updated the email

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined; // this way the field will not be persisted into mongo
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next(); // only add the field if the password is new (i.e. /resetPassword) not when a user is created

  this.passwordChangedAt = Date.now(); //- 1000; //small hack to assure teh token is created after the password has changes (db slow)
  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // We use a less stronger crypto here, becuase it will be only valid for 10 minutes
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  //save to databasePassword

  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
