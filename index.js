const https = require('https');
const fs = require('fs');
const express = require('express');
const path = require('path');
const session = require('express-session');
const simpleGit = require('simple-git');
const { exec } = require('child_process');
const git = simpleGit();

const {
  register, verifyEmail, login, updateusername, updatepassword, deleteAccount,
  getuserdata, emailpr, passwordreset, updateemail, emailupdate
} = require('./userController');
const {
  createSet, importCards, getLernset, getSet, teilen, lernsetuebernahme
} = require('./setController');
const {
  createFolder, getFolders, getFolder, assignSetToFolder
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

// Webhook-Endpoint hinzufügen
app.post('/webhook', async (req, res) => {
  if (!verifySignature(req)) {
    return res.status(400).send('Invalid signature');
  }

  if (req.headers['x-github-event'] === 'push') {
    try {
      console.log('Webhook empfangen: Pull ausführen...');

      // Definiere das Arbeitsverzeichnis
      const repoPath = '/home/silas/Freezlet';  // Dein Projektverzeichnis

      // Git Pull ausführen
      await git.cwd(repoPath);
      await git.pull('origin', 'main');  // Ersetze "main" durch den richtigen Branch, wenn nötig

      // Optional: Installiere die Abhängigkeiten, wenn Änderungen an der package.json gemacht wurden
      await git.raw(['npm', 'install']);

      // Server neu starten (mit pm2)
      exec('pm2 restart freezlet', (error, stdout, stderr) => {
        if (error) {
          console.error(`Fehler beim Neustarten des Servers: ${error}`);
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
        }
        console.log(`stdout: ${stdout}`);
      });

      // Antwort zurück an GitHub
      res.status(200).send('WebHook empfangen und verarbeitet.');
    } catch (error) {
      console.error('Fehler beim Pull der Änderungen:', error);
      res.status(500).send('Fehler beim Verarbeiten des Webhooks');
    }
  } else {
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
https.createServer(options, app).listen(443, () => {
  console.log('HTTPS-Server läuft auf Port 443');
});

// Weiterleitung von HTTP auf HTTPS
http.createServer((req, res) => {
  res.writeHead(301, { "Location": `https://${req.headers.host}${req.url}` });
  res.end();
}).listen(80, () => {
  console.log('HTTP zu HTTPS Weiterleitung aktiv');
});