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
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public'));
});


// Benutzer-Registrierung und Anmeldung
app.post('/register', register);
app.post('/login', login);
app.get('/verifizierung', verifyEmail);

app.post('/lernseterstellung', createSet);
const { importCards } = require('./setController');

app.post('/import', importCards);

const { getCards } = require('./cardController');
// In index.js
app.get('/lernen', getCards);

const { updateLernstand } = require('./cardController');
app.post('/updateLernstand', updateLernstand);

const {resetLernstand} = require('./cardController');
app.post('/resetLernstand', resetLernstand)

const { getLernsetName } = require('./setController');

app.get('/lernsetName', getLernsetName);

const {createFolder} = require('./folderController');
app.post('/ordnererstellung', createFolder)

const {getFolder} = require('./folderController');
app.get('/getFolder', getFolder)

const {getSet} = require('./setController');
app.get('/getSet', getSet)


const {updateusername} = require('./userController');
app.post('/updateusername', updateusername)


const {updatepassword} = require('./userController');
app.post('/updatepassword', updatepassword)

const {deleteAccount} = require('./userController');
app.post('/deleteaccount', deleteAccount)

const {getuserdata} = require('./userController');
app.get('/getuserdata', getuserdata)

const PORT = 3000;
module.exports.handler = async (event, context) => {
  return app(event, context);
};