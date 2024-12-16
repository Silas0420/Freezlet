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
    const folderID = req.query.fid;  // Ordner-ID
    const lernsetID = req.query.sid; // Lernset-ID

    if (!lernsetID || !folderID) {
        return res.status(400).json({ message: 'Lernset-ID und Ordner-ID sind erforderlich.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO Lernset2Ordner (ordnerID, lernsetID) VALUES (?, ?)',
            [folderID, lernsetID]
        );
        res.status(200).json({ message: 'Lernset erfolgreich dem Ordner zugewiesen.' });
    } catch (error) {
        console.error('Fehler beim Zuweisen des Lernsets:', error);
        res.status(500).json({ message: 'Fehler beim Zuweisen des Lernsets.' });
    }
};

// Alle Ordner des Benutzers abrufen
const getFolders = async (req, res) => {
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

const getFolder = async (req, res) => {
    const folderID = req.query.id; // Ordner-ID aus der URL

    if (!folderID) {
        return res.status(400).json({ message: 'Folder-ID fehlt.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        // Hole den Namen des Ordners
        const [folder] = await connection.query(
            'SELECT name FROM Ordner WHERE ID = ?',
            [folderID]
        );

        // Überprüfen, ob der Ordner existiert
        if (folder.length === 0) {
            return res.status(404).json({ message: 'Ordner nicht gefunden.' });
        }

        // Hole alle zugehörigen Lernsets
        const [sets] = await connection.query(
            'SELECT L.* FROM Lernset L JOIN Lernset2Ordner L2O ON L.ID = L2O.lernsetIDWHERE L2O.ordnerID = ?;',
            [folderID]
        );

        // Antwort mit Ordnername und Sets
        res.status(200).json({
            folderName: folder[0].name, // Der Name des Ordners
            sets: sets                  // Array der zugehörigen Lernsets
        });
    } catch (error) {
        console.error('Fehler beim Abrufen der Daten:', error);
        res.status(500).json({ message: 'Fehler beim Abrufen der Datenbank.' });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = { createFolder, getFolders, getFolder, assignSetToFolder};