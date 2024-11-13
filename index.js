const express = require('express');
const app = express();
const path = require('path');
app.use(express.json()); // Middleware für JSON-Parsing

const { register, login } = require('./userController');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/register', register);

// Anmeldung
app.post('/login', login);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});