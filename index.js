const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');

// Assign express to a variable

const app = express();

app.use(bodyParser.json());

let users = [
    {
        id: 1,
        name: 'Ja Morant',
        favoriteMovies: [],
    },
    {
        id: 2,
        name: 'Jaren Jackson Jr.',
        favoriteMovies: ['The Firm'],
    },
];

// Create JSON object with top 10 movies

let movies = [
    {
        Title: 'The Firm',
        Description:
            "The Firm is based on John Grisham's novel about a young hotshot lawyer who gets hired to a law firm that's involved in some seriously shady dealings. The film was nominated for two Oscars (best supporting actress for Holly Hunter and best musical score).",
        Genre: {
            Type: 'Drama',
            Description:
                'Drama is the specific mode of fiction represented in performance: a play, opera, mime, ballet, etc., performed in a theatre, or on radio or television.',
        },
        Director: {
            Name: 'Sydney Pollack',
        },
        ImageURL:
            'https://upload.wikimedia.org/wikipedia/en/f/ff/Firm_ver2.jpg',
        Feature: 'Yes',
    },
    {
        Title: 'Hustle and Flow',
        Description:
            "Hustle and Flow was local writer / director Craig Brewer's first major release. One critical review described it as \"'Rocky' for pimps\". It's the story of D-Jay, a Memphis pimp and aspiring rapper whose mid-life crisis prompts him to partner with a childhood friend (and recording engineer) to make his first record.",
        Genre: {
            Type: 'Drama',
            Description:
                'Drama is the specific mode of fiction represented in performance: a play, opera, mime, ballet, etc., performed in a theatre, or on radio or television.',
        },
        Director: {
            Name: 'Craig Brewer',
        },
        ImageURL:
            'https://en.wikipedia.org/wiki/Hustle_%26_Flow#/media/File:Hustle_and_flow.jpg',
        Feature: 'Yes',
    },
    {
        Title: 'Walk the Line',
        Description:
            "Walk the Line is the life story of legendary musician Johnny Cash, from childhood through his marriage to June Carter. It's a story of love, substance abuse, standing up for others, and really great music. It was nominated for five Oscars, and won one (Best Actress, Reese Witherspoon).",
        Genre: {
            Type: 'Biopic',
            Description:
                "a film that dramatizes the life of a non-fictional or historically-based person or people. Such films show the life of a historical person and the central character's real name is used.",
        },
        Director: {
            Name: 'James Mangold',
        },
        ImageURL:
            'https://en.wikipedia.org/wiki/Walk_the_Line#/media/File:Walk_the_line_poster.jpg',
        Feature: 'Yes',
    },
];

// use morgan's common format
// serve documentation.html file from the public folder

app.use(morgan('common'));
app.use(express.static('public'));

// get movie object

app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

// get movie title

app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find((movie) => movie.Title === title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('Movie not found');
    }
});

// get genre name

app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find((movie) => movie.Genre.Type === genreName).Genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('Genre not found');
    }
});

// get director name

app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find(
        (movie) => movie.Director.Name === directorName
    ).Director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('Director not found');
    }
});

// create a new user

app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser);
    } else {
        res.status(400).send('Users need name');
    }
});

// let users update name

app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updateUser = req.body;

    let user = users.find((user) => user.id == id);

    if (user) {
        user.name = updateUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('User not found');
    }
});

// allow users to add movie to list of favorites

app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find((user) => user.id == id);

    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(
            `${movieTitle} has been added to user ${id}'s array`
        );
    } else {
        res.status(400).send('User not found');
    }
});

//remove movie title

app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find((user) => user.id == id);

    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter(
            (title) => title !== movieTitle
        );
        res.status(200).send(
            `${movieTitle} has been removed from user ${id}'s array`
        );
    } else {
        res.status(400).send('User not found');
    }
});

// allow existing users to deregister

app.delete('/users/:id/', (req, res) => {
    const { id } = req.params;

    let user = users.find((user) => user.id == id);

    if (user) {
        users = users.filter((user) => user.id != id);
        res.status(200).send(`User ${id} has been deleted`);
    } else {
        res.status(400).send('User not found');
    }
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

// error handling middleware function

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(`An error has occured:${err}`);
});

// listen for requests

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
