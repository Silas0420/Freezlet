const pool = require('./db'); // Stelle sicher, dass die Verbindung korrekt importiert wird

// Funktion zum Erstellen eines neuen Lernsets
// Funktion zum Erstellen eines neuen Lernsets (mit Lernstand für jede Karte)
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
        await connection.query(
          'INSERT INTO Lernset2Benutzer (benutzerID, lernsetID) VALUES (?, ?)',
          [req.session.userID, setID]
      );
        // 2. Erstelle die Karten und den Lernstand
        for (const card of cards) {
            const { vorderseite, rueckseite } = card;
            
            // 2.1 Karte einfügen
            const [cardResult] = await connection.query(
                'INSERT INTO Karte (vorderseite, rueckseite, lernsetID) VALUES (?, ?, ?)',
                [vorderseite, rueckseite, setID]
            );

            const cardID = cardResult.insertId;

            // 2.2 Lernstand für jede Karte erstellen
            await connection.query(
                'INSERT INTO Lernstand (benutzerID, kartenID, lernstand) VALUES (?, ?, ?)',
                [req.session.userID, cardID, 0]  // Lernstand startet mit 0
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


//importieren
async function importCards(req, res) {
    const { text } = req.body;
  
    if (!text || !req.session.userID) {
      return res.status(400).json({ message: 'Fehlerhafte Eingabe oder Benutzer nicht angemeldet.' });
    }
  
    const lines = text.split('\n'); // Teilt den Text in Zeilen auf
    const cards = lines
      .map(line => line.split('\t')) // Teilt jede Zeile in Vorderseite und Rückseite
      .filter(parts => parts.length === 2) // Ignoriert ungültige Zeilen
      .map(([vorderseite, rueckseite]) => ({ vorderseite, rueckseite }));
  
    if (cards.length === 0) {
      return res.status(400).json({ message: 'Keine gültigen Karten gefunden.' });
    }
  
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();
  
      // Lernset erstellen
      const [setResult] = await connection.query(
        'INSERT INTO Lernset (titel, beschreibung, erstellerID) VALUES (?, ?, ?)',
        ['Importiertes Set', null, req.session.userID]
      );
  
      const setID = setResult.insertId;
  
      // Karten einfügen
      for (const card of cards) {
        await connection.query(
          'INSERT INTO Karte (vorderseite, rueckseite, setID) VALUES (?, ?, ?)',
          [card.vorderseite, card.rueckseite, setID]
        );
      }
  
      await connection.commit();
      res.status(201).json({ message: 'Import erfolgreich!', count: cards.length, setID });
    } catch (error) {
      console.error('Fehler beim Importieren von Karten:', error);
      if (connection) await connection.rollback();
      res.status(500).json({ message: 'Fehler beim Import.' });
    } finally {
      if (connection) connection.release();
    }
  }

  const getLernset = async (req, res) => {
    const lernsetId = req.query.id;  // Lernset-ID aus der URL
    if (!lernsetId) {
        return res.status(400).json({ message: 'Lernset-ID fehlt.' });
    }
    let connection;
    try {
        connection = await pool.getConnection();

        // Hole den Titel des Lernsets (oder name, je nach der Spaltenbezeichnung)
        const [result] = await connection.query(
            'SELECT titel,beschreibung FROM Lernset WHERE ID = ?', [lernsetId]
        );

        if (result.length === 0) {
            return res.status(404).json({ message: 'Lernset nicht gefunden.' });
        }

        res.json({
          name: result[0].titel,
          description: result[0].beschreibung
      }); // Rückgabe des Titels (oder name, je nach Spalte)

    } catch (error) {
        console.error('Fehler beim Abrufen des Lernset-Namens:', error);
        res.status(500).json({ message: 'Fehler beim Abrufen des Lernset-Namens.' });
    } finally {
        if (connection) connection.release();
    }
};

// Alle Ordner des Benutzers abrufen
const getSet = async (req, res) => {
  try {
      const [sets] = await pool.query(
          'SELECT * FROM Lernset JOIN Lernset2Benutzer ON Lernset.ID = Lernset2Benutzer.lernsetID WHERE Lernset2Benutzer.benutzerID = ?',
          [req.session.userID]
      );
      res.status(200).json(sets);
  } catch (error) {
      console.error('Fehler beim Abrufen der Sets:', error);
      res.status(500).json({ message: 'Fehler beim Abrufen der Sets.' });
  }
};

const teilen = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    //return res.redirect(`/verifizierung.html?success=false&message=${encodeURIComponent("Token für die Verifizierung fehlt")}`);
  } else {
    return res.redirect(`/setübernehmen.html?id=${id}`);
  }
};

const lernsetuebernahme = async (req, res) => {
  const { lernsetId } = req.body;  // Entnehmen der ID aus dem Request-Body

  if (!lernsetId) {
    return res.status(400).json({ message: 'Lernset-ID fehlt in der Anfrage.' });
  }

    let connection;
    try {
        // Beginne eine Transaktion, um sicherzustellen, dass alle Operationen zusammen durchgeführt werden
        connection = await pool.getConnection();
        await connection.beginTransaction();
  

        const [setResult] = await connection.query(
            'INSERT INTO Lernset2Benutzer (benutzerID, lernsetID) VALUES (?, ?)',
            [req.session.userID, lernsetId]  // Annahme: Der Benutzer ist in der Session gespeichert
        );
        const cardsInSet = await connection.query('SELECT ID FROM Karte WHERE lernsetID = ?', [lernsetId]);

          // Überprüfen, ob Karten vorhanden sind
          if (cardsInSet.length === 0) {
            return res.status(404).json({ message: 'Keine Karten im Lernset gefunden.' });
          }
          for (let card of cardsInSet[0]) {
          await connection.query('INSERT INTO Lernstand (benutzerID, kartenID) VALUES (?, ?)',
            [req.session.userID, card.ID]
          );
        }
        // 3. Commit der Transaktion
        await connection.commit();

        // Rückgabe der erfolgreichen Antwort
        res.status(201).json({ message: 'Lernset erfolgreich hinzugefügt!', lernsetId });

    } catch (error) {
        console.error('Fehler beim Erstellen des Lernsets:', error);
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        res.status(500).json({ message: 'Fehler beim Erstellen des Lernsets.' });
    }
};


module.exports = { createSet, importCards,getLernset , getSet ,teilen ,lernsetuebernahme};