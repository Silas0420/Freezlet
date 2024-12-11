    <script>
        // Lade die Navigation aus einer separaten Datei
        document.addEventListener("DOMContentLoaded", () => {
            fetch("navigation.html") // Datei mit der Navigation
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Navigation konnte nicht geladen werden");
                    }
                    return response.text();
                })
                .then((data) => {
                    document.getElementById("navigation-placeholder").innerHTML = data;
                })
                .catch((error) => console.error(error));
        });
    </script>
</body>
</html>
