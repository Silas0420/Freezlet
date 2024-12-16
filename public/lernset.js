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
    fetch(`/setinfolders?id=${lernsetId}`)
    .then(folders => {
        const setfolderlist = document.getElementById('setfolderlist');
        setfolderlist.innerHTML = '';  // Leere die Liste
        folders.forEach(folder => {
            // Erstelle ein Button-Element
            const button = document.createElement('button');
            button.textContent = folder.name;
            button.className = 'ordner-button';
    
            button.addEventListener('click', () => {
                     window.location.href = `/meinordner.html?id=${folder.ID}`;
            });
            // Füge den Button der Liste hinzu
            setfolderlist.appendChild(button);
        });
    })
    .catch(err => console.error('Fehler beim Laden der Ordner:', err));
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