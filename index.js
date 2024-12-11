const express = require('express');
const path = require('path');
const session = require('express-session');

const { register, verifyEmail, login ,updateusername, updatepassword, deleteAccount, getuserdata, emailpr, passwordreset, updateemail, emailupdate} = require('./userController');
const { createSet, importCards,getLernset , getSet ,teilen ,lernsetuebernahme} = require('./setController');
const { createFolder, getFolders, getFolder, assignSetToFolder} = require('./folderController');
const { getCards, updateLernstand, resetLernstand } = require('./cardController');

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
app.get('/getLernset', getLernset);
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