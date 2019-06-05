const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

let  urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Generate random string for URL key
function generateRandomString() {
  let randomID = Math.random().toString(36).substr(3, 6);
  return randomID;
}

// URL index - list all shortened URLs
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Save user inputed shortened URLs and redirect 
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let generatedID = generateRandomString();
  urlDatabase[generatedID] = req.body.longURL;
  console.log(urlDatabase);

  res.redirect(301,"/urls/" + generatedID);
});

// Page to input to shortened URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Redirect route from shortened URL to website
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]; 
  console.log("Redirection occured.");
  res.redirect(longURL);
});

// Shortened URL display page
app.get("/urls/:shortURL", (req, res) => {
  console.log(req.params.shortURL);
  let templateVars = { 
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] 
  };
  res.render("urls_show", templateVars);
});

// Test hello route
app.get("/hello", (req, res) => {
  let templateVarHello = { greeting: 'Why hello friend' };
  res.render("hello_world", templateVarHello);
  console.log("Hello response sent.");
});

// Initiate app using PORT variable
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
