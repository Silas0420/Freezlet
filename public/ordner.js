document.getElementById('openButton').addEventListener('click', () => {
    document.getElementById('overlayordnererstellen').style.display = 'block';
  });
  
  document.getElementById('closeButton').addEventListener('click', () => {
    document.getElementById('overlayordnererstellen').style.display = 'none';
  });

document.getElementById('saveButton').addEventListener('click', () => {
    const ordnername = document.getElementById('Ordnername').value.trim();
    console.log(JSON.stringify({ name: ordnername })); // Überprüfe die gesendeten Daten
    if (!ordnername) {
        alert('Bitte geben Sie einen Ordnernamen ein.');
        return; // Abbrechen, wenn kein Titel vorhanden ist
    }

    fetch('/ordnererstellung', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: ordnername })
    })
    .then(response => response.json())
.then(data => console.log('Antwort:', data))
.catch(err => console.error('Fehler:', err));
    // Schließe das Overlay
    document.getElementById('overlayordnererstellen').style.display = 'none';
    window.location.reload();   
});

function loadFolders() {
    fetch('/getFolders')
        .then(response => response.json())
        .then(folders => {
            const folderList = document.getElementById('folderList');
            folderList.innerHTML = '';  // Leere die Liste
            folders.forEach(folder => {
                // Erstelle ein Button-Element
                const button = document.createElement('button');
                button.textContent = folder.name;
                button.className = 'ordner-button';

                // Füge einen EventListener hinzu, der den Benutzer bei Klick weiterleitet
                button.addEventListener('click', () => {
                    // Hier kannst du den Link oder die Funktion definieren, die nach dem Klick ausgeführt wird
                    // Beispiel: Weiterleiten zu einer Seite mit Details zum Ordner
                    window.location.href = `meinordner.html?id=${folder.ID}`;  // Beispiel-Link zu einer spezifischen Ordnerseite
                });

                // Füge den Button der Liste hinzu
                folderList.appendChild(button);
            });
        })
        .catch(err => console.error('Fehler beim Laden der Ordner:', err));
}


loadFolders(); // Beim Laden der Seite Ordner abrufen