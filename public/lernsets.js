function loadSets() {
    fetch('/getSet')
        .then(response => response.json())
        .then(sets => {
            const setList = document.getElementById('setList');
            setList.innerHTML = '';  // Leere die Liste
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
        })
        .catch(err => console.error('Fehler beim Laden der Sets:', err));
}


loadSets(); // Beim Laden der Seite Ordner abrufen