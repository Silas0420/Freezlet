const bcrypt = require('bcryptjs');

bcrypt.hash('asdf', 10, (err, hash) => {
    if (err) {
        console.error(err);
    } else {
        console.log(hash);
    }
});