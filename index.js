const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const { register, login, verifyEmail } = require('./userController');
const { createSet } = require('./setController'); 

app.use(session({
  secret: process.env.SESSION_SECRET || 'Freezlettelzeerf01928373645', // Korrekte Schreibweise: 'secret' statt 'ssecret'
  resave: false,                // Setze auf false, um die Session nicht bei jeder Anfrage zu speichern
  saveUninitialized: true,      // Setze auf true, um uninitialisierte Sessions zu speichern
  cookie: { secure: false }     // Setze auf true, wenn du HTTPS verwendest
}));

app.use(express.json()); // Middleware für JSON-Parsing
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Benutzer-Registrierung und Anmeldung
app.post('/register', register);
app.post('/login', login);
app.get('/verifizierung', verifyEmail);

app.post('/lernseterstellung', createSet);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});