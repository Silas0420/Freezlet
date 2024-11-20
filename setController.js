// setsController.js
const db = require('./db');  // Importiere die Datenbankverbindung

// Funktion, um ein neues Lernset zu erstellen
const createSet = async (req, res) => {
  const { title, description, cards } = req.body;
  const username = req.session.username;  // Den Benutzernamen aus der Session holen

  if (!username) {
    return res.status(401).send({ message: 'Benutzer nicht authentifiziert' });
  }

  try {
    // Erstelle das Lernset und speichere den Benutzernamen als 'ersteller'
    const [result] = await db.query(
      'INSERT INTO Lernset (titel, beschreibung, ersteller) VALUES (?, ?, ?)',
      [title, description, username]
    );
    const lernsetID = result.insertId;

    // Füge Karten hinzu
    const cardValues = cards.map(card => [card.vorderseite, card.rueckseite, lernsetID]);
    await db.query(
      'INSERT INTO Karte (vorderseite, rueckseite, setID) VALUES ?',
      [cardValues]
    );

    res.status(201).send({ message: 'Lernset und Karten erfolgreich erstellt' });
  } catch (error) {
    console.error('Fehler beim Erstellen des Lernsets:', error);
    res.status(500).send({ message: 'Fehler beim Erstellen des Lernsets' });
  }
};
  
module.exports = { createSet };  