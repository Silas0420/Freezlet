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
document.getElementById('saveSetButton').addEventListener('click', function () {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    if (!title) {
        alert('Bitte geben Sie einen Titel für das Lernset ein.');
        return; // Abbrechen, wenn kein Titel vorhanden ist
    }

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

    const newSet = { title, description, cards };

    // Ladescreen anzeigen
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.style.display = 'flex';

    fetch('/lernseterstellung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSet)
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Lernset erfolgreich erstellt!') {
                window.location.href = `/lernset.html?id=${data.setID}`;
            }
        })
        .catch(error => {
            console.error('Fehler:', error);
            alert('Fehler beim Erstellen des Lernsets');
        })
        .finally(() => {
            // Ladescreen ausblenden
            loadingScreen.style.display = 'none';
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