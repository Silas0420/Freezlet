const params = new URLSearchParams(window.location.search);
const messageTitle = document.getElementById('messageTitle');

// Nachricht aus den URL-Parametern
messageTitle.innerText = params.get('message');

// Zusätzlicher Text, wenn "success" true ist
messageTitle.innerText += ' Vielen Dank! Du wirst gleich zur Loginseite weitergeleitet...';
    setTimeout(() => {
              window.location.href = '/login.html'; // Weiterleitung nach 3 Sekunden
          }, 3000);