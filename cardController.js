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
            `SELECT k.ID AS kartenID, k.vorderseite, k.rueckseite, IFNULL(ls.lernstand, 0) AS lernstand
             FROM Karte k
             LEFT JOIN Lernstand ls ON ls.kartenID = k.ID AND ls.benutzerID = ? 
             WHERE k.setID = ?`,
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

module.exports = {getCards};