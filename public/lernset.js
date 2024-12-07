 // Hole die Lernset-ID aus der URL
 const urlParams = new URLSearchParams(window.location.search);
 const lernsetId = urlParams.get('id');

 if (lernsetId) {
     // Hole den Namen des Lernsets von der Backend-API
     fetch(`/lernsetName?id=${lernsetId}`)
         .then(response => response.json())
         .then(data => {
             if (data.name) {
                 // Setze den Namen des Lernsets in den Titel
                 document.getElementById('lernsetName').innerText = data.name;
             }
         })
         .catch(error => {
             console.error('Fehler beim Abrufen des Lernset-Namens:', error);
         });
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

    document.getElementById('linkInput').value = `http://localhost:3000/teilen?id=${lernsetId}`;
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