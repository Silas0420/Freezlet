const bcrypt = require('bcrypt');
const db = require('./db');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true für SSL/TLS
    auth: {
      user: process.env.EMAIL_USER, // Benutzername
      pass: process.env.EMAIL_PASS  // Passwort
  },
    tls: {
      rejectUnauthorized: false
    } 
});

// E-Mail senden Funktion
const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: `"Freezlet" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        text: text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('E-Mail erfolgreich gesendet.');
    } catch (error) {
        console.error('Fehler beim Senden der E-Mail:', error, error.stack);
    }
};


// Benutzer registrieren
const register = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    // Prüfen, ob der Benutzername bereits existiert
    const [users] = await db.query(
      'SELECT * FROM Benutzer WHERE benutzername = ? OR email = ?',
      [username, email]
    );
    
    if (users.length > 0) {
      const user = users[0];
      if (user.benutzername === username) {
        return res.status(400).json({ message: "Benutzername bereits vergeben." });
     } else if (user.email === email) {
        return res.status(400).json({ message: "E-Mail bereits vergeben." });
     }     
    }
    

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // Bestätigungstoken generieren
    const token = crypto.randomBytes(32).toString('hex');

    await db.query(
      'INSERT INTO UnbestaetigterBenutzer (email, benutzername, passwort, token) VALUES (?, ?, ?, ?)',
      [email, username, hashedPassword, token]
    );

    // E-Mail mit Bestätigungslink senden
    const confirmationLink = `https://freezlet.ch/verifizierung?token=${token}`;
    await sendEmail(
        email,
        'E-Mail-Bestätigung',
        `Bitte bestätigen Sie Ihre E-Mail, indem Sie auf diesen Link klicken: ${confirmationLink}`
    );
    

    res.status(200).json({ message: 'Benutzer registriert, bitte bestätigen Sie Ihre E-Mail.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler bei der Registrierung" });
  }
};

// E-Mail-Verifizierung
const verifyEmail = async (req, res) => {
  const { token } = req.query; // Das Token wird aus der URL entnommen

  if (!token) {
    return res.redirect(`/verifizierung.html?success=false&message=${encodeURIComponent("Token für die Verifizierung fehlt")}`);
  } // Fehlermeldung im JSON-Format
  

  try {
    // Suchen nach dem Token in der Datenbank
    const [rows] = await db.query('SELECT * FROM UnbestaetigterBenutzer WHERE token = ?', [token]);
    console.log('rows:', rows)
    const user = rows[0];
    console.log('user:', user)
    // Benutzer in die 'benutzer'-Tabelle übertragen
    await db.query('INSERT INTO Benutzer (benutzername, passwort, email) VALUES (?, ?, ?)', 
      [user.benutzername, user.passwort, user.email]);

    // Benutzer aus der unbestaetigtbenutzer-Tabelle löschen
    await db.query('DELETE FROM UnbestaetigterBenutzer WHERE token = ?', [token]);

    // Optional: Token, das älter als 1 Tag ist, entfernen
    await db.query('DELETE FROM UnbestaetigterBenutzer WHERE erstellungszeit < NOW() - INTERVAL 1 DAY');

    // Erfolgreiche Bestätigung
    req.session.username = user.benutzername;
    res.redirect(`/verifizierung.html?success=true&message=${encodeURIComponent("E-Mail erfolgreich bestätigt")}`);
  } catch (error) {
    console.error(error);
    res.redirect(`/verifizierung.html?success=true&message=${encodeURIComponent("")}`); // Fehlerantwort im JSON-Format
  }
};


// Benutzer anmelden
const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Prüfen, ob die Eingabe eine E-Mail-Adresse ist
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);

    // Abfrage vorbereiten basierend auf dem Eingabetyp
    const query = isEmail ? 
      'SELECT * FROM Benutzer WHERE email = ?' : 
      'SELECT * FROM Benutzer WHERE benutzername = ?';

    // Benutzerdaten aus der Datenbank abfragen
    const [rows] = await db.query(query, [username]);

    if (rows.length === 0) {
      return res.status(400).json({
        message: isEmail ? "E-Mail oder Passwort ungültig." : "Benutzername oder Passwort ungültig."
      });
    }

    // Passwort vergleichen
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.passwort);

    if (isMatch) {
      // Benutzername und BenutzerID in der Session speichern
      req.session.username = user.benutzername;
      req.session.userID = user.ID; // Speichert die ID des Benutzers in der Session

      res.status(200).json({ message: "Anmeldung erfolgreich" });
    } else {
      return res.status(400).json({
        message: isEmail ? "E-Mail oder Passwort ungültig." : "Benutzername oder Passwort ungültig."
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler bei der Anmeldung" });
  }
};

// Funktion zum Aktualisieren des Benutzernamens
const updateusername = async (req, res) => {
  const { username } = req.body;
  
  if (!username || username.trim().length === 0) {
      return res.status(400).json({ message: 'Benutzername ist erforderlich.' });
  }

  try {
      const userId = req.session.userID;  // Der Benutzer, der in der Session gespeichert ist
      // Stelle sicher, dass der Benutzername nicht bereits existiert (optional)
      const [existingUser] = await db.query('SELECT * FROM Benutzer WHERE benutzername = ?', [username]);
      if (existingUser.length > 0) {
          return res.status(400).json({ message: 'Benutzername bereits vergeben.' });
      }

      // Benutzernamen in der Datenbank aktualisieren
      await db.query('UPDATE Benutzer SET benutzername = ? WHERE id = ?', [username, userId]);

      // Rückmeldung, dass die Änderung erfolgreich war
      res.status(200).json({ message: 'Benutzername wurde erfolgreich geändert' });
  } catch (error) {
      console.error('Fehler beim Aktualisieren des Benutzernamens:', error);
      res.status(500).json({ message: 'Fehler beim Aktualisieren des Benutzernamens.' });
  }
};

// Funktion zum Aktualisieren des Passworts
const updatepassword = async (req, res) => {
  const { password } = req.body;
  
  if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Passwort muss mindestens 6 Zeichen lang sein.' });
  }

  try {
      const userId = req.session.userID;  // Der Benutzer, der in der Session gespeichert ist
      const hashedPassword = await bcrypt.hash(password, 10);  // Passwort verschlüsseln

      // Passwort in der Datenbank aktualisieren
      await db.query('UPDATE Benutzer SET passwort = ? WHERE id = ?', [hashedPassword, userId]);

      // Rückmeldung, dass die Änderung erfolgreich war
      res.status(200).json({ message: 'Passwort wurde erfolgreich geändert' });
  } catch (error) {
      console.error('Fehler beim Aktualisieren des Passworts:', error);
      res.status(500).json({ message: 'Fehler beim Aktualisieren des Passworts.' });
  }
};

// Funktion zum Löschen des Accounts
const deleteAccount = async (req, res) => {
  const userId = req.session.userID;

  try {
      // Lösche alle Daten des Benutzers aus der Datenbank
      await db.query('DELETE FROM Benutzer WHERE id = ?', [userId]);
      
      // Ende der Session nach dem Löschen
      req.session.destroy((err) => {
          if (err) {
              return res.status(500).json({ message: 'Fehler beim Beenden der Sitzung.' });
          }
          res.json({ success: true, message: 'Account wurde erfolgreich gelöscht.' });
      });
  } catch (error) {
      console.error('Fehler beim Löschen des Accounts:', error);
      res.status(500).json({ message: 'Fehler beim Löschen des Accounts.' });
  }
};

// Funktion zum Abrufen von Benutzerdaten (Username und E-Mail)
// Funktion zum Abrufen von Benutzerdaten (Username und E-Mail)
const getuserdata = async (req, res) => {
  const userId = req.session.userID;

  if (!userId) {
      return res.status(401).json({ message: 'Benutzer nicht angemeldet.' });
  }

  try {
      // Hole den Benutzernamen und die E-Mail-Adresse anhand der userID
      const [userData] = await db.query( // Verwendet 'db', nicht 'pool'
          'SELECT benutzername, email FROM Benutzer WHERE id = ?',
          [userId]
      );

      if (userData.length === 0) {
          return res.status(404).json({ message: 'Benutzer nicht gefunden.' });
      }

      // Rückgabe des Benutzernamens und der E-Mail-Adresse
      res.json({
          username: userData[0].benutzername,
          email: userData[0].email
      });
  } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
      res.status(500).json({ message: 'Fehler beim Abrufen der Benutzerdaten.' });
  }
};


const emailpr = async (req, res) => {
  const { email } = req.body;

  try {
    // Prüfen, ob die E-Mail bereits existiert
    const [users] = await db.query(
      'SELECT * FROM Benutzer WHERE email = ?',  // Richtige SQL-Syntax
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "E-Mail gehört keinem Benutzer." });
    }

    const user = users[0];

    // E-Mail mit Bestätigungslink senden
    const confirmationLink = `https://freezlet.ch/passwordreset.html?id=${user.ID}`;
    await sendEmail(
        email,
        'Passwort zurücksetzen',
        `Setze dein Passwort zurück über diesen Link: ${confirmationLink}`
    );

    res.status(200).json({ message: 'Bitte bestätigen Sie Ihre E-Mail.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler" });
  }
};


const passwordreset = async (req, res) => {
  const { id, password } = req.body; // Direkt aus req.body extrahieren

  if (!id) {
    return res.redirect(`/passwordreset.html?success=false&message=${encodeURIComponent("Der Link ist ungültig")}`);
  } // Fehlermeldung im JSON-Format
  
  if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Passwort muss mindestens 6 Zeichen lang sein.' });
  }

  try { 
      const hashedPassword = await bcrypt.hash(password, 10);  // Passwort verschlüsseln

      // Passwort in der Datenbank aktualisieren
      await db.query('UPDATE Benutzer SET passwort = ? WHERE id = ?', [hashedPassword, id]);

      // Rückmeldung, dass die Änderung erfolgreich war
      res.json({ success: true, message: 'Passwort wurde erfolgreich geändert.' });
  } catch (error) {
      console.error('Fehler beim Aktualisieren des Passworts:', error);
      res.status(400).json({ message: 'Fehler beim Zurücksetzen des Passworts.' });
  }
};

const updateemail = async (req, res) => {
  const { email } = req.body;
  try {
    const [user] = await db.query(
      'SELECT * FROM Benutzer WHERE email = ?',
      [email]
    );
    
    if (user.length > 0) {
        return res.status(400).json({ message: "E-mail bereits vergeben." });   
    }
    const userId = req.session.userID;

    const token = crypto.randomBytes(32).toString('hex');

    await db.query(
      'INSERT INTO UnbestaetigteEmail (email, benutzerID, token) VALUES (?, ?, ?)',
      [email, userId, token]
    );
  // E-Mail mit Bestätigungslink senden
    const confirmationLink = `https://freezlet.ch/emailupdate?token=${token}`;

    await sendEmail(
      email,
      'E-Mail-Änderung',
      `Bitte bestätigen Sie Ihre E-Mail, indem Sie auf diesen Link klicken: ${confirmationLink}`
    );
    return res.status(200).json({ message: 'Bestätige deine E-Mail mit dem Link, den du per E-Mail erhalten hast.' });
  }
    catch {
      return res.status(400).json({ message: "Fehler bei der Änderung" });
    }
};

const emailupdate = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.redirect(`/emailupdate.html?success=false&message=${encodeURIComponent("Der Link ist ungültig")}`);
  } // Fehlermeldung im JSON-Format
  

  try {
    const [rows] = await db.query('SELECT * FROM UnbestaetigteEmail WHERE token = ?', [token]);

    const user = rows[0];

    // Benutzer in die 'benutzer'-Tabelle übertragen
    await db.query('UPDATE Benutzer SET email = ? WHERE ID = ?', 
      [user.email, user.benutzerID]);

    // Benutzer aus der unbestaetigtbenutzer-Tabelle löschen
    await db.query('DELETE FROM UnbestaetigteEmail WHERE token = ?', [token]);

    // Optional: Token, das älter als 1 Tag ist, entfernen
    await db.query('DELETE FROM UnbestaetigteEmail WHERE erstellungszeit < NOW() - INTERVAL 1 DAY');
    // Suchen nach dem Token in der Datenbank
    res.redirect(`/emailupdate.html?success=true&message=${encodeURIComponent("E-Mail wurde erfolgreich geändert")}`);
  } catch (error) {
      console.error('Fehler beim Aktualisieren der E-Mail:', error);
      res.redirect(`/emailupdate.html?success=false&message=${encodeURIComponent("Fehler beim Zurücksetzen der E-Mail")}`);
  }
};

module.exports = { register, verifyEmail, login ,updateusername, updatepassword, deleteAccount, getuserdata, emailpr, passwordreset, updateemail, emailupdate};
