const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' }); // Config environment variables of process in config.env

// Connect database
let DB = 'mongodb://localhost:27017/teachat';
// if (process.env.NODE_ENV === 'production') {
//     DB = process.env.DATABASE.replace(
//         '<password>',
//         process.env.DATABASE_PASSWORD
//     );
// } else if (process.env.NODE_ENV === 'development') {
//     DB = 'mongodb://localhost:27017/teachat';
// }
mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('Database connected successfully');
    })
    .catch(err => {
        console.log('Fail in connecting to database! Error:');
        console.log(err);
    });

// Run app
require('./app');
