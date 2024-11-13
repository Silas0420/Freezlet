// db.js
const mysql = require('mysql2');

// Erstelle eine Verbindung zur MariaDB-Datenbank
const pool = mysql.createPool({
  host: 'localhost',  // MariaDB-Host, 'localhost' für lokale Verbindung
  user: 'root',       // Dein MariaDB-Benutzername
  password: '12345678',  // Dein MariaDB-Passwort
  database: 'freezlet',  // Deine Datenbankname
});

// Exportiere die Verbindungspool-Instanz mit `.promise()` für die Nutzung von Promises
module.exports = pool.promise();  // pool.promise gibt eine Version mit Promises zurück

// Funktion, um ein neues Lernset zu erstellen
async function createSet(title, description, language) {
  const [rows] = await pool.query(
    'INSERT INTO lernset (title, description, language) VALUES (?, ?, ?)',
    [title, description, language]
  );
  return rows.insertId;
}

// Funktion, um Lernkarten zu einem Lernset hinzuzufügen
async function addCards(setId, cards) {
  const cardPromises = cards.map(card =>
    pool.query(
      'INSERT INTO karte (set_id, vorderseite, rueckseite) VALUES (?, ?, ?)',
      [setId, card.vorderseite, card.rueckseite]
    )
  );
  await Promise.all(cardPromises);  // Alle Abfragen parallel ausführen
}

module.exports = { createSet, addCards };
