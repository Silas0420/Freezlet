        // Formular-Submit handler
        document.getElementById('login-form').addEventListener('submit', async function(e) {
            e.preventDefault(); // Verhindert das Standard-Formular-Submit
      
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
      
            document.getElementById('error-message').innerText = '';
  
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
                window.location.href = '/home.html';
              } else {
                document.getElementById('error-message').innerText = data.message;
              }
            } catch (error) {
              console.error('Fehler bei der Anfrage:', error);
              document.getElementById('error-message').innerText = 'Ein unerwarteter Fehler ist aufgetreten.';
            }
  
          });