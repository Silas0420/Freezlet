const params = new URLSearchParams(window.location.search);
const messageTitle = document.getElementById('messageTitle');

// Nachricht aus den URL-Parametern
messageTitle.innerText = params.get('message');

// Zusätzlicher Text, wenn "success" true ist
if (params.get('success') === 'true') {
    messageTitle.innerText += ' Vielen Dank! Du wirst gleich zur Startseite weitergeleitet...';
    setTimeout(() => {
              window.location.href = '/home.html'; // Weiterleitung nach 3 Sekunden
          }, 3000);
} else {
    messageTitle.innerText += ' Bitte versuche es erneut oder kontaktiere den Support.';
    setTimeout(() => {
        window.location.href = '/index.html'; // Weiterleitung nach 5 Sekunden
    }, 5000);
}