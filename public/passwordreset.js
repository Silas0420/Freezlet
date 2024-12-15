        document.getElementById('login-form').addEventListener('submit', async function(e) {
            e.preventDefault(); // Verhindert das Standard-Formular-Submit
      
            const password = document.getElementById('password').value;
            document.getElementById('error-message').innerText = '';
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id');
            try {
                const response = await fetch(`/passwordreset`, { // Füge die ID in die URL ein
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ password, id }), // Passworteingabe senden
                });                
        
              const data = await response.json();
        
              if (response.ok) {
                messageTitle.innerText += ' Vielen Dank! Du wirst gleich zur Startseite weitergeleitet...';
                setTimeout(() => {
                          window.location.href = '/home.html'; // Weiterleitung nach 3 Sekunden
                      }, 3000);
            } else {
                document.getElementById('error-message').innerText = data.message;
                messageTitle.innerText += ' Bitte versuche es erneut oder kontaktiere den Support.';
              }
            } catch (error) {
              console.error('Fehler bei der Anfrage:', error);
              document.getElementById('error-message').innerText = 'Ein unerwarteter Fehler ist aufgetreten.';
            }
  
          });

          