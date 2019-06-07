app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.redirect(400, "/register/");
    // res.locals
    // redirect
    // req.locals
  }

  if (!checkUserDB('email', req.body.email)) { // findUserByEmail/userExists
    return res.status(400).send("Email already taken");
  }
  
  let newUser = {
    id: generateRandomString(),
    email: req.body.email,
    //password: cryptStore.hashPass(req.body.password)
    password: bcrypt.hashSync(req.body.password, 10)
  };

  let templateVars = {
    status: null,
    registration: true,
  };

  userDB[newUser.id] = newUser;
  console.log(userDB);
  req.session.user_id = newUser.id;
  res.redirect("/urls/");
});