const params = new URLSearchParams(window.location.search);
const messageTitle = document.getElementById('messageTitle');

// Nachricht aus den URL-Parametern
messageTitle.innerText = params.get('message');

// Zusätzlicher Text, wenn "success" true ist
if (params.get('success') === 'true') {
    messageTitle.innerText += 'Bitte bestätige deine Email-Adresse';
} else {
    messageTitle.innerText += ' Bitte versuche es erneut oder kontaktiere den Support.';
}