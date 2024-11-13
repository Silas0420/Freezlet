// userController.js
const bcrypt = require('bcrypt');
const db = require('./db');

// Benutzer registrieren
const register = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    // Prüfen, ob der Benutzername bereits existiert
    const [rows] = await db.query('SELECT * FROM benutzer WHERE benutzername = ?', [username]);
    if (rows.length > 0) {
      return res.status(400).send("Benutzername bereits vergeben.");
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // Benutzer in der Datenbank speichern
    await db.query('INSERT INTO benutzer (benutzername, passwort_hash, email) VALUES (?, ?, ?)', [username, hashedPassword, email]);
    res.status(201).send("Benutzer erfolgreich registriert");
  } catch (error) {
    console.error(error);
    res.status(500).send("Fehler bei der Registrierung");
  }
};

// Benutzer anmelden
const login = async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Benutzerdaten aus der Datenbank abfragen
      const [rows] = await db.query('SELECT * FROM benutzer WHERE benutzername = ?', [username]);
  
      if (rows.length === 0) {
        return res.status(400).send("Benutzername oder Passwort ungültig.");
      }
  
      // Passwort vergleichen
      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.passwort_hash);
  
      if (isMatch) {
        res.send("Anmeldung erfolgreich");
      } else {
        res.status(400).send("Benutzername oder Passwort ungültig.");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Fehler bei der Anmeldung");
    }
  };
  
module.exports = { register, login };