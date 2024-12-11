const express = require('express');
const path = require('path');
const session = require('express-session');

const { register, login, verifyEmail } = require('./userController');
const { emailupdate } = require('./userController');
const { createSet } = require('./setController');
const { importCards } = require('./setController');
const { getCards } = require('./cardController');
const { updateLernstand } = require('./cardController');
const { resetLernstand } = require('./cardController');
const { getLernsetName } = require('./setController');
const { createFolder } = require('./folderController');
const { getFolders, getFolder, assignSetToFolder } = require('./folderController');
const { getSet } = require('./setController');
const { updateusername } = require('./userController');
const { updatepassword } = require('./userController');
const { updateemail } = require('./userController');
const { deleteAccount } = require('./userController');
const { getuserdata } = require('./userController');
const { teilen } = require('./setController');
const { lernsetuebernahme } = require('./setController');
const { emailpr } = require('./userController');
const { passwordreset } = require('./userController');

const app = express();

// Middleware und Session-Handling
app.use(session({
  secret: process.env.SESSION_SECRET || 'Freezlettelzeerf01928373645',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(express.json());
// Beispiel: Stelle sicher, dass der öffentliche Ordner für statische Dateien verwendet wird
app.use(express.static(path.join(__dirname, 'public'))); // Setze den Pfad zu deinem 'public' Ordner
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html')); // Stelle sicher, dass der Pfad stimmt
});


// Deine Routen
app.post('/register', register);
app.post('/login', login);
app.get('/verifizierung', verifyEmail);
app.get('/emailupdate', emailupdate);
app.post('/lernseterstellung', createSet);
app.post('/import', importCards);
app.get('/lernen', getCards);
app.post('/updateLernstand', updateLernstand);
app.post('/resetLernstand', resetLernstand);
app.get('/getFolder', getFolder);
app.get('/lernsetName', getLernsetName);
app.post('/ordnererstellung', createFolder);
app.get('/getFolders', getFolders);
app.get('/getSet', getSet);
app.post('/updateusername', updateusername);
app.post('/updatepassword', updatepassword);
app.post('/updateemail', updateemail);
app.post('/deleteaccount', deleteAccount);
app.get('/getuserdata', getuserdata);
app.get('/teilen', teilen);
app.post('/lernsetuebernahme', lernsetuebernahme);
app.post('/emailpr', emailpr);
app.post('/passwordreset', passwordreset);
app.get('/addToFolder', assignSetToFolder)

// Den Server starten
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});