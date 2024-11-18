const express = require('express');
const app = express();
const path = require('path');
const { register, login, verifyEmail } = require('./userController');




app.use(express.json()); // Middleware für JSON-Parsing
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/emailbestätigung.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'emailbestätigung.html'));
});

// Benutzer-Registrierung und Anmeldung
app.post('/register', register);
app.post('/login', login);
app.get('/verify-email', verifyEmail);


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
