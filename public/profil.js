// Benutzername ändern
document.getElementById('usernamechange').addEventListener('click', function() {
    document.getElementById('title').textContent = 'Benutzername ändern';
    document.getElementById('input').placeholder = 'Neuer Benutzername';
    document.getElementById('overlayprofil').style.display = 'block';
});

// Passwort ändern
document.getElementById('passwordchange').addEventListener('click', function() {
    document.getElementById('title').textContent = 'Passwort ändern';
    document.getElementById('input').placeholder = 'Neues Passwort';
    document.getElementById('overlayprofil').style.display = 'block';
});

// Overlay schließen
document.getElementById('closeButton').addEventListener('click', () => {
    document.getElementById('overlayprofil').style.display = 'none';
});

// Speichern der Änderungen
document.getElementById('saveButton').addEventListener('click', () => {
    const newValue = document.getElementById('input').value.trim();
    const title = document.getElementById('title').textContent;

    // Überprüfen, ob der Benutzer etwas eingegeben hat
    if (!newValue) {
        alert('Bitte geben Sie einen neuen Wert ein.');
        return;
    }

    let updateType = '';
    if (title === 'Benutzername ändern') {
        updateType = 'username';
    } else if (title === 'Passwort ändern') {
        updateType = 'password';
    }

    // Hier sendest du die Änderungen an den Server
    fetch(`/update${updateType}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [updateType]: newValue })  // Hier wird der neue Benutzername oder Passwort gesendet
    })
    .then(response => response.json())
    .then(data => {
        console.log('Antwort:', data);
        if (data.success) {
            alert(`${title} wurde erfolgreich geändert.`);
            // Overlay schließen und Eingabe zurücksetzen
            window.location.reload();
        } else {
            alert('Fehler beim Speichern der Änderungen.');
        }
    })
    .catch(err => console.error('Fehler:', err));
});


document.getElementById('delete-account').addEventListener('click', function() {
    if (confirm('Bist du sicher, dass du deinen Account löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.')) {
        fetch('/deleteaccount', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Hier senden wir keine unnötigen Daten, daher bleibt der Body leer
            body: JSON.stringify({})  
        })
        .then(response => response.json())
        .then(data => {
            console.log('Antwort:', data);
            if (data.success) {
                alert('Dein Account wurde gelöscht.'); 
                window.location.href = 'registrierung.html';  // Weiterleitung zur Registrierungsseite
            } else {
                alert('Fehler beim Löschen deines Accounts.');
            }
        })
        .catch(err => console.error('Fehler:', err));
    }
});

// Funktion, um Benutzerdaten abzurufen und im Profil anzuzeigen
function loadUserData() {
    fetch('/getuserdata')
        .then(response => response.json())
        .then(data => {
            if (data.username && data.email) {
                document.getElementById('username').textContent = data.username;
                document.getElementById('email').textContent = data.email;
            } else {
                alert('Fehler beim Abrufen der Benutzerdaten.');
            }
        })
        .catch(err => console.error('Fehler beim Laden der Benutzerdaten:', err));
}

// Beim Laden der Seite die Benutzerdaten abrufen
loadUserData();