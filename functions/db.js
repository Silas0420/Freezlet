// db.js
const mysql = require('mysql2');

// Erstelle eine Verbindung zur MariaDB-Datenbank
const pool = mysql.createPool({
  host: process.env.DB_HOST || '94.231.94.146',  // Externe IP-Adresse
  user: process.env.DB_USER || 'user',  // Dein MariaDB-Benutzername
  password: process.env.DB_PASSWORD || 'userpassword123*',  // Dein MariaDB-Passwort
  database: process.env.DB_NAME || 'freezlet',  // Der Name der Datenbank
  port: process.env.DB_PORT || 3306, 
});

// Exportiere die Verbindungspool-Instanz mit `.promise()` für die Nutzung von Promises
module.exports = pool.promise();  // pool.promise gibt eine Version mit Promises zurück