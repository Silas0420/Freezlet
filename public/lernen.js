let cardFront = false;
let cardBack = '';
let cardID = ''; // Globale Variable für die Rückseite der Karte
const urlParams = new URLSearchParams(window.location.search);
const lernsetId = urlParams.get('id'); // Lernset-ID aus der URL
// Funktion, um die Karten vom Backend zu holen
async function loadRandomCard() {
    try {
        const response = await fetch(`/lernen?id=${lernsetId}`);  // GET statt POST
        const cards = await response.json();

        if (cards.length > 0) {
            // Wähle eine zufällige Karte
            const randomCard = cards[Math.floor(Math.random() * cards.length)];

            // Zeige die Vorderseite der zufälligen Karte an
            document.getElementById('cardFront').innerText = cardFront ? randomCard.rueckseite : randomCard.vorderseite;

            // Speichere die Rückseite in der globalen Variable
            cardBack = cardFront ? randomCard.vorderseite : randomCard.rueckseite;
            cardID = randomCard.kartenID;

        } else {
            cardContainer.style.display = 'none'; // Verstecke das Karten-Container
            document.getElementById('feedback').innerHTML = `
                <p style="color: white;">Super, du hast schon alles gelernt!</p>
                <button style="display: flex;" id="restartButton">Nochmal lernen</button>
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
        window.location.reload();
    } catch (error) {
        console.error('Fehler beim Zurücksetzen des Lernstands:', error);
    }
}

function highlightDifferences(userAnswer, correctAnswer) {
    let highlighted = '';
    const maxLength = Math.max(userAnswer.length, correctAnswer.length);

    for (let i = 0; i < maxLength; i++) {
        const userChar = userAnswer[i] || ''; // falls der Benutzer eine kürzere Antwort hat
        const correctChar = correctAnswer[i] || ''; // falls die richtige Antwort länger ist

        if (userChar === correctChar) {
            highlighted += userChar; // Gleiche Zeichen bleiben normal
        } else {
            // Falsche Zeichen rot und fett markieren
            highlighted += `<span style="color: red; font-weight: bold;">${userChar}</span>`;
        }
    }
    return highlighted;
}

async function checkAnswer() {
    const userAnswer = document.getElementById('userAnswer').value.trim();
    const feedbackElement = document.getElementById('feedback');
    const image = document.createElement('img');

    const correctAnswer = cardBack;

    if (!userAnswer) {
        feedbackElement.innerText = 'Bitte eine Antwort eingeben.';
        feedbackElement.style.color = 'red';
        feedbackElement.style.paddingTop = '1rem';
        return;
    }

    document.getElementById('cardContainer').style.display = 'none';

    const isCorrect = userAnswer === correctAnswer;

    if (isCorrect) {
        feedbackElement.innerText = 'Richtig! Gut gemacht.';
        feedbackElement.style.color = 'green';
    } else {
        // Wenn die Antwort falsch ist, die Unterschiede hervorheben
        const highlightedAnswer = highlightDifferences(userAnswer, correctAnswer);
        feedbackElement.innerHTML = `
            Leider falsch. Deine Antwort war: <span>${highlightedAnswer}</span>, 
            aber die richtige Antwort ist: <span style="color: green; font-weight: bold;">${correctAnswer}</span>.
        `;
        feedbackElement.style.color = 'red';
    }

    feedbackElement.style.paddingTop = '1rem';
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

    const weiterButton = document.createElement("button");
    weiterButton.className = "Lernen-Button-Blau";
    weiterButton.innerText = "Weiter";
    weiterButton.onclick = weiter;

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
       feedbackElement.style.paddingTop = '0rem';
   }

async function back() {
    window.location.href = `/lernset.html?id=${lernsetId}`;
};

// Beim Laden der Seite eine zufällige Karte laden
window.onload = loadRandomCard;
async function optionen() {
    document.getElementById('overlayoptionen').style.display = 'block';
};

document.getElementById('closeButton').addEventListener('click', () => {
    document.getElementById('overlayoptionen').style.display = 'none';
});

document.getElementById('saveButton').addEventListener('click', () => {
    if (document.getElementById('vorderseite').checked) {
        cardFront = true;
    } else {
        cardFront = false;
    }
    document.getElementById('overlayoptionen').style.display = 'none';
    loadRandomCard();
});

async function weiter(){
    document.getElementById('feedback').innerText = '';
    document.getElementById('feedback').innerHTML = '';
    document.getElementById('userAnswer').value = '';
    document.getElementById('cardContainer').style.display = 'block';
    await loadRandomCard();
};