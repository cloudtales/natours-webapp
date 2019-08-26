const mongoose = require('mongoose');
const catchAsync = require('./../utils/catchAsync');
const Tour = require('./tourModel');

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty.']
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be above 1.0 '],
      max: [5, 'Rating must below 5.0']
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    tour: {
      // Parent referencing
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour']
    },
    user: {
      // Parten referencing
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); // each combination of tour and user always have to be unique

reviewSchema.pre(/^find/, function(next) {
  // this.populate({
  //   path: 'user',
  //   select: 'name photo'
  // }).populate({
  //   path: 'tour',
  //   select: 'name'
  // });

  this.populate({
    path: 'user',
    select: 'name photo'
  });

  next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
  const stats = await this.aggregate([
    // only select reviews for a specific tourId
    {
      $match: { tour: tourId }
    },
    {
      // group by tour(tourId)
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 }, // count eacht review per tourId as 1 (5 Reviews of tourId =1 , nRatings =5)
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    //reset to defaults
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

// Calculate new abearge on tours AFTER the review has bee saved

reviewSchema.post('save', function() {
  // this points the current review
  this.constructor.calcAverageRatings(this.tour); //Pass tour id
});

//findByIdAndUpdate
//findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next) {
  // We don't have access to the document here, becuase we get a query result
  this.r = await this.findOne(); //So, we have to execute the query HERE and save the docuemnt to have access to the tourID later in the post middleware (see below)
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  // this.r = await this.findOne(); does NOT work here, since the query has already been executed
  // Use the r object which we persisted above
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
