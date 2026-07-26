const bcrypt = require('bcrypt');


const password = "1234";


bcrypt.hash(password, 10)
    .then(hash => {

        console.log("Password:");
        console.log(password);

        console.log("\nHash:");
        console.log(hash);

    });