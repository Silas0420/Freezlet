        // Formular-Submit handler
        document.getElementById('login-form').addEventListener('submit', async function(e) {
            e.preventDefault(); // Verhindert das Standard-Formular-Submit
      
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
      
            document.getElementById('error-message').innerText = '';
                // Ladescreen anzeigen
            const loadingScreen = document.getElementById('loadingScreen');
            loadingScreen.style.display = 'flex';
            try {
                const response = await fetch('/login', { //Noch ändern bei Online!!!
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
              });
        
              const data = await response.json();
        
              if (response.ok) {
                  const urlParams = new URLSearchParams(window.location.search);
                  const lernsetId = urlParams.get('id');
                  try{
                      const response = await fetch('/lernsetuebernahme', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json', // Optional, aber vielleicht trotzdem sinnvoll, um den Server zu informieren
                      },
                      body: JSON.stringify({
                          lernsetId: lernsetId, // Lernset-ID in der Anfrage mitgeben
                      }),
                  });
                  const data = await response.json();
                      if (response.ok) {
                        loadingScreen.style.display = 'none';
                          alert('Du hast erfolgreich das Lernset zu deinen hinzugefügt.');
                          window.location.href = `/lernset.html?id=${lernsetId}`;
                      } else {
                      document.getElementById('error-message').innerText = data.message;
                      }
                  } catch (error) {
                      console.error('Fehler bei der Anfrage:', error);
                      document.getElementById('error-message').innerText = 'Ein unerwarteter Fehler ist aufgetreten.';
                  }
              } else {
                document.getElementById('error-message').innerText = data.message;
              }
            } catch (error) {
              console.error('Fehler bei der Anfrage:', error);
              document.getElementById('error-message').innerText = 'Ein unerwarteter Fehler ist aufgetreten.';
            }
  
          });