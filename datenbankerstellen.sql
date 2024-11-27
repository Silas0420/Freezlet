DROP DATABASE IF EXISTS freezlet;

CREATE DATABASE freezlet;

-- Wechsel zur neuen Datenbank
USE freezlet;

-- Tabelle für Unbestätigte Benutzer
CREATE TABLE UnbestaetigterBenutzer (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    benutzername VARCHAR(255) NOT NULL,
    passwort VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    erstellungszeit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabelle für Benutzer
CREATE TABLE Benutzer (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    benutzername VARCHAR(255) NOT NULL UNIQUE,
    passwort VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

-- Tabelle für Ordner
CREATE TABLE Ordner (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    erstellerID INT NOT NULL,
    FOREIGN KEY (erstellerID) REFERENCES Benutzer(ID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabelle für Lernsets
CREATE TABLE Lernset (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    erstellerID INT NOT NULL,
    ordnerID INT,
    titel VARCHAR(255) NOT NULL,
    beschreibung VARCHAR(255),
    FOREIGN KEY (erstellerID) REFERENCES Benutzer(ID) ON DELETE CASCADE,
    FOREIGN KEY (ordnerID) REFERENCES Ordner(ID) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabelle für die Beziehung zwischen Lernsets und Benutzern
CREATE TABLE Lernset2Benutzer (
    benutzerID INT NOT NULL,
    lernsetID INT NOT NULL,
    FOREIGN KEY (benutzerID) REFERENCES Benutzer(ID) ON DELETE CASCADE,
    FOREIGN KEY (lernsetID) REFERENCES Lernset(ID) ON DELETE CASCADE,
    PRIMARY KEY (benutzerID, lernsetID)
) ENGINE=InnoDB;

-- Tabelle für Karten
CREATE TABLE Karte (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    vorderseite TEXT NOT NULL,
    rueckseite TEXT NOT NULL,
    setID INT NOT NULL,
    FOREIGN KEY (setID) REFERENCES Lernset(ID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabelle für Fortschritt
CREATE TABLE Lernstand (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    benutzerID INT NOT NULL,
    kartenID INT NOT NULL,
    lernstand INT DEFAULT 0,
    FOREIGN KEY (benutzerID) REFERENCES Benutzer(ID) ON DELETE CASCADE,
    FOREIGN KEY (kartenID) REFERENCES Karte(ID) ON DELETE CASCADE
) ENGINE=InnoDB;