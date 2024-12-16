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
    document.getElementById('overlayaddToFolder').style.display = 'none';
});

fetch(`/getSets?id=${folderID}`)
.then(response => response.json())
.then(sets => {
    const setList = document.getElementById('setList');
    setList.innerHTML = '';  // Leere die Liste
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
        setList.appendChild(button);
    });
})
.catch(err => console.error('Fehler beim Laden der Sets:', err));