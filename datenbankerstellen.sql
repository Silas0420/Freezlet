DROP DATABASE IF EXISTS freezlet;

CREATE DATABASE freezlet;

-- Wechsle zur neuen Datenbank
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
    email VARCHAR(255) NOT NULL,
    benutzername VARCHAR(255) NOT NULL,
    passwort VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

-- Tabelle für Lernsets
CREATE TABLE Lernset (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    erstellerID INT,
    FOREIGN KEY (erstellerID) REFERENCES Benutzer(ID) ON DELETE CASCADE,
    titel VARCHAR(255) NOT NULL,
    beschreibung VARCHAR(255)
) ENGINE=InnoDB;

-- Tabelle für die Beziehung zwischen Lernsets und Benutzern
CREATE TABLE Lernset2Benutzer (
    benutzerID INT,
    lernsetID INT,
    FOREIGN KEY (benutzerID) REFERENCES Benutzer(ID) ON DELETE CASCADE,
    FOREIGN KEY (lernsetID) REFERENCES Lernset(ID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabelle für Karten
CREATE TABLE Karte (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    vorderseite TEXT NOT NULL,
    rueckseite TEXT NOT NULL,
    setID INT,
    FOREIGN KEY (setID) REFERENCES Lernset(ID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabelle für Fortschritt
CREATE TABLE Lernstand (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    benutzerID INT,
    kartenID INT,
    lernstand INT DEFAULT 0,
    FOREIGN KEY (benutzerID) REFERENCES Benutzer(ID),
    FOREIGN KEY (kartenID) REFERENCES Karte(ID)
) ENGINE=InnoDB;