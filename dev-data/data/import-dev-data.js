const fs = require('fs');

const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// READ JSON FILE

const tours = require('./tours-simple.json');

// IMPORT DATA INTO DATABASE

const importData = async () => {
  await Tour.create(tours);
  console.log('Data succesfully loaded');
};

// DELETE ALL DATA FROM COLLECTION

const deleteData = async () => {
  await Tour.deleteMany();
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
