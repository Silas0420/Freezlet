const pool = require('./db'); // Verbindung zur Datenbank

const getCards = async (req, res) => {
    const lernsetId = req.query.id; // Lernset-ID aus der URL

    if (!lernsetId) {
        return res.status(400).json({ message: 'Lernset-ID fehlt.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        // Hole Karten des Lernsets zusammen mit dem Lernfortschritt
        const [cards] = await connection.query(
            `SELECT k.ID AS kartenID, k.vorderseite, k.rueckseite, ls.lernstand AS lernstand
             FROM Karte k
             LEFT JOIN Lernstand ls ON ls.kartenID = k.ID AND ls.benutzerID = ? 
             WHERE k.lernsetID = ? AND ls.lernstand < 2`,
            [req.session.userID, lernsetId]  // Benutzer-ID aus der Session
        );

        res.json(cards);  // Rückgabe der Karten und deren Lernfortschritt

    } catch (error) {
        console.error('Fehler beim Abrufen der Karten:', error);
        res.status(500).json({ message: 'Fehler beim Abrufen der Karten.' });
    } finally {
        if (connection) connection.release();
    }
}

const updateLernstand = async (req, res) => {

    const { kartenID, korrekt } = req.body; // Karte-ID und Ergebnis (true/false)
  

    const userID = req.session.userID; // Benutzer-ID aus der Session

    if (!kartenID || userID === undefined) {
        return res.status(400).json({ message: 'Karten-ID oder Benutzer-ID fehlt.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        // Berechne den neuen Lernstand: +1 bei korrekt, -1 bei falsch
        const delta = korrekt ? 1 : -1;
        
            // Update des Lernstands
            await connection.query(
                `UPDATE Lernstand SET lernstand = GREATEST(-3, lernstand + ?) WHERE kartenID = ? AND benutzerID = ?`,
                [delta, kartenID, userID]
            );
            


        res.json({ message: 'Lernstand aktualisiert.' });
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Lernstands:', error);
        res.status(500).json({ message: 'Fehler beim Aktualisieren des Lernstands.' });
    } finally {
        if (connection) connection.release();
    }
};

// Neue Route zum Zurücksetzen des Lernstands
const resetLernstand = async (req, res) => {
    const lernsetId = req.query.id; // Lernset-ID aus der URL
    const userID = req.session.userID; // Benutzer-ID aus der Session

    if (!lernsetId || !userID) {
        return res.status(400).json({ message: 'Lernset-ID oder Benutzer-ID fehlt.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        // Setze den Lernstand für alle Karten des Lernsets auf 0
        await connection.query(
            `UPDATE Lernstand SET lernstand = 0 WHERE benutzerID = ? AND kartenID IN (SELECT ID FROM Karte WHERE lernsetID = ?)`,
            [userID, lernsetId]
        );

        res.json({ message: 'Lernstand zurückgesetzt.' });
    } catch (error) {
        console.error('Fehler beim Zurücksetzen des Lernstands:', error);
        res.status(500).json({ message: 'Fehler beim Zurücksetzen des Lernstands.' });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = { getCards, updateLernstand, resetLernstand };