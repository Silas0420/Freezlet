// Importiere das mysql2-Paket
const mysql = require('mysql2');

// Erstelle einen Verbindungs-Pool zur MariaDB
const pool = mysql.createPool({
    host: '127.0.0.1',    // Hostname der MariaDB
    user: 'webuser',       // Dein MariaDB-Benutzername
    password: 'webuserfreezlet', // Dein MariaDB-Passwort
    database: 'freezlet',  // Der Name der Datenbank, mit der du dich verbinden möchtest
    waitForConnections: true, // Warten auf eine freie Verbindung, wenn der Pool ausgelastet ist
    connectionLimit: 10,     // Maximale Anzahl gleichzeitiger Verbindungen im Pool
    queueLimit: 0            // Keine Warteschlangenbegrenzung
});

// Teste die Verbindung und führe die Abfrage aus
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Fehler beim Abrufen der Verbindung:', err.stack);
        return;
    }
    
    console.log('Erfolgreich mit der Datenbank verbunden als ID ' + connection.threadId);

    // Führe die Abfrage aus
    connection.query('SELECT * FROM UnbestaetigterBenutzer', (err, results) => {
        if (err) {
            console.error('Fehler bei der Abfrage:', err.stack);
            return;
        }
        console.log('Abfrageergebnisse:', results);

        // Gebe die Verbindung nach der Abfrage zurück
        connection.release();
    });
});
