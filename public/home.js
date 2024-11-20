// Ein-/Ausblenden 
function toggleMenu() {
    const menu = document.getElementById('menu'); // Menü-Element holen
    if (menu.style.display === 'block') {
        menu.style.display = 'none'; // Menü ausblenden
    } else {
        menu.style.display = 'block'; // Menü anzeigen
    }
}
