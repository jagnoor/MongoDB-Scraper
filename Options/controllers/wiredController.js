// Imports
let axios = require('axios'); // HTTP Request
let cheerio = require('cheerio'); // Web Scrapper
let mongoose = require('mongoose'); // MongoDB ORM
let db = require("../models"); // Require all models

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/wiredDB");

// Exports
module.exports = (app) => {
  // Routes

  // Default route
  // Get all articles from db
  app.get("/", function(req, res) {
    db.Article.find({})
    .then(function(dbArticle) {
      // Successfully found Articles, send them back to the client
      // res.json(dbArticle);
      res.render("index", {articles:dbArticle});
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
  });


  // A GET route for scraping the Wired/Most Popular website
  app.get("/scrape", function(req, res) {
    // First, grab the body of the html with request
    axios.get("https://www.wired.com/most-popular/").then((response) => {
      // Then, load that into cheerio and save it to $ for a shorthand selector
      let $ = cheerio.load(response.data);
      // console.log(`data: ${response.data}`)

      // Now, grab every section with classes l, m & n, and do the following:
      $("li.archive-item-component").each(function(i, element) {
        // Save an empty result object
        var result = {};

        // Add the text, href, summary, author & read time of every article, and save them as properties of the result object
        result.headline = $(element)
          .children("div")
          .children("a")
          .children("h2")
          .text();
        result.link = "https://www.wired.com" + $(element)
          .children("a")
          .attr("href");
        result.summary = $(element)
          .children("div")
          .children("a")
          .children("p")
          .text();
        result.imageURL = $(element)
          .children("a")
          .children("div")
          .children("div")
          .children("div")
          .children("div")
          .children("img")
          .attr("src");
        result.articleDate = $(element)
          .children("div")
          .children("div")
          .children("time")
          .text()

        // Do not save to database if empty result
        if (result.headline !== "") {
          console.log(`result: ${JSON.stringify(result)}\n`);

          // Create a new Article using the `result` object built from scraping
          db.Article.create(result)
            .then(function(dbArticle) {
              // View the added result in the console
              console.log(dbArticle);
            })
            .catch(function(err) {
              // If an error occurred, send it to the client
              return res.json(err);
            });
        }
      });
        
      // If successfully scrape and save an Article, send a message to the client
      res.send("Scrape Complete");
    });
  });

  // Route for getting all Articles from the db
  app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function(dbArticle) {
        // Successfully found Articles, send them back to the client
        // res.json(dbArticle);
        res.render("index", {articles:dbArticle});
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // Route for grabbing a specific Article by id, populate it with it's note
  app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // Route for saving/updating an Article's associated Note
  app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
} // End of Module Export
