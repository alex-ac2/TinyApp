const bcrypt = require('bcrypt');

module.exports = {
  users: { 
    "userRandomID": {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    },
   "user2RandomID": {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: "dishwasher-funk"
    },
    "123456": {
      id: "123456",
      email: "test@gmail.com",
      password: bcrypt.hashSync("telephone", 10)
    },
    "654321": {
      id: "654321",
      email: "jake@gmail.com",
      password: bcrypt.hashSync("dog", 10)
    }
  }
  
};
