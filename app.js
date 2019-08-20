const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();

// 1) MIDDLEWARES
app.use(morgan('dev'));
app.use(express.json()); // middleware

app.use((req, _res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// 2) ROUTE HANDLERS

const getAllTours = (req, res) => {
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

const getTour = (req, res) => {
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

const createTour = (req, res) => {
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

const updateTour = (req, res) => {
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

const deleteTour = (req, res) => {
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

const getAllUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route not yet defined!'
  });
};
const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route not yet defined!'
  });
};
const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route not yet defined!'
  });
};
const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route not yet defined!'
  });
};
const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route not yet defined!'
  });
};

//app.get('/api/v1/tours', getAllTours);
//app.get('/api/v1/tours/:id', getTour);
//app.post('/api/v1/tours', createTour);
//app.patch('/api/v1/tours/:id', updateTour);
//app.delete('/api/v1/tours/:id', deleteTour);

// 3) ROUTES
app
  .route('/api/v1/tours')
  .get(getAllTours)
  .post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

app
  .route('/api/v1/users')
  .get(getAllUser)
  .post(createUser);

app
  .route('/api/v1/users/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

// 4) START THE SERVER
const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
