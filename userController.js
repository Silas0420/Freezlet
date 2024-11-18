// userController.js
const bcrypt = require('bcrypt');
const db = require('./db');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // true für SSL/TLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    logger: true, // Aktiviert das Logging
    debug: true,  // Details zu den SMTP-Kommunikationen
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
        console.error('Fehler beim Senden der E-Mail:', error);
    }
};


// Benutzer registrieren
const register = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    // Prüfen, ob der Benutzername bereits existiert
    const [users] = await db.query(
      'SELECT * FROM benutzer WHERE benutzername = ? OR email = ?',
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
      'INSERT INTO unbestaetigtbenutzer (email, benutzername, passwort, token) VALUES (?, ?, ?, ?)',
      [email, username, hashedPassword, token]
    );

    // E-Mail mit Bestätigungslink senden
    const confirmationLink = `https://freezlet.ch/verify-email?token=${token}`;
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
    return res.status(400).json({ message: 'Kein Token angegeben.' });
  }

  try {
    // Suchen nach dem Token in der Datenbank
    const [rows] = await db.query('SELECT * FROM unbestaetigtbenutzer WHERE token = ?', [token]);

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Ungültiger oder abgelaufener Token.' });
    }

    const user = rows[0];

    // Benutzer in die 'benutzer'-Tabelle übertragen
    await db.query('INSERT INTO benutzer (benutzername, passwort, email) VALUES (?, ?, ?)', 
      [user.benutzername, user.passwort, user.email]);
    

    // Benutzer aus der unbestaetigtbenutzer-Tabelle löschen
    await db.query('DELETE FROM unbestaetigtbenutzer WHERE token = ?', [token]);
      await db.query('DELETE FROM unbestaetigtbenutzer WHERE erstellungszeit < NOW() - INTERVAL 1 DAY');
    // Erfolg: Bestätigungsnachricht
    res.json({ success: true, message: 'E-Mail erfolgreich bestätigt.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Fehler bei der E-Mail-Verifizierung.' });
  }
};



// Benutzer anmelden
const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Prüfen, ob die Eingabe eine E-Mail-Adresse ist
    const isEmail = username.includes("@");

    // Abfrage vorbereiten basierend auf dem Eingabetyp
    const query = isEmail ? 
      'SELECT * FROM benutzer WHERE email = ?' : 
      'SELECT * FROM benutzer WHERE benutzername = ?';

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

const sendTestEmail = async (req, res) => {
  const mailOptions = {
      from: `"Freezlet" <${process.env.EMAIL_USER}>`, // Absender
      to: 'silaskolly@gmail.com',  // Empfänger-Adresse (ersetze mit deiner eigenen)
      subject: 'Test E-Mail aus dem userController',
      text: 'Dies ist eine Test-E-Mail aus dem userController, um sicherzustellen, dass alles funktioniert!',
  };

  try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Test-E-Mail erfolgreich gesendet!' });
  } catch (error) {
      console.error('Fehler beim Senden der E-Mail:', error);
      res.status(500).json({ message: 'Fehler beim Senden der E-Mail' });
  }
};
module.exports = { sendTestEmail, register, login };
