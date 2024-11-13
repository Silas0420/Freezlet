const express = require('express');
const app = express();
app.use(express.json()); // Middleware für JSON-Parsing

const { register, login } = require('./userController');

app.use(express.static(path.join(__dirname, 'public')));

app.post('/register', register);

// Anmeldung
app.post('/login', login);

const { register, login } = require('./userController');