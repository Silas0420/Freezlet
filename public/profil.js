document.getElementById('usernamechange').addEventListener('click', function() {
    
});



document.getElementById('delete-account').addEventListener('click', function() {
    if (confirm('Bist du sicher, dass du deinen Account löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.')) {
        alert('Dein Account wurde gelöscht.'); 
        // Hier könnte (falls wir wollen) ein HTTP-Request an das Backend gesendet werden, um den Account tatsächlich zu löschen.
    }
});