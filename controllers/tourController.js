const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.getAllTours = (req, res) => {
  res.status(200).json({
    // Use JSend specification
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length, // not part of the JSend specification, but very handy IMHO
    data: {
      tours: tours
    }
  });
};

exports.getTour = (req, res) => {
  const id = req.params.id * 1; // trick, multiply string by a number -> coercion
  const tour = tours.find(el => el.id === id); // will create a new array when el.id == req.params.id

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  res.status(200).json({
    // Use JSend specification
    status: 'success',
    tour: tour
  });
};

exports.createTour = (req, res) => {
  //console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body); // create a new object and merge the objects in the parameters

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });
    }
  );
};

exports.updateTour = (req, res) => {
  //let's prefer patch over put for modification
  const id = req.params.id * 1; // trick, multiply string by a number -> coercion
  const tour = tours.find(el => el.id === id); // will create a new array when el.id == req.params.id

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  //TODO
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here>'
    }
  });
};

exports.deleteTour = (req, res) => {
  const id = req.params.id * 1; // trick, multiply string by a number -> coercion
  const tour = tours.find(el => el.id === id); // will create a new array when el.id == req.params.id

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  //TODO
  res.status(204).json({
    //204 no content
    status: 'success',
    data: null
  });
};
