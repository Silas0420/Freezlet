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
      res.status(400).json({ message: "Benutzername bereits vergeben." });
      return;
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // Benutzer in der Datenbank speichern
    await db.query('INSERT INTO benutzer (benutzername, passwort_hash, email) VALUES (?, ?, ?)', [username, hashedPassword, email]);
    res.status(201).json({ message: "Benutzer erfolgreich registriert" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler bei der Registrierung" });
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
    const isMatch = await bcrypt.compare(password, user.passwort_hash);

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

module.exports = { register, login };
