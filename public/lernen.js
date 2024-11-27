let cardBack = '';
let cardID = ''; // Globale Variable für die Rückseite der Karte

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
            cardID = randomCard.kartenID;

        } else {
            cardContainer.style.display = 'none'; // Verstecke das Karten-Container
            feedbackElement.innerHTML = `
                <p>Super, du hast schon alles gelernt!</p>
                <button id="restartButton">Nochmal lernen</button>
            `;
            document.getElementById('restartButton').onclick = resetAllLearning;
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der Karten:', error);
    }
}
// Funktion zum Zurücksetzen des Lernstands aller Karten
async function resetAllLearning() {
    const urlParams = new URLSearchParams(window.location.search);
    const lernsetId = urlParams.get('id'); // Lernset-ID aus der URL

    try {
        await fetch(`/resetLernstand?id=${lernsetId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        // Lade die erste Karte nach dem Zurücksetzen
        loadRandomCard();
    } catch (error) {
        console.error('Fehler beim Zurücksetzen des Lernstands:', error);
    }
}

// Funktion zur Überprüfung der Antwort
async function checkAnswer() {
    const userAnswer = document.getElementById('userAnswer').value.trim();
    const feedbackElement = document.getElementById('feedback');
    const cardFrontElement = document.getElementById('cardFront'); // Vorderseite der Karte
    const image = document.createElement('img');

    // Die Rückseite kommt jetzt aus der globalen Variablen
    const correctAnswer = cardBack;

    // Leere das Eingabefeld nach jeder Antwort
    document.getElementById('cardContainer').style.display = 'none';


    if (!userAnswer) {
        feedbackElement.innerText = 'Bitte eine Antwort eingeben.';
        feedbackElement.style.color = 'red'; // Fehlerfarbe
        return;
    }

    const isCorrect = userAnswer === correctAnswer;
    feedbackElement.innerText = isCorrect
        ? 'Richtig! Gut gemacht.'
        : `Leider falsch. Die richtige Antwort war: ${correctAnswer}`;
    feedbackElement.style.color = isCorrect ? 'green' : 'red';
    image.src = isCorrect
        ? 'https://conjugaison.tatitotu.ch/static/gifs/happy/happy38.webp'
        : 'https://conjugaison.tatitotu.ch/static/gifs/fail/fail1.webp';

    try {
        await fetch('/updateLernstand', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kartenID: cardID, korrekt: isCorrect })
        });
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Lernstands:', error);
    }


       // "Weiter"-Button erstellen, der nach einer falschen Antwort angezeigt wird
       const weiterButton = document.createElement('button');
       weiterButton.innerText = 'Weiter';
       weiterButton.id = 'weiter'; 
       weiterButton.className = 'Lernen-Button-Blau';
       weiterButton.onclick = () => {
           // Setze das Feedback und den Weiter-Button zurück, wenn "Weiter" gedrückt wird
           resetFeedback();
           loadRandomCard(); // Funktion zum Laden der nächsten Karte
       };
       // Button zum Feedback hinzufügen
       feedbackElement.appendChild(weiterButton);
       feedbackElement.appendChild(image);
   }
   
   // Funktion zum Zurücksetzen des Feedbacks
   function resetFeedback() {
       const feedbackElement = document.getElementById('feedback');
       const weiterButton = document.getElementById('weiter');
   
       // Entferne den "Weiter"-Button und das Feedback
       if (weiterButton) {
           weiterButton.remove();
       }
   
       // Setze das Bild zurück
       feedbackElement.innerText = ''; // Lösche das Feedback
       document.getElementById('userAnswer').value = ''
       document.getElementById('cardContainer').style.display = 'block';
   }


// Beim Laden der Seite eine zufällige Karte laden
window.onload = loadRandomCard;
