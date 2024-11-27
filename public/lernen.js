let cardBack = ''; // Globale Variable für die Rückseite der Karte

// Funktion, um die Karten vom Backend zu holen
async function loadRandomCard() {
    const urlParams = new URLSearchParams(window.location.search);
    const lernsetId = urlParams.get('id'); // Lernset-ID aus der URL

    try {
        const response = await fetch(`/lernen?id=${lernsetId}`);  // GET statt POST
        const cards = await response.json();

        if (cards.length > 0) {
            // Wähle eine zufällige Karte
            const randomCard = cards[Math.floor(Math.random() * cards.length)];

            // Zeige die Vorderseite der zufälligen Karte an
            document.getElementById('cardFront').innerText = randomCard.vorderseite;

            // Speichere die Rückseite in der globalen Variable
            cardBack = randomCard.rueckseite;

        } else {
            console.log("Keine Karten gefunden");
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der Karten:', error);
    }
}

// Funktion zur Überprüfung der Antwort
async function checkAnswer() {
    const userAnswer = document.getElementById('userAnswer').value.trim();
    const feedbackElement = document.getElementById('feedback');
    const cardFrontElement = document.getElementById('cardFront'); // Vorderseite der Karte
    const imageElement = document.getElementById('resultimage');

    // Die Rückseite kommt jetzt aus der globalen Variablen
    const correctAnswer = cardBack;

    // Leere das Eingabefeld nach jeder Antwort
    document.getElementById('userAnswer').value = '';

    if (!userAnswer) {
        feedbackElement.innerText = 'Bitte eine Antwort eingeben.';
        feedbackElement.style.color = 'red'; // Fehlerfarbe
        return;
    }

    if (userAnswer === correctAnswer) {
        feedbackElement.innerText = 'Richtig! Gut gemacht.';
        feedbackElement.style.color = 'green';
        imageElement.src = 'https://conjugaison.tatitotu.ch/static/gifs/happy/happy38.webp';
    } else {
        // Falsche Antwort, zeige Rückseite an und den "Weiter"-Button
        feedbackElement.innerHTML = `Leider falsch. Die richtige Antwort war: <strong>${correctAnswer}</strong>`;
        feedbackElement.style.color = 'red'; // Fehlerfarbe
    }
    imageElement.style.display = 'block';

    // "Weiter"-Button erstellen, der nach einer falschen Antwort angezeigt wird
    const weiterButton = document.createElement('button');
    weiterButton.innerText = 'Weiter';
    weiterButton.onclick = loadRandomCard; // Funktion zum Laden der nächsten Karte
    // Button zum Feedback hinzufügen
    feedbackElement.appendChild(weiterButton);
}

// Beim Laden der Seite eine zufällige Karte laden
window.onload = loadRandomCard;
