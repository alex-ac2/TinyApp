const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

let  urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  console.log(req.params.shortURL);
  let templateVars = { 
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] 
  };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  let templateVarHello = { greeting: 'Why hello friend' };
  res.render("hello_world", templateVarHello);
  console.log("Hello response sent.");
});

// Initiate app using PORT variable
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
