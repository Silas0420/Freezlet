require('dotenv').config();  // Lädt die Umgebungsvariablen aus der .env Datei
const mysql = require('mysql2');

// Erstelle eine Verbindung zur MariaDB-Datenbank
const pool = mysql.createPool({
  host: process.env.DB_HOST,  // Externe IP-Adresse
  user: process.env.DB_USER,  // Dein MariaDB-Benutzername
  password: process.env.DB_PASSWORD,  // Dein MariaDB-Passwort
  database: process.env.DB_NAME,  // Der Name der Datenbank
  port: process.env.DB_PORT, 
});

// Exportiere die Verbindungspool-Instanz mit `.promise()` für die Nutzung von Promises
module.exports = pool.promise();  // pool.promise gibt eine Version mit Promises zurück