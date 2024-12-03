const express = require('express');
const path = require('path');
const session = require('express-session');
const serverless = require('serverless-http'); // Hinzugefügt

// Controller-Importe
const { register, login, verifyEmail } = require('./userController');
const { createSet } = require('./setController'); 
const { importCards } = require('./setController');
const { getCards } = require('./cardController');
const { updateLernstand } = require('./cardController');
const { resetLernstand } = require('./cardController');
const { getLernsetName } = require('./setController');
const { createFolder } = require('./folderController');
const { getFolder } = require('./folderController');
const { getSet } = require('./setController');
const { updateusername } = require('./userController');
const { updatepassword } = require('./userController');
const { deleteAccount } = require('./userController');
const { getuserdata } = require('./userController');

const app = express();

// Middleware und Session-Handling
app.use(session({
  secret: process.env.SESSION_SECRET || 'Freezlettelzeerf01928373645',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routen
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html')); // Korrektur: index.html anstelle von nur "public"
});

app.post('/register', register);
app.post('/login', login);
app.get('/verifizierung', verifyEmail);
app.post('/lernseterstellung', createSet);
app.post('/import', importCards);
app.get('/lernen', getCards);
app.post('/updateLernstand', updateLernstand);
app.post('/resetLernstand', resetLernstand);
app.get('/lernsetName', getLernsetName);
app.post('/ordnererstellung', createFolder);
app.get('/getFolder', getFolder);
app.get('/getSet', getSet);
app.post('/updateusername', updateusername);
app.post('/updatepassword', updatepassword);
app.post('/deleteaccount', deleteAccount);
app.get('/getuserdata', getuserdata);

// Exportiere die Funktion als Netlify Handler
module.exports.handler = serverless(app); // Verwendet serverless-http