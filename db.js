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