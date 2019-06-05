const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Generate and retun random string for URL key
function generateRandomString() {
  let randomID = Math.random().toString(36).substr(3, 6);
  return randomID;
}

// URL index - list all shortened URLs
app.get("/urls", (req, res) => {
  let templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase  
  };

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
  let templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase  
  };

  res.render("urls_new", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];

  res.redirect("/urls/");
});

app.post("/urls/:shortURL/update", (req, res) => {
  console.log('body: ', req.body);
  console.log('params: ', req.params);
  let id = req.params.shortURL;
  urlDatabase[id] = req.body[id];
  console.log("Update written");

  res.redirect("/urls/");
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
    username: req.cookies["username"],
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] 
  };
  res.render("urls_show", templateVars);
});

// Login route
app.post("/login", (req, res) => {
  console.log(req.cookies);
  if (req.cookies.username === req.body.username) {
    console.log("Username has been here"); 
  } else {
    res.cookie('username', req.body.username);
    res.status(200);
  }
  res.redirect("/urls/");
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
