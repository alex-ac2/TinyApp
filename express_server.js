const express = require("express");
const userDB = require("./db/user_db.js").users;
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

// Scan userDB for property value
function scanUserDB(property, value) {
  for (key in userDB) {
    if (userDB[key].property === value) {
      return true;
    } else {
      return false;
    }
  }
  
}

function checkUserDB(key, value) {
  console.log(key, value);
  let userExists;

  // To-do: edit to include cases(id, password, email)
  Object.keys(userDB).forEach((entry) => {
    // console.log(entry);
    // console.log(userDB[entry][key]);
    if (userDB[entry][key] === value) {
      console.log('User exists!');
      userExists = false 
    } else {     
      console.log("hopefully add user");
      userExists = true; 
    }
  });
  return userExists;
}
// test broken
// URL index - list all shortened URLs
app.get("/urls", (req, res) => {
  let templateVars = { 
    user: null,
    urls: urlDatabase
  };

  if (req.cookies.user_id) {
    templateVars.user = userDB[req.cookies.user_id];
  }

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
    user_id: req.cookies["user_id"],
    urls: urlDatabase,
    user: null
  };

  if (req.cookies.user_id) {
    templateVars.user = userDB[req.cookies.user_id];
  }

  res.render("urls_new", templateVars);
});

// User registration
app.get("/register", (req, res) => {
  let templateVars = {
    user_id: req.cookies["user_id"],
    user: null,
    urls: urlDatabase,
    status: undefined,
    registration: false,
    userExists: undefined,
    userObject: userDB
    //userEmail: userDB[user_id].email
  };

  if (req.cookies.user_id) {
    templateVars.user = userDB[req.cookies.user_id];
  }

  res.render("registration", templateVars);
});

// Registration to userDB
app.post("/register", (req, res) => {
  console.log(req.body);
  let templateVars = {
    status: undefined,
    registration: false,
    userExists: undefined
  };
  let checkUserEmail = checkUserDB('email', req.body.email);
  if (req.body.email === "" || req.body.password === "") {
    res.redirect(400, "/register/"); 
  } else if (checkUserEmail) {
    let id = generateRandomString();
    let newUser = {
      id: id,
      email: req.body.email,
      password: req.body.password
    };
    userDB[newUser.id] = newUser;
    console.log(userDB);
    res.cookie('user_id', id);
    templateVars.registration = true;
    templateVars.status = 200;
    res.redirect("/register/");
  } else {
    console.log("no user added");
    templateVars.userExists = true;
    res.status(400);
    res.send("Email already taken");
  }
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
    username: req.cookies["user_id"],
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] 
  };
  res.render("urls_show", templateVars);
});

// Login page route
app.get("/login", (req, res) => {
  let templateVars = { 
    user_id: req.cookies["user_id"],
    urls: urlDatabase,  
    userObject: userDB,
    user: null
  };
   
  if (req.cookies.user_id) {
    templateVars.user = userDB[req.cookies.user_id];
  }

  res.render("login", templateVars);
});

getUserByEmailPassword = (email, password) => {
  let user = null;
  
  for(let userId in userDB) {
    console.log('currently processing ', userId)
    if(userDB[userId].email === email && userDB[userId].password === password) {
      user = userDB[userId];
    }
  }

  return user;
}

//test
// Login Post route
app.post("/login", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400);
    res.send('Email and password cannot be empty');
  }

  let user = getUserByEmailPassword(req.body.email, req.body.password);

  if(user) {
    res.cookie('user_id', user.id)
    res.redirect("/urls/");
  } else {
    res.status(400);
    res.send("invalid username and/or password");
  }
  
});

// LogOUT route
app.post("/logout", (req, res) => {
  console.log("Logout user");
  res.clearCookie('user_id');

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
