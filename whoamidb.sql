-- phpMyAdmin SQL Dump
-- version 3.5.1
-- http://www.phpmyadmin.net
--
-- Machine: localhost
-- Genereertijd: 04 jun 2013 om 21:27
-- Serverversie: 5.5.24-log
-- PHP-versie: 5.4.3

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Databank: `whoamidb`
--

CREATE DATABASE `whoamidb` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `whoamidb`;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `characters`
--

CREATE TABLE IF NOT EXISTS `characters` (
  `idcharacter` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) DEFAULT NULL,
  `gender` enum('male','female') DEFAULT NULL,
  `human` tinyint(1) DEFAULT NULL,
  `haircolor` enum('blond','brown','black','red','grey') DEFAULT NULL,
  `skincolor` enum('black','brown','white','yellow') DEFAULT NULL,
  `glasses` tinyint(1) DEFAULT NULL,
  `tv` tinyint(1) DEFAULT NULL,
  `author` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`idcharacter`),
  UNIQUE KEY `idcharacter_UNIQUE` (`idcharacter`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;

--
-- Gegevens worden uitgevoerd voor tabel `characters`
--

INSERT INTO `characters` (`idcharacter`, `name`, `gender`, `human`, `haircolor`, `skincolor`, `glasses`, `tv`, `author`) VALUES
(1, 'Jimi Hendrix', 'male', 1, 'black', 'brown', 0, 0, 0),
(2, 'Janis Joplin', 'female', 1, 'brown', 'white', 1, 0, 0),
(3, 'Lassie', 'female', 0, 'brown', 'brown', 0, 1, 0);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
