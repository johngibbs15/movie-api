const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    mongoose = require('mongoose'),
    Models = require('./models.js');

const app = express();
const Movies = Models.Movie;
const Users = Models.User;

const { check, validationResult } = require('express-validator');

// connect movieDB

// mongoose.connect('mongodb://localhost:27017/movieDB', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// });

// connect movieDB to atlas
mongoose.connect(process.env.CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

//Require passport module and import passport.js file

const cors = require('cors');
app.use(cors());

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

app.use(bodyParser.json());
app.use(morgan('common'));
app.use(express.static('public'));

// default text response

app.get('/', (req, res) => {
    res.send('Welcome to myFlix');
});

// return JSON object when at /movies

app.get(
    '/movies',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Movies.find()
            .then((movies) => {
                res.status(201).json(movies);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send('Error: ' + err);
            });
    }
);

//get JSON movie info when seaeching for title

app.get(
    '/movies/:Title',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Movies.findOne({ Title: req.params.Title })
            .then((movie) => {
                res.json(movie);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send('Error: ' + err);
            });
    }
);

// return movie genre when at /movies/genre/genreName

app.get(
    '/movies/genre/:genreName',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Movies.findOne({ 'Genre.Name': req.params.genreName })
            .then((movie) => {
                res.status(201).json(movie.Genre);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send('Error: ' + err);
            });
    }
);

// return movie director when at /movies/directors/director

app.get(
    '/movies/directors/:director',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Movies.findOne({ 'Director.Name': req.params.directorName })
            .then((movie) => {
                res.status(201).json(movie.Director);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send('Error: ' + err);
            });
    }
);

// add a movie what at /movies

app.post(
    '/movies',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Movies.findOne({ Username: req.body.Title }).then((movie) => {
            if (movie) {
                return res.status(400).send(req.body.Title + 'aleady exists');
            } else {
                Movies.create({
                    Title: req.body.Title,
                    Description: req.body.Description,
                    Genre: {
                        Name: req.body.Name,
                        Description: req.body.Description,
                    },
                    Director: {
                        Name: req.body.Name,
                        Bio: req.body.Bio,
                    },
                    ImageURL: req.body.ImageURL,
                    Featured: req.body.Boolean,
                })
                    .then((movie) => {
                        res.status(201).json(movie);
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).send('Error: ' + err);
                    });
            }
        });
    }
);

// add a movie to user list when at /users/:Username/movies/:MovieID

app.post(
    '/users/:Username/movies/:MovieID',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Users.findOneAndUpdate(
            { Username: req.params.Username },
            {
                $push: { FavoriteMovies: req.params.MovieID },
            },
            { new: true },
            (err, updatedUser) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Error ' + err);
                } else {
                    res.json(updatedUser);
                }
            }
        );
    }
);

// delete a movie from user list when at /users/:Username/movies/:MovieID

app.delete(
    '/users/:Username/movies/:MovieID',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Users.findOneAndUpdate(
            { Username: req.params.Username },
            {
                $pull: { FavoriteMovies: req.params.MovieID },
            },
            { new: true },
            (err, updatedUser) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Error ' + err);
                } else {
                    res.json(updatedUser);
                }
            }
        );
    }
);

// return user info when at /users

app.get(
    '/users',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Users.find()
            .then((users) => {
                res.status(201).json(users);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send('Error: ' + err);
            });
    }
);

// allow users to register what at /users

app.post(
    '/users',
    [
        check('Username', 'Username is required').isLength({ min: 5 }),
        check(
            'Username',
            'Username contains non alphanumeric characters - not allowed.'
        ).isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail(),
    ],
    (req, res) => {
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        let hashedPassword = Users.hashPassword(req.body.Password);
        Users.findOne({ Username: req.body.Username })
            .then((user) => {
                if (user) {
                    return res
                        .status(400)
                        .send(req.body.Username + ' already exists');
                } else {
                    Users.create({
                        Username: req.body.Username,
                        Password: hashedPassword,
                        Email: req.body.Email,
                        Birthday: req.body.Birthday,
                    })
                        .then((user) => {
                            res.status(201).json(user);
                        })
                        .catch((error) => {
                            console.error(error);
                            res.status(500).send('Error: ' + error);
                        });
                }
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            });
    }
);

// update user what at /users/:Username

app.put(
    '/users/:Username',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Users.findOneAndUpdate(
            { Username: req.params.Username },
            {
                $set: {
                    Username: req.body.Username,
                    Password: req.body.Password,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday,
                },
            },
            { new: true },
            (err, updatedUser) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Error: ' + err);
                } else {
                    res.json(updatedUser);
                }
            }
        );
    }
);

//deregister user when at /users/:Username

app.delete(
    '/users/:Username',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Users.findOneAndRemove({ Username: req.params.Username })
            .then((user) => {
                if (!user) {
                    res.status(400).send(
                        req.params.Username + ' was not found'
                    );
                } else {
                    res.status(201).send(req.params.Username + ' was deleted');
                }
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send('Error: ' + err);
            });
    }
);

// get api documentation what at /documentation

app.get(
    '/documentation',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        res.sendFile('public/documentation.html', { root: __dirname });
    }
);

// error handling middleware function

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(`An error has occured:${err}`);
});

// listen for requests

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});
