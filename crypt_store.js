const bcrypt = require('bcrypt');
const password = "purple-monkey-dinosaur"; // found in the req.params object
const hashedPassword = bcrypt.hashSync(password, 10);

//console.log(bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword)); // returns true
//console.log(bcrypt.compareSync("pink-donkey-minotaur", hashedPassword)); // returns false


function hashPass(password, cb) {
    bcrypt.hash(password, 10, function(err, hash) {
        if (err)  {
            console.log(err);
        } else if (hash) {
            // console.log(hash);
            
            let newHashPassword = cb(hash);
            return newHashPassword;
            
        } else {
            console.log('this is broken');
        }
      });
}   



console.log(hashPass('testPassword', (hashData) => { return hashData; } ));


// const returnHash = (plain, cb) => {
//     bcrypt.hash(plain, 10, cb)
// }

// let hashThis = returnHash("hi", (err, hash) => {
//     return hash
// })

// let hashThis = retun

// hashThis()




module.exports = {
    hashPass: (password) => {
        bcrypt.hash(password, 10, function(err, hash) {
            if (err)  {
                console.log(err);
            } else if (hash) {
                console.log(hash);
                return hash;
            } else {
                console.log('this is broken');
            }
          });
    }   


};
