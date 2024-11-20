const pool = require('./db'); // Stelle sicher, dass die Verbindung korrekt importiert wird

// Funktion zum Erstellen eines neuen Lernsets
async function createSet(req, res) {
    const { title, description, cards } = req.body;

    if (!title || !cards || cards.length === 0) {
        return res.status(400).json({ message: 'Titel und Karten sind erforderlich.' });
    }

    let connection;
    try {
        // Beginne eine Transaktion, um sicherzustellen, dass alle Operationen zusammen durchgeführt werden
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Erstelle das Lernset
        const [setResult] = await connection.query(
            'INSERT INTO Lernset (titel, beschreibung, erstellerID) VALUES (?, ?, ?)',
            [title, description || null, req.session.userID]  // Annahme: Der Benutzer ist in der Session gespeichert
        );

        const setID = setResult.insertId;

        // 2. Erstelle die Karten
        for (const card of cards) {
            const { vorderseite, rueckseite } = card;
            await connection.query(
                'INSERT INTO Karte (vorderseite, rueckseite, setID) VALUES (?, ?, ?)',
                [vorderseite, rueckseite, setID]
            );
        }

        // 3. Commit der Transaktion
        await connection.commit();

        // Rückgabe der erfolgreichen Antwort
        res.status(201).json({ message: 'Lernset erfolgreich erstellt!', setID });

    } catch (error) {
        console.error('Fehler beim Erstellen des Lernsets:', error);
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        res.status(500).json({ message: 'Fehler beim Erstellen des Lernsets.' });
    }
}

module.exports = { createSet };