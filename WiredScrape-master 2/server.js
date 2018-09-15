var express = require("express"); // Express Server
var bodyParser = require("body-parser"); // Post Body Request
var logger = require("morgan"); // Logger
let exphbs = require('express-handlebars'); // Templating Engine
let mongoose = require('mongoose'); // MongoDB ORM

// Set Default Port for Express and Heroku
let PORT = process.env.PORT || 3000; 

// Initialize Express
var app = express();

// Configure middleware

// Setup morgan logger for logging requests
app.use(logger("dev"));

// Setup body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/wiredDB"

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Setup access to static assets
app.use(express.static("public"));

// Setup Handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Configure routes
require("./controllers/wiredController.js")(app);

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
