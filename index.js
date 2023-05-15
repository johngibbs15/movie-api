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

/**
 * @route GET /movies
 * @group Movies
 * @authentication JWT
 * @returns {Array.<Movie>} 200 - An array of movies
 * @returns {Error} 500 - Server error
 */
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

/**
 * @route GET /movies/{Title}
 * @group Movies
 * @authentication JWT
 * @param {string} Title.path.required
 * @returns {Movie} 200 - A movie object
 * @returns {Error} 500 - Server error
 */
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

/**
 * @route GET /movies/genre/{genreName}
 * @group Movies
 * @authentication JWT
 * @param {string} genreName.path.required
 * @returns {Genre} 200 - A genre object
 * @returns {Error} 500 - Server error
 */
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

/**
 * @route GET /movies/directors/{directorName}
 * @group Movies
 * @authentication JWT
 * @param {string} directorName.path.required
 * @returns {Director} 200 - A director object
 * @returns {Error} 500 - Server error
 */
app.get(
    '/movies/directors/:directorName',
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

/**

@function
@route POST /movies
@authentication This route requires authentication using the 'jwt' strategy.
@param {object} req - Express request object
@param {object} res - Express response object
@description This route is used to add a movie to the Movies collection. If a movie with the same Title already exists, it will return an error. If the movie is successfully added, it returns the movie object with a status code of 201.
*/
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
/**
    
    @function
    @route POST /users/:Username/movies/:MovieID
    @param {object} req - Express request object
    @param {object} res - Express response object
    @description This route is used to add a movie to the list of FavoriteMovies of a specific user. It finds the user with the specified username and updates their FavoriteMovies list to include the specified movie ID. If the update is successful, it returns the updated user object.
    */
app.post(
    '/users/:Username/movies/:MovieID',
    // passport.authenticate('jwt', { session: false }),
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

/**
 * @function
 * @route DELETE /users/:Username/movies/:MovieID
 * @description Deletes a movie from the user's list of favorite movies.
 * @param {string} req.params.Username - The username of the user.
 * @param {string} req.params.MovieID - The ID of the movie to be removed.
 * @returns {object} The updated user object.
 * @throws Will return an error message with a status code of 500 in case of any server error.
 */
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
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
});

/**
 * @function
 * @route GET /users
 * @description Gets the list of all users.
 * @param {object} req.user - The authenticated user object.
 * @returns {object} An array of user objects.
 * @throws Will return an error message with a status code of 500 in case of any server error.
 */
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

// return user info when at /users:Username

app.get(
    '/users/:Username',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const username = req.params.Username;

        Users.findOne({ Username: username })
            .then((users) => {
                res.status(201).json(users);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send('Error: ' + err);
            });
    }
);

/**
 * @route POST /users
 * @description Allow users to register a new account
 * @access Private
 */
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

/**
 * @route DELETE /users/:Username
 * @description Deregister a user account
 * @access Private
 */
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

/**
 * @route GET /documentation
 * @description Get API documentation page
 * @access Private
 */
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
