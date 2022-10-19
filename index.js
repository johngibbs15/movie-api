// Require express & morgan (express logger)

const express = require("express"),
  morgan = require("morgan");

// Asign express to a variable

const app = express();

// Create JSON objext with top 10 movies

let topMovies = [
  {
    title: "Barbarian",
    director: "Zach Cregger",
  },
  {
    title: "The Wrestler",
    director: "Darren Aronofsky",
  },
  {
    title: "Eternal Sunshine of the Spotless Mind",
    director: "Michael Gondry",
  },
  {
    title: "Silver Linings Playbook",
    director: "David O. Russel",
  },
  {
    title: "Ex Machina",
    director: "Alex Garland",
  },
  {
    title: "Parasite",
    director: "Bong Joon-ho",
  },
  {
    title: "Star Wars: Return of the Jedi",
    director: "George Lucas",
  },
  {
    title: "Muholland Drive",
    director: "David Lynch",
  },
  {
    title: "Her",
    director: "Spike Jonze",
  },
  {
    title: "Interstellar",
    director: "Christopher Nolan",
  },
];

// use morgan's common format
// serve documentation.html file from the public folder

app.use(morgan("common"));
app.use(express.static("public"));

// GET requests

app.get("/movies", (req, res) => {
  res.json(topMovies);
});

app.get("/documentation", (req, res) => {
  res.sendFile("public/documentation.html", { root: __dirname });
});

app.get("/", (req, res) => {
  res.send("Howdy, this is a Movie API!");
});

// error handling middleware function

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// listen for requests

app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});
