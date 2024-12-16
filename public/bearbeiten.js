const urlParams = new URLSearchParams(window.location.search);
const lernsetId = urlParams.get('id');
document.getElementById('addCardBtn').addEventListener('click', function() {
    const cardContainer = document.getElementById('cardContainer');
    const cardCount = cardContainer.children.length + 1;

    const cardDiv = document.createElement('div');
    cardDiv.classList.add('container');
    cardDiv.innerHTML = `
        <div class="entry">
            <div class="entry-number">${cardCount}</div>
            <div class="entry-content">
                <div class="field">
                    <label for="vorderseite-${cardCount}">Vorderseite</label>
                    <input type="text" id="vorderseite-${cardCount}" placeholder="Begriff eingeben" required>
                </div>
                <div class="field">
                    <label for="rueckseite-${cardCount}">Rückseite</label>
                    <input type="text" id="rueckseite-${cardCount}" placeholder="Definition eingeben" required>
                </div>
            </div>
            <div class="delete-icon" onclick="deleteCard(this)">&times;</div>
        </div>
    `;
    cardContainer.appendChild(cardDiv);
});

function deleteCard(icon) {
    icon.closest('.container').remove();
    updateCardNumbers();
}

function updateCardNumbers() {
    const cards = document.querySelectorAll('.entry-number');
    cards.forEach((card, index) => {
        card.textContent = index + 1;
    });
}

// Event-Listener für den neuen "Set speichern"-Button
document.getElementById('editSetButton').addEventListener('click', function () {
    const title = document.getElementById('titel').value;
    const description = document.getElementById('beschreibung').value;
    const cards = [];
    const entries = document.querySelectorAll('.container');
    entries.forEach(entry => {
        const vorderseite = entry.querySelector('input[id^="vorderseite"]').value;
        const rueckseite = entry.querySelector('input[id^="rueckseite"]').value;
        cards.push({ vorderseite, rueckseite });
    });
    if (entries.length === 0) {
        alert('Bitte fügen Sie mindestens eine Karte zum Lernset hinzu.');
        return; // Aktion abbrechen
    }
    setID = lernsetId;
    const newSet = { setID, title, description, cards };
    // Ladescreen anzeigen
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.style.display = 'flex';

    fetch('/editset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSet)
    })
    .then(response => response.json())
    .catch(error => {
            console.error('Fehler:', error);
            alert('Fehler beim bearbeiten des Lernsets');
        })
        .finally(() => {
            window.location.href = `/lernset.html?id=${data.setID}`;
        });
});

//importieren
document.getElementById('openButton').addEventListener('click', () => {
    document.getElementById('overlay').style.display = 'block';
});

document.getElementById('closeButton').addEventListener('click', () => {
document.getElementById('overlay').style.display = 'none';
});

document.getElementById('saveButton').addEventListener('click', () => {
const importText = document.getElementById('importText').value;

// Schließe das Overlay
document.getElementById('overlay').style.display = 'none';

// Verarbeite die importierten Karten
const cardContainer = document.getElementById('cardContainer');
const lines = importText.split('\n'); // Zeilenweise aufteilen

lines.forEach((line) => {
const parts = line.split('\t'); // Tabulator als Trenner verwenden

if (parts.length === 2) { // Überprüfe, ob Vorderseite und Rückseite existieren
const [vorderseite, rueckseite] = parts;

if (vorderseite.trim() && rueckseite.trim()) { // Stelle sicher, dass beide Werte nicht leer sind
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('container');
    const cardCount = cardContainer.children.length + 1;
    cardDiv.innerHTML = `
        <div class="entry">
            <div class="entry-number">${cardContainer.children.length + 1}</div>
            <div class="entry-content">
                <div class="field">
                    <label>Vorderseite</label>
                    <input type="text" id="vorderseite-${cardCount}" value="${vorderseite}" readonly>
                </div>
                <div class="field">
                    <label>Rückseite</label>
                    <input type="text" id="rueckseite-${cardCount}" value="${rueckseite}" readonly>
                </div>
            </div>
            <div class="delete-icon" onclick="deleteCard(this)">&times;</div>
        </div>
    `;
    cardContainer.appendChild(cardDiv);
}
}
});
});
    // Hole den Namen des Lernsets von der Backend-API
    fetch(`/getLernset?id=${lernsetId}`)
    .then(response => response.json())
    .then(data => {
        if (data.name) {
            document.getElementById('titel').value = data.name;
        }
           document.getElementById('beschreibung').value = data.description;
    })
    .catch(error => {
        console.error('Fehler beim Abrufen des Lernsets:', error);
    });
    fetch(`/setinfolders?id=${lernsetId}`)
    .then(response => response.json())  // Stelle sicher, dass die Antwort als JSON verarbeitet wird
    .then(folders => {
        if (Array.isArray(folders)) {  // Prüfe, ob die Antwort ein Array ist
            const setfolderlist = document.getElementById('setfolderlist');
            setfolderlist.innerHTML = '';  // Leere die Liste
            folders.forEach(folder => {
                const li = document.createElement('li');
                li.textContent = folder.name;
                setfolderlist.appendChild(li);
            });
        } else {
            console.error('Erwartetes Array, aber erhalten:', folders);
        }
    })
    .catch(err => console.error('Fehler beim Laden der Ordner:', err));
    document.addEventListener('DOMContentLoaded', async function() {  // async hinzugefügt
        try {
            const response = await fetch(`/lernen?id=${lernsetId}`);  // GET statt POST
            const cards = await response.json();
            if (cards.length > 0) {
                const cardContainer = document.getElementById('cardContainer');
                cards.forEach(card => {
                    const { vorderseite, rueckseite } = card; // Destructuring von card
                    if (vorderseite.trim() && rueckseite.trim()) {
                        const cardDiv = document.createElement('div');
                        cardDiv.classList.add('container');
                        const cardCount = cardContainer.children.length + 1;
                        cardDiv.innerHTML = `
                            <div class="entry">
                                <div class="entry-number">${cardContainer.children.length + 1}</div>
                                <div class="entry-content">
                                    <div class="field">
                                        <label>Vorderseite</label>
                                        <input type="text" id="vorderseite-${cardCount}" value="${vorderseite}" readonly>
                                    </div>
                                    <div class="field">
                                        <label>Rückseite</label>
                                        <input type="text" id="rueckseite-${cardCount}" value="${rueckseite}" readonly>
                                    </div>
                                </div>
                                <div class="delete-icon" onclick="deleteCard(this)">&times;</div>
                            </div>
                        `;
                        cardContainer.appendChild(cardDiv);
                    }
                });                
            }
        } catch (error) {
            console.error('Fehler beim Abrufen der Karten:', error);
        }
    });
    

document.getElementById('addToFolder').addEventListener('click', () => {
    document.getElementById('overlayaddToFolder').style.display = 'block';
});

document.getElementById('closeButtonf').addEventListener('click', () => {
    document.getElementById('overlayaddToFolder').style.display = 'none';
});

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

        button.addEventListener('click', () => {
                fetch(`/addToFolder?fid=${folder.ID}&sid=${lernsetId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Fehler: ${response.status} ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    alert('Lernset erfolgreich zum Ordner hinzugefügt');
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Fehler:', error);
                });
        });

        // Füge den Button der Liste hinzu
        folderList.appendChild(button);
    });
})
.catch(err => console.error('Fehler beim Laden der Ordner:', err));


document.getElementById('deleteset').addEventListener('click', function() {
    if (confirm('Bist du sicher, dass du das Lernset löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.')) {
        fetch( `/deleteset?id=${lernsetId}`)
        .then(response => response.json())
        .then(data => {
            console.log('Antwort:', data);
            if (data.success) {
                alert('Das Lernset wurde gelöscht.'); 
                window.location.href = 'lernsets.html';
            } else {
                alert('Fehler beim Löschen deines Lernsets.');
            }
        })
        .catch(err => console.error('Fehler:', err));
    }
});