<<<<<<< HEAD
require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./persistence');
const getGreeting = require('./routes/getGreeting');
const getItems = require('./routes/getItems');
const addItem = require('./routes/addItem');
const updateItem = require('./routes/updateItem');
const deleteItem = require('./routes/deleteItem');

app.use(express.json());
app.use(express.static(__dirname + '/static'));

app.get('/api/greeting', getGreeting);
app.get('/api/items', getItems);
app.post('/api/items', addItem);
app.put('/api/items/:id', updateItem);
app.delete('/api/items/:id', deleteItem);
=======
const express = require('express');
const app = express();
const db = require('./persistence');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/error.middleware');

app.use(express.json());
// app.use(express.static(__dirname + '/static'));

app.use('/api', apiRoutes);

app.use(errorHandler);
>>>>>>> 7deb6dfb8f0394ebca6364c56875c186edca9bb2

db.init()
    .then(() => {
        app.listen(3000, () => console.log('Listening on port 3000'));
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });

const gracefulShutdown = () => {
    db.teardown()
        .catch(() => {})
        .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
<<<<<<< HEAD
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon
=======
process.on('SIGUSR2', gracefulShutdown);
>>>>>>> 7deb6dfb8f0394ebca6364c56875c186edca9bb2
