const pool = require('./db'); // Verbindung zur DB

// Ordner erstellen
const createFolder = async (req, res) => {
    const { name } = req.body;

    if (!name || !req.session.userID) {
        console.error('Fehler: Name oder Benutzer-ID fehlt.', { name, userID: req.session.userID });
        return res.status(400).json({ message: 'Ordnername und Benutzer sind erforderlich.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO Ordner (name, erstellerID) VALUES (?, ?)',
            [name, req.session.userID]
        );
        res.status(201).json({ message: 'Ordner erfolgreich erstellt!', folderID: result.insertId });
    } catch (error) {
        console.error('Fehler beim Erstellen des Ordners:', error);
        res.status(500).json({ message: 'Fehler beim Erstellen des Ordners.' });
    }
};

// Lernset in einen Ordner verschieben
const assignSetToFolder = async (req, res) => {
    const { lernsetId, folderId } = req.body;

    if (!lernsetId || !folderId) {
        return res.status(400).json({ message: 'Lernset-ID und Ordner-ID sind erforderlich.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE Lernset SET ordnerID = ? WHERE id = ?',
            [folderId, lernsetId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Lernset nicht gefunden.' });
        }
        res.status(200).json({ message: 'Lernset erfolgreich dem Ordner zugewiesen.' });
    } catch (error) {
        console.error('Fehler beim Zuweisen des Lernsets:', error);
        res.status(500).json({ message: 'Fehler beim Zuweisen des Lernsets.' });
    }
};

// Alle Ordner des Benutzers abrufen
const getFolder = async (req, res) => {
    try {
        const [folders] = await pool.query(
            'SELECT * FROM Ordner WHERE erstellerID = ?',
            [req.session.userID]
        );
        res.status(200).json(folders);
    } catch (error) {
        console.error('Fehler beim Abrufen der Ordner:', error);
        res.status(500).json({ message: 'Fehler beim Abrufen der Ordner.' });
    }
};

// Alle Lernsets in einem bestimmten Ordner abrufen
const getSetsInFolder = async (req, res) => {
    const folderId = req.query.folderId;

    if (!folderId) {
        return res.status(400).json({ message: 'Ordner-ID fehlt.' });
    }

    try {
        const [sets] = await pool.query(
            'SELECT * FROM Lernset WHERE ordnerID = ?',
            [folderId]
        );
        res.status(200).json(sets);
    } catch (error) {
        console.error('Fehler beim Abrufen der Lernsets:', error);
        res.status(500).json({ message: 'Fehler beim Abrufen der Lernsets.' });
    }
};

module.exports = { createFolder, getFolder };