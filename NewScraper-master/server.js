const express = require("express");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const logger = require("morgan");
const mongoose = require("mongoose");

const PORT = process.env.PORT ? process.env.PORT : 1987;

const app = express();

let router = express.Router();

app.use(logger("dev"));

require("./config/routes")(router);

app.use(express.static(__dirname + "/public"));

app.engine("handlebars", exphbs({
  defaultLayout: "main"
}));
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({
  extended: false
}))

app.use(router);

const db = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines"

mongoose.connect(db, function(error){
  if (error){
    console.log(error)
  }
  else{
    console.log("mongoose connection is successful")
  }
})

app.listen(PORT, function(){
  console.log(`Listening on port ${PORT}`)
})