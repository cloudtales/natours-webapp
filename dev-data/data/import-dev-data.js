const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

const tours = require('./tours.json');
const reviews = require('./reviews.json');
const users = require('./users.json');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// IMPORT DATA INTO DATABASE

const importData = async () => {
  await Tour.create(tours);
  await Review.create(reviews);
  await User.create(users, { validateBeforeSave: false }); // Turn of validation (We don't have a passwordConfirm)

  console.log('Data succesfully loaded');
};

// DELETE ALL DATA FROM COLLECTION

const deleteData = async () => {
  await Tour.deleteMany();
  await User.deleteMany();
  await Review.deleteMany();
  console.log('Data succesfully deleted');
};

(async () => {
  try {
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    if (process.argv[2] === '--delete') {
      await deleteData();
    } else if (process.argv[2] == '--import') {
      await importData();
    } else {
      console.log("Please specify '--import' or '--delete'");
    }
    await mongoose.disconnect();
  } catch (err) {
    console.log(err);
  }
})();
