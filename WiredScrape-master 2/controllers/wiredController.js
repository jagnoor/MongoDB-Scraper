// Imports
let axios = require('axios'); // HTTP Request
let cheerio = require('cheerio'); // Web Scrapper
let db = require("../models"); // Require all models

// Exports
module.exports = (app) => {
  // Routes

  // GET Routes
  //--------------------------------------------------------------------------------------------------------------------------
  // Default route will scrape the Wired Magazine website/Most Popular Articles page
  app.get("/", (req, res) =>  {
    // First, grab the body of the html with request
    axios.get("https://www.wired.com/most-popular/").then((response) => {
      // Then, load that into cheerio and save it to $ for a shorthand selector
      const $ = cheerio.load(response.data);

      let articles = [];

      // Now, grab every li with class arhive-item-component and build object to render:
      $("li.archive-item-component").each(function(i, element) {
        // Add the text, href, summary, author & read time of every article, and save them as properties of the result object
        articles.push({
          headline: $(element)
            .children("div")
            .children("a")
            .children("h2")
            .text(),
          link: "https://www.wired.com" + $(element)
            .children("a")
            .attr("href"),
          summary: $(element)
            .children("div")
            .children("a")
            .children("p")
            .text(),
          imageURL: $(element)
            .children("a")
            .children("div")
            .children("div")
            .children("div")
            .children("div")
            .children("img")
            .attr("src"),
          articleDate: $(element)
            .children("div")
            .children("div")
            .children("time")
            .text()
        })
      });
      // Successfully scraped, render the articles
      res.render("index", {articles:articles})
    });
  });

  // Retrieve saved articles from db
  app.get("/articles", function(req,res){
    db.Article.find({}).sort({articleDate:-1})
    .then(function(dbArticle) {
      // Successfully found Articles, send them back to the client
      res.render("index", {articles:dbArticle});
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
  });

  // Route for getting all the notes for a specific article
  app.get("/notes/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Note.find({ article: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("article")
      .then(function(dbNotes) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        console.log(`all notes: ${dbNotes}`)
        res.json(dbNotes)
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // POST Routes
  //--------------------------------------------------------------------------------------------------------------------------
  // Route for saving an Article
  app.post("/saveArticle", (req,res) => {
    db.Article.find({headline:req.body.headline})
    .then(function(dbArticle) {
      // If article is not already saved, then add it to the db
      if (dbArticle.length ===0){
        db.Article.create(req.body)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
          res.send("status 200")
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        })
      }
      // Article already saved in db
      else {
        console.log("Article already in db")
      }
    })
  })

  // Route for saving an Article's associated Note
  app.post("/note", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {
        res.json(dbNote);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // DELETE Routes
  //--------------------------------------------------------------------------------------------------------------------------
  // Delete article from db
  app.delete("/article/:id", function(req,res) {
    db.Article.deleteOne({"_id":req.params.id})   // Delete article
    .then(function(response){
      console.log("article deleted")
      db.Note.deleteMany({"article":req.params.id})   // Delete all associated notes
      .then (function(response){
        console.log("notes deleted")
        res.end()
      })
    })
  })

  // Delete note from db
  app.delete("/note/:id", function(req,res) {
    db.Note.deleteOne({"_id":req.params.id})    // Delete note
    .then(function(response){
      console.log("note deleted")
      res.end()
    })
  })

} // End of Module Export