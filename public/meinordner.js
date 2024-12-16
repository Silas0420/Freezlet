const urlParams = new URLSearchParams(window.location.search);
const folderID = urlParams.get('id');
async function loadSets() {
    if (folderID) {
        try {
            const response = await fetch(`/getFolder?id=${folderID}`);
    
            if (!response.ok) {
                throw new Error(`Fehler: ${response.status} ${response.statusText}`);
            }
    
            // JSON-Daten aus der Antwort extrahieren
            const data = await response.json();
            const sets = data.sets;
            console.log('Sets:', sets);
    
            // Daten in der UI anzeigen (Beispiel)
            document.title = data.folderName;
            document.getElementById('foldername').textContent = data.folderName;
            sets.forEach(set => {
                                // Erstelle ein Button-Element
                                const button = document.createElement('button');
                                button.textContent = set.titel;
                
                                // Füge einen EventListener hinzu, der den Benutzer bei Klick weiterleitet
                                button.addEventListener('click', () => {
                                    // Hier kannst du den Link oder die Funktion definieren, die nach dem Klick ausgeführt wird
                                    // Beispiel: Weiterleiten zu einer Seite mit Details zum Ordner
                                    window.location.href = `/lernset.html?id=${set.ID}`;
                                });
                
                                // Füge den Button der Liste hinzu
                                setList.appendChild(button);
            });
        } catch (error) {
            console.error('Fehler beim Abrufen der Daten:', error);
        }
    }    
}

loadSets(); // Beim Laden der Seite Ordner abrufen

document.getElementById('addToFolder').addEventListener('click', () => {
    document.getElementById('overlayaddToFolder').style.display = 'block';
});

document.getElementById('closeButtonf').addEventListener('click', () => {
    window.location.reload();
});

fetch(`/getSets?id=${folderID}`)
.then(response => response.json())
.then(sets => {
    const overlaySetList = document.getElementById('overlaySetList');
    overlaySetList.innerHTML = '';  // Leere die Liste
    sets.forEach(set => {
        // Erstelle ein Button-Element
        const button = document.createElement('button');
        button.textContent = set.titel;
        button.className = 'set-button';

        button.addEventListener('click', () => {
            fetch(`/addToFolder?fid=${folderID}&sid=${set.ID}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Fehler: ${response.status} ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    alert('Lernset erfolgreich zum Ordner hinzugefügt');
                })
                .catch(error => {
                    console.error('Fehler:', error);
                });
        });

        // Füge den Button der Liste hinzu
        overlaySetList.appendChild(button);
    });
})
.catch(err => console.error('Fehler beim Laden der Sets:', err));

async function back() {
    window.location.href = `/ordner.html`;
};

document.getElementById("closeButton").addEventListener('click', () => {
    document.getElementById("overlayoptionen").style.display = "none";
})

document.getElementById("optionen").addEventListener('click', () => {
    document.getElementById("overlayoptionen").style.display = "block";
})

document.getElementById("renamefolder").addEventListener('click', () => {
    document.getElementById("overlayrenamefolder").style.display = "block";
})

document.getElementById("closeButtonrf").addEventListener('click', () => {
    document.getElementById("overlayrenamefolder").style.display = "none";
})

document.getElementById("saveButtonrf").addEventListener('click', async() => {
    const foldername = document.getElementById('input').value.trim();
    if (!foldername) {
        alert('Bitte geben Sie einen neuen Ordnernamen ein.');
        return;
    }
    try {
        const response = await  fetch(`/renamefolder`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                foldername: foldername,  // Sende den neuen Ordnernamen
                folderID: folderID       // Sende die Ordner-ID
            })
        });

        console.log(response); // Füge dies hinzu, um die Antwort zu sehen

        const data = await response.json();
        alert("Ordnernamen erfolgreich geändert");
        window.location.reload();
        } catch (error) {
          console.error('Fehler bei der Anfrage:', error);
          alert('Ein unerwarteter Fehler ist aufgetreten. Versuche es nochmal');
      }
});

document.getElementById('deletefolder').addEventListener('click', function() {
    if (confirm('Bist du sicher, dass du den Ordner löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.')) {
        fetch('/deletefolder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({folderID: folderID })  
        })
        .then(response => response.json())
        .then(data => {
            console.log('Antwort:', data);
            if (data.success) {
                alert('Der Ordner wurde gelöscht.'); 
                window.location.href = 'ordner.html';
            } else {
                alert('Fehler beim Löschen deines Ordners.');
            }
        })
        .catch(err => console.error('Fehler:', err));
    }
});
