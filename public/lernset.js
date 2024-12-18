 // Hole die Lernset-ID aus der URL
 const urlParams = new URLSearchParams(window.location.search);
 const lernsetId = urlParams.get('id');

 if (lernsetId) {
     // Hole den Namen des Lernsets von der Backend-API
     fetch(`/getLernset?id=${lernsetId}`)
         .then(response => response.json())
         .then(data => {
             if (data.name) {
                 // Setze den Namen des Lernsets in den Titel
                 document.getElementById('lernsetName').innerText = data.name;
            }
            document.getElementById('beschreibung').innerText = data.description;
         })
         .catch(error => {
             console.error('Fehler beim Abrufen des Lernset-Namens:', error);
         });
         fetch(`/foldermitlernset?id=${lernsetId}`)
         .then(response => response.json())  // Stelle sicher, dass die Antwort als JSON verarbeitet wird
         .then(folders => {
             if (Array.isArray(folders)) {  // Prüfe, ob die Antwort ein Array ist
                 const setfolderlist = document.getElementById('setfolderlist');
                 folders.forEach(folder => {
                     const li = document.createElement('li');
                     li.textContent = folder.name;
                     setfolderlist.appendChild(li);
                 });
             } else {
                 console.error('Erwartetes Array, aber erhalten:', folders);
             }
         })
 }
 // Weiterleitung zum Lernmodus
 document.getElementById('goToLearningButton').addEventListener('click', function() {
     if (lernsetId) {
         // Leite den Benutzer weiter und füge die id zur URL von lernen.html hinzu
         window.location.href = `lernen.html?id=${lernsetId}`;
     } else {
         alert('Lernset-ID nicht gefunden.');
     }
 });


 document.getElementById('teilen').addEventListener('click', () => {

    document.getElementById('linkInput').value = `https://freezlet.ch/teilen?id=${lernsetId}`;
    document.getElementById('overlayTeilen').style.display = 'block';
});

document.getElementById('closeButton').addEventListener('click', () => {
    document.getElementById('overlayTeilen').style.display = 'none';
});

document.getElementById('teilen').addEventListener('click', () => {
    document.getElementById('overlayTeilen').style.display = 'block';
});

function copyLink() {
    const linkInput = document.getElementById("linkInput");

    // Markiere den Text im Input-Feld
    linkInput.select();
    linkInput.setSelectionRange(0, 99999); // Für mobile Geräte

    // Kopiere den Text in die Zwischenablage
    document.execCommand("copy");

    // Optional: Bestätigung für den Benutzer anzeigen
    alert("Link wurde kopiert!");
}

document.getElementById('bearbeiten').addEventListener('click', function() {
    if (lernsetId) {
        fetch(`/ersteller?id=${lernsetId}`)
            .then(response => response.json())  // Die Antwort als JSON parsen
            .then(data => {
                if (data.success) {
                    // Erfolgreiche Antwort: Weiterleiten zur Bearbeitungsseite
                    window.location.href = `bearbeiten.html?id=${lernsetId}`;
                } else {
                    // Fehlerhafte Antwort: Fehlermeldung anzeigen
                    alert(data.message || 'Unbekannter Fehler');
                }
            })
            .catch(error => {
                // Bei einem Fehler (z.B. Netzwerkfehler)
                console.error('Fehler bei der Anfrage:', error);
                alert('Fehler bei der Anfrage. Bitte versuche es später noch einmal.');
            });
    } else {
        alert('Lernset-ID nicht gefunden.');
    }
});