const express = require("express");
const userDB = require("./db/user_db.js").users;
const urlDB = require("./db/url_db.js").urls;
const cryptStore = require("./crypt_store.js");
var cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// const cookieParser = require('cookie-parser');
// app.use(cookieParser());

app.use(cookieSession({
  name: 'session',
  keys: ["BranchLabSec", "Motorolla"],                    // [/* secret keys */],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.set("view engine", "ejs");

let urlDatabase = urlDB;

// let urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

// Generate and retun random string for URL key
function generateRandomString() {
  let randomID = Math.random().toString(36).substr(3, 6);
  return randomID;
}

// Test Command
// urlsForUser('1234');
// Filter url_db matching user_id (returns filtered array)
function urlsForUser(id) {
  let filteredUrlObj = {};

  for (entry in urlDatabase) {
    if (urlDatabase[entry].userID === id) {
      filteredUrlObj[entry] = { longURL: urlDatabase[entry].longURL };
    }
  }
  console.log(filteredUrlObj);
  return filteredUrlObj;
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

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// URL index - list all shortened URLs
app.get("/urls", (req, res) => {
  let templateVars = { 
    user: null,
    urls: null, 
    loginRedirect: null,
    urlOwnerRedirect: null
  };
  
  if (req.session.user_id) {
    templateVars.user = userDB[req.session.user_id];
    templateVars.urls = urlsForUser(req.session.user_id);
  }

  // Check for logged in user (perhaps check for id in database)
  if (req.session.user_id) {
    templateVars.user = userDB[req.session.user_id];
    res.render("urls_index", templateVars);
  } else {
    templateVars.loginRedirect = true;
    res.render('login', templateVars);
  }

});

// Save user inputed shortened URLs and redirect 
app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  let user_id = req.session["user_id"];
  let generatedID = generateRandomString();
  urlDatabase[generatedID] = { longURL: req.body.longURL, userID: user_id };
  console.log(urlDatabase);

  res.redirect(301,"/urls/" + generatedID);
});

// Page to input to shortened URL
app.get("/urls/new", (req, res) => {
  let templateVars = { 
    user_id: req.session["user_id"],
    urls: urlDatabase,
    user: null,
    loginRedirect: null
  };

  // Check for logged in user (perhaps check for id in database)
  if (req.session.user_id) {
    templateVars.user = userDB[req.session.user_id];
    res.render("urls_new", templateVars);
  } else {
    templateVars.loginRedirect = true;
    res.render('login', templateVars);
  }

 
});

// User registration
app.get("/register", (req, res) => {
  let templateVars = {
    user_id: req.session["user_id"],
    user: null,
    urls: urlDatabase,
    status: undefined,
    registration: false,
    userExists: undefined,
    userObject: userDB
    //userEmail: userDB[user_id].email
  };

  if (req.session.user_id) {
    templateVars.user = userDB[req.session.user_id];
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
      //password: cryptStore.hashPass(req.body.password)
      password: bcrypt.hashSync(req.body.password, 10)
        
    };

    userDB[newUser.id] = newUser;
    console.log(userDB);
    req.session.user_id = id;
    templateVars.registration = true;
    templateVars.status = 200;
    res.redirect("/urls/");
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
  let id = req.params.shortURL;
  urlDatabase[id].longURL = req.body[id];
  console.log("Update written:");
  console.log(urlDatabase);
  
  res.redirect("/urls/");
});

// Redirect route from shortened URL to website
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL; 
  console.log("Redirection occured.");
  res.redirect(longURL);
});

// Shortened URL display page
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    user: null,
    shortURL: req.params.shortURL, 
    longURL: null, 
    urlOwnerRedirect: null,
    urls: null
  };
  
  if (!urlDatabase.hasOwnProperty(req.params.shortURL)) {
    console.log("wrong address")
    res.send("URL does not exist!!");
    
  } else if (req.session.user_id && req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    console.log('param_id: ', req.params.shortURL);
    console.log('database_id: ', urlDatabase[req.params.shortURL].userID);
    templateVars.user = userDB[req.session.user_id];
    templateVars.longURL = urlDatabase[req.params.shortURL].longURL;
    res.render("urls_show", templateVars);

  } else if (req.session.user_id && req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    templateVars.urlOwnerRedirect = true;
    templateVars.user = userDB[req.session.user_id];
    templateVars.urls = urlsForUser(req.session.user_id);
    res.render("urls_index", templateVars);
  } else {
    console.log("you can't see this address")
    res.send("You can't see this address"); 
  }

});

// Login page route
app.get("/login", (req, res) => {
  let templateVars = { 
    user_id: req.session["user_id"],
    urls: urlDatabase,  
    userObject: userDB,
    user: null,
    loginRedirect: false
  };
   
  if (req.session.user_id) {
    templateVars.user = userDB[req.session.user_id];
  }

  res.render("login", templateVars);
});

getUserByEmailPassword = (email, password) => {
  let user = null;
  
  for(let userId in userDB) {
    console.log('currently processing ', userId)
    // if(userDB[userId].email === email && userDB[userId].password === password) {
    if(userDB[userId].email === email && bcrypt.compareSync(password, userDB[userId].password)) {
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
    //res.cookie('user_id', user.id)
    req.session.user_id = user.id;
    res.redirect("/urls/");
  } else {
    res.status(400);
    res.send("invalid username and/or password");
  }
  
});

// LogOUT route
app.post("/logout", (req, res) => {
  console.log("Logout user");
  //res.clearCookie('user_id');
  req.session = null;

  res.redirect("/login/");
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
