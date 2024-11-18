const express = require('express');
const app = express();
const path = require('path');
const { register, login } = require('./userController');


const { sendTestEmail } = require('./userController'); // Importiere die Funktion
app.get('/send-test-email', sendTestEmail);

app.use(express.json()); // Middleware für JSON-Parsing
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Benutzer-Registrierung und Anmeldung
app.post('/register', register);
app.post('/login', login);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
