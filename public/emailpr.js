// Formular-Submit handler
document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault(); // Verhindert das Standard-Formular-Submit

    const email = document.getElementById('email').value; // Correctly define the 'email' variable
    document.getElementById('error-message').innerText = '';

    try {
        const response = await fetch('/emailpr', { //Noch ändern bei Online!!!
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }), // Use 'email' correctly in the request body
        });

        const data = await response.json();

        if (response.ok) {
            window.location.href = '/emailbestätigung.html'; // Redirect on success
        } else {
            document.getElementById('error-message').innerText = data.message;
        }
    } catch (error) {
        console.error('Fehler bei der Anfrage:', error);
        document.getElementById('error-message').innerText = 'Ein unerwarteter Fehler ist aufgetreten.';
    }
});