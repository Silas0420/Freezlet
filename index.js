const http = require('http');
const https = require('https');
const fs = require('fs');
const express = require('express');
const path = require('path');
const session = require('express-session');
const simpleGit = require('simple-git');
const git = simpleGit();
const crypto = require('crypto');
const { exec } = require('child_process');

const {
  register, verifyEmail, login, updateusername, updatepassword, deleteAccount,
  getuserdata, emailpr, passwordreset, updateemail, emailupdate
} = require('./userController');
const {
  createSet, importCards, getLernset, getSet, teilen, lernsetuebernahme, getSets, setinfolders, editset, deleteset, ersteller
} = require('./setController');
const {
  createFolder, getFolders, getFolder, assignSetToFolder, renamefolder, deletefolder
} = require('./folderController');
const {
  getCards, updateLernstand, resetLernstand
} = require('./cardController');

const app = express();

// Middleware und Session-Handling
app.use(session({
  secret: process.env.SESSION_SECRET || 'Freezlettelzeerf01928373645',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
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
app.get('/getSets', getSets);
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
app.get('/addToFolder', assignSetToFolder);
app.post('/renamefolder', renamefolder);
app.post('/deletefolder', deletefolder);
app.get('/setinfolders',setinfolders);
app.post('/editset', editset);
app.set('/deleteset',deleteset);
app.set('ersteller', ersteller);

// Webhook-Endpoint hinzufügen
app.post('/webhook', async (req, res) => {
  console.log('Webhook empfangen:', req.headers);

// Beispiel einer Funktion zur Überprüfung der GitHub Webhook-Signatur
  function verifySignature(req) {
  const signature = req.headers['x-hub-signature-256']; // GitHub Webhook Signature Header
  const payload = JSON.stringify(req.body);
  const secret = process.env.GITHUB_SECRET; // Dein GitHub Secret, das du beim Webhook erstellt hast

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const digest = `sha256=${hmac.digest('hex')}`;

  return signature === digest;
}

  if (!verifySignature(req)) {
    console.log('Invalid signature');
    return res.status(400).send('Invalid signature');
  }

  if (req.headers['x-github-event'] === 'push') {
    try {
      console.log('Verarbeite GitHub Push-Event...');
      const repoPath = '/home/silas/Freezlet';  // Dein Projektverzeichnis

      await git.cwd(repoPath);
      await git.pull('origin', 'main');  // Achte auf den richtigen Branch

      // Wenn nötig, installiere die Abhängigkeiten
      exec('npm install', { cwd: repoPath }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Fehler beim Ausführen von npm install: ${error.message}`);
          return res.status(500).send('Fehler beim Verarbeiten des Webhooks');
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return res.status(500).send('Fehler beim Verarbeiten des Webhooks');
        }
        console.log(`stdout: ${stdout}`);
      });
      exec('pm2 restart Freezlet', (error, stdout, stderr) => {
        if (error) {
          console.error(`Fehler beim Neustarten der Anwendung: ${error.message}`);
          return res.status(500).send('Fehler beim Neustarten der Anwendung');
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return res.status(500).send('Fehler beim Neustarten der Anwendung');
        }
        console.log(`stdout: ${stdout}`);
      });
      res.status(200).send('WebHook empfangen und verarbeitet.');
    } catch (error) {
      console.error('Fehler beim Pull der Änderungen:', error);
      res.status(500).send('Fehler beim Verarbeiten des Webhooks');
    }
  } else {
    console.log('Unzulässiges GitHub-Event:', req.headers['x-github-event']);
    res.status(400).send('Unzulässiges Webhook-Ereignis');
  }
});

// SSL/TLS-Zertifikate laden
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/freezlet.ch/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/freezlet.ch/cert.pem'),
  ca: fs.readFileSync('/etc/letsencrypt/live/freezlet.ch/chain.pem')
};

// HTTPS-Server starten
https.createServer(options, app).listen(8080, () => {
  console.log('HTTPS-Server läuft auf Port 8080');
});
