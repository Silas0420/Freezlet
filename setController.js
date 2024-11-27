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

        // 2. Erstelle die Karten und den Lernstand
        for (const card of cards) {
            const { vorderseite, rueckseite } = card;
            
            // 2.1 Karte einfügen
            const [cardResult] = await connection.query(
                'INSERT INTO Karte (vorderseite, rueckseite, setID) VALUES (?, ?, ?)',
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
  

module.exports = { createSet, importCards };