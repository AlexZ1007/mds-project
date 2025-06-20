-- phpMyAdmin SQL Dump
-- version 4.7.1
-- https://www.phpmyadmin.net/
--
-- Host: sql7.freesqldatabase.com
-- Generation Time: Jun 20, 2025 at 04:27 PM
-- Server version: 5.5.62-0ubuntu0.14.04.1
-- PHP Version: 7.0.33-0ubuntu0.16.04.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sql7782910`
--

-- --------------------------------------------------------

--
-- Table structure for table `Card`
--

CREATE TABLE `Card` (
  `card_id` int(11) NOT NULL,
  `card_name` varchar(100) NOT NULL,
  `description` text,
  `mana_points` int(11) DEFAULT NULL,
  `HP_points` int(11) DEFAULT NULL,
  `damage` int(11) DEFAULT NULL,
  `ability` varchar(255) DEFAULT NULL,
  `card_image` varchar(255) DEFAULT NULL,
  `level` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `Card`
--

INSERT INTO `Card` (`card_id`, `card_name`, `description`, `mana_points`, `HP_points`, `damage`, `ability`, `card_image`, `level`) VALUES
(1, 'Astral Heart', 'Pulses with stellar energy, unleashing a devastating psychic strike', 6, 6, 7, NULL, '/img/astral_heart_L1.jpg', 1),
(2, 'Astral Heart', 'Pulses with stellar energy, unleashing a devastating psychic strike', 6, 7, 8, NULL, '/img/astral_heart_L2.jpg', 2),
(3, 'Astral Heart', 'Pulses with stellar energy, unleashing a devastating psychic strike', 6, 8, 9, NULL, '/img/astral_heart_L3.jpg', 3),
(4, 'The Astronaut', 'Lost in space, but still lands critical cosmic strikes', 5, 6, 5, NULL, '/img/astronaut_L1.jpg', 1),
(5, 'The Astronaut', 'Lost in space, but still lands critical cosmic strikes', 5, 7, 6, NULL, '/img/astronaut_L2.jpg', 2),
(6, 'The Astronaut', 'Lost in space, but still lands critical cosmic strikes', 5, 8, 7, NULL, '/img/astronaut_L3.jpg', 3),
(7, 'The Broom', 'Sweeps foes off their feet - literally and magically, sometimes', 7, 8, 7, NULL, '/img/broom_L1.jpg', 1),
(8, 'The Broom', 'Sweeps foes off their feet - literally and magically, sometimes', 7, 8, 8, NULL, '/img/broom_L2.jpg', 2),
(9, 'The Broom', 'Sweeps foes off their feet - literally and magically, sometimes', 7, 9, 8, NULL, '/img/broom_L3.jpg', 3),
(10, 'The Dragon', 'Wings of flame, breath of doom - classic overkill, stylishly done', 4, 3, 4, NULL, '/img/dragon_L1.jpg', 1),
(11, 'The Dragon', 'Wings of flame, breath of doom - classic overkill, stylishly done', 4, 4, 5, NULL, '/img/dragon_L2.jpg', 2),
(12, 'The Dragon', 'Wings of flame, breath of doom - classic overkill, stylishly done', 4, 5, 6, NULL, '/img/dragon_L3.jpg', 3),
(13, 'Enchanted Book', 'Wispers secrets, curses, and occasional spelling mistakes', 4, 3, 4, NULL, '/img/enchanted_book_L1.jpg', 1),
(14, 'Enchanted Book', 'Wispers secrets, curses, and occasional spelling mistakes', 4, 4, 5, NULL, '/img/enchanted_book_L2.jpg', 2),
(15, 'Enchanted Book', 'Wispers secrets, curses, and occasional spelling mistakes', 4, 5, 6, NULL, '/img/enchanted_book_L3.jpg', 3),
(16, 'Fungal Seer', 'A wise forest dweller - casts spores that weaken enemies and boost nearby allies', 3, 2, 1, NULL, '/img/fungal_seer_L1.jpg', 1),
(17, 'Fungal Seer', 'A wise forest dweller - casts spores that weaken enemies and boost nearby allies', 3, 3, 2, NULL, '/img/fungal_seer_L2.jpg', 2),
(18, 'Fungal Seer', 'A wise forest dweller - casts spores that weaken enemies and boost nearby allies', 3, 4, 3, NULL, '/img/fungal_seer_L3.jpg', 3),
(19, 'The gloomroot', 'Tiny, trippy, and surprisingly explosive under pressure', 3, 2, 4, NULL, '/img/gloomroot_L1.jpg', 1),
(20, 'The gloomroot', 'Tiny, trippy, and surprisingly explosive under pressure', 3, 4, 5, NULL, '/img/gloomroot_L2.jpg', 2),
(21, 'The gloomroot', 'Tiny, trippy, and surprisingly explosive under pressure', 3, 5, 6, NULL, '/img/gloomroot_L3.jpg', 3),
(22, 'The grovewalker', 'A wise forest sage with ancient power - unleashes nature\'s wrath to weaken enemies and heal allies', 5, 5, 5, NULL, '/img/gnomewalker_L1.jpg', 1),
(23, 'The grovewalker', 'A wise forest sage with ancient power - unleashes nature\'s wrath to weaken enemies and heal allies', 5, 7, 6, NULL, '/img/gnomewalker_L2.jpg', 2),
(24, 'The grovewalker', 'A wise forest sage with ancient power - unleashes nature\'s wrath to weaken enemies and heal allies', 5, 8, 7, NULL, '/img/gnomewalker_L3.jpg', 3),
(25, 'Hexpaw Familiar', 'A cunning feline of the arcane arts - casts shadow curses and channel dark energy to hex opponents', 6, 9, 5, NULL, '/img/hexpaw_L1.jpg', 1),
(26, 'Hexpaw Familiar', 'A cunning feline of the arcane arts - casts shadow curses and channel dark energy to hex opponents', 6, 9, 6, NULL, '/img/hexpaw_L2.jpg', 2),
(27, 'Hexpaw Familiar', 'A cunning feline of the arcane arts - casts shadow curses and channel dark energy to hex opponents', 6, 9, 7, NULL, '/img/hexpaw_L3.jpg', 3),
(28, 'The nullcore', 'A pulsating core of void energy - unstable, untamed, unstoppable', 5, 6, 5, NULL, '/img/nullcore_L1.jpg', 1),
(29, 'The nullcore', 'A pulsating core of void energy - unstable, untamed, unstoppable', 5, 6, 6, NULL, '/img/nullcore_L2.jpg', 2),
(30, 'The nullcore', 'A pulsating core of void energy - unstable, untamed, unstoppable', 5, 7, 7, NULL, '/img/nullcore_L3.jpg', 3),
(31, 'The shadowcloak', 'A silent stalker in the dark woods, striking unseen', 2, 2, 2, NULL, '/img/shadowcloak_L1.jpg', 1),
(32, 'The shadowcloak', 'A silent stalker in the dark woods, striking unseen', 2, 4, 3, NULL, '/img/shadowcloak_L2.jpg', 2),
(33, 'The shadowcloak', 'A silent stalker in the dark woods, striking unseen', 2, 6, 4, NULL, '/img/shadowcloak_L3.jpg', 3),
(34, 'Spelltome', 'Pages that write themselves - whispers of forgotten magin echo from within', 3, 4, 3, NULL, '/img/spelltome_L1.jpg', 1),
(35, 'Spelltome', 'Pages that write themselves - whispers of forgotten magin echo from within', 3, 5, 4, NULL, '/img/spelltome_L2.jpg', 2),
(36, 'Spelltome', 'Pages that write themselves - whispers of forgotten magin echo from within', 3, 6, 5, NULL, '/img/spelltome_L3.jpg', 3),
(37, 'The stoneclaw', 'A hulking beast forget from rock and fury - crushes foes with overhelming brute force and earth-shaking attacks', 6, 8, 5, NULL, '/img/stoneclaw_L1.jpg', 1),
(38, 'The stoneclaw', 'A hulking beast forget from rock and fury - crushes foes with overhelming brute force and earth-shaking attacks', 6, 8, 6, NULL, '/img/stoneclaw_L2.jpg', 2),
(39, 'The stoneclaw', 'A hulking beast forget from rock and fury - crushes foes with overhelming brute force and earth-shaking attacks', 6, 9, 7, NULL, '/img/stoneclaw_L3.jpg', 3),
(40, 'Venomenal Snapper', 'A vicious botanical beast that lashes out with toxic bites - poisons enemies and thrives in chaos', 4, 3, 4, NULL, '/img/venomenal_snapper_L1.jpg', 1),
(41, 'Venomenal Snapper', 'A vicious botanical beast that lashes out with toxic bites - poisons enemies and thrives in chaos', 4, 4, 4, NULL, '/img/venomenal_snapper_L2.jpg', 2),
(42, 'Venomenal Snapper', 'A vicious botanical beast that lashes out with toxic bites - poisons enemies and thrives in chaos', 4, 5, 6, NULL, '/img/venomenal_snapper_L3.jpg', 3),
(43, 'The Voidgate', 'A portal to unknown realms - powerful, but perilous', 5, 7, 5, NULL, '/img/voidgate_L1.jpg', 1),
(44, 'The Voidgate', 'A portal to unknown realms - powerful, but perilous', 5, 8, 6, NULL, '/img/voidgate_L2.jpg', 2),
(45, 'The Voidgate', 'A portal to unknown realms - powerful, but perilous', 5, 8, 7, NULL, '/img/voidgate_L3.jpg', 3);

-- --------------------------------------------------------

--
-- Table structure for table `Deck`
--

CREATE TABLE `Deck` (
  `deck_card_id` int(10) NOT NULL,
  `user_id` int(10) DEFAULT NULL,
  `card_id` int(10) DEFAULT NULL,
  `position` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `Deck`
--

INSERT INTO `Deck` (`deck_card_id`, `user_id`, `card_id`, `position`) VALUES
(290, 2, 1, 0),
(291, 2, 1, 1),
(292, 2, 1, 2),
(293, 2, 4, 3),
(294, 2, 4, 4),
(295, 2, 4, 5),
(296, 2, 4, 6),
(297, 2, 4, 7),
(298, 2, 4, 8),
(299, 2, 4, 9),
(300, 2, 4, 10),
(301, 2, 4, 11),
(412, 5, 11, 0),
(413, 5, 13, 1),
(414, 5, 16, 2),
(415, 5, 8, 3),
(416, 5, 6, 4),
(417, 5, 33, 5),
(418, 5, 36, 6),
(419, 5, 37, 7),
(420, 5, 44, 8),
(421, 5, 40, 9),
(422, 5, 38, 10),
(423, 5, 38, 11),
(484, 4, 10, 0),
(485, 4, 7, 1),
(486, 4, 2, 2),
(487, 4, 11, 3),
(488, 4, 17, 4),
(489, 4, 18, 5),
(490, 4, 20, 6),
(491, 4, 20, 7),
(492, 4, 45, 8),
(493, 4, 33, 9),
(494, 4, 28, 10),
(495, 4, 21, 11),
(496, 1, 45, 0),
(497, 1, 45, 1),
(498, 1, 45, 2),
(499, 1, 45, 3),
(500, 1, 24, 4),
(501, 1, 24, 5),
(502, 1, 39, 6),
(503, 1, 33, 7),
(504, 1, 35, 8),
(505, 1, 32, 9),
(506, 1, 32, 10),
(507, 1, 32, 11);

-- --------------------------------------------------------

--
-- Table structure for table `Division`
--

CREATE TABLE `Division` (
  `division_id` int(11) NOT NULL,
  `division_name` varchar(255) NOT NULL,
  `min_elo` int(8) NOT NULL,
  `max_elo` int(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `Division`
--

INSERT INTO `Division` (`division_id`, `division_name`, `min_elo`, `max_elo`) VALUES
(1, 'Bronze', 0, 200),
(2, 'Silver', 201, 400),
(3, 'Gold', 401, 800),
(4, 'Platinum', 801, 1200),
(5, 'Diamond', 1201, 99999);

-- --------------------------------------------------------

--
-- Table structure for table `Friends_Requests`
--

CREATE TABLE `Friends_Requests` (
  `friend_request_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `friend_id` int(11) NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `Friends_Requests`
--

INSERT INTO `Friends_Requests` (`friend_request_id`, `user_id`, `friend_id`, `status`, `created_at`) VALUES
(1, 1, 2, 0, '2025-06-03 18:50:31'),
(2, 5, 1, 1, '2025-06-05 14:13:25'),
(3, 1, 4, 1, '2025-06-05 14:48:25'),
(4, 5, 2, 0, '2025-06-06 20:07:55'),
(5, 5, 4, 1, '2025-06-06 20:08:32'),
(6, 4, 3, 2, '2025-06-06 20:12:14'),
(7, 4, 3, 2, '2025-06-06 20:12:16'),
(8, 4, 3, 1, '2025-06-06 20:12:19'),
(9, 4, 3, 2, '2025-06-06 20:12:19'),
(10, 4, 2, 0, '2025-06-06 20:12:48'),
(11, 1, 3, 1, '2025-06-06 20:14:12'),
(12, 7, 1, 1, '2025-06-08 16:32:32'),
(13, 8, 4, 1, '2025-06-11 18:32:44'),
(14, 5, 7, 1, '2025-06-12 13:06:20');

-- --------------------------------------------------------

--
-- Table structure for table `Game`
--

CREATE TABLE `Game` (
  `game_id` int(11) NOT NULL,
  `winner_id` int(11) NOT NULL,
  `loser_id` int(11) NOT NULL,
  `date_played` datetime NOT NULL,
  `duration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `Shop`
--

CREATE TABLE `Shop` (
  `shop_id` int(11) NOT NULL,
  `seller_id` int(11) DEFAULT NULL,
  `card_id` int(11) NOT NULL,
  `price_listed` int(10) NOT NULL,
  `sold` int(11) NOT NULL,
  `date_listed` datetime NOT NULL,
  `date_sold` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `Shop`
--

INSERT INTO `Shop` (`shop_id`, `seller_id`, `card_id`, `price_listed`, `sold`, `date_listed`, `date_sold`) VALUES
(8, 5, 15, 60, 1, '2025-06-06 00:00:00', '2025-06-06 00:00:00'),
(9, 5, 21, 10, 1, '2025-06-06 20:46:53', '2025-06-06 20:49:30'),
(10, 5, 24, 1, 1, '2025-06-06 21:01:10', '2025-06-06 21:06:50'),
(11, 5, 24, 10, 1, '2025-06-06 21:06:04', '2025-06-06 21:06:52'),
(12, 1, 6, 10, 1, '2025-06-06 21:07:06', '2025-06-06 21:07:34'),
(13, 1, 12, 1, 1, '2025-06-06 21:07:15', '2025-06-06 21:07:32'),
(14, 1, 18, 40, 1, '2025-06-07 11:22:44', '2025-06-12 13:29:12'),
(15, 1, 24, 44, 1, '2025-06-07 11:22:55', '2025-06-08 19:42:39'),
(16, 1, 2, 5, 1, '2025-06-07 11:23:05', '2025-06-07 11:39:41'),
(17, 1, 41, 20, 1, '2025-06-07 11:23:48', '2025-06-08 17:32:10'),
(18, 1, 13, 8, 1, '2025-06-07 11:24:03', '2025-06-07 11:40:19'),
(19, 4, 23, 20, 1, '2025-06-07 11:25:03', '2025-06-12 13:29:20'),
(20, 3, 16, 8, 1, '2025-06-07 11:26:02', '2025-06-07 11:41:20'),
(21, 3, 18, 40, 1, '2025-06-07 11:26:48', '2025-06-07 18:59:00'),
(22, 3, 38, 25, 1, '2025-06-07 11:27:02', '2025-06-08 17:25:45'),
(23, 5, 15, 40, 1, '2025-06-07 11:27:42', '2025-06-08 19:39:30'),
(24, 5, 9, 40, 1, '2025-06-07 11:38:54', '2025-06-08 19:42:29'),
(25, 5, 2, 9, 1, '2025-06-07 11:40:48', '2025-06-07 17:24:40'),
(26, 1, 39, 40, 1, '2025-06-07 11:48:51', '2025-06-08 17:32:07'),
(27, 1, 3, 20, 1, '2025-06-07 17:24:52', '2025-06-08 19:38:57'),
(28, 1, 10, 141, 1, '2025-06-07 18:59:35', '2025-06-11 19:35:00'),
(29, 1, 9, 500, 1, '2025-06-07 18:59:49', '2025-06-12 14:55:33'),
(30, 1, 45, 700, 1, '2025-06-07 19:00:19', '2025-06-12 15:04:10'),
(31, 1, 10, 4, 0, '2025-06-08 17:29:42', '1000-01-01 00:00:00'),
(32, 1, 4, 5, 0, '2025-06-08 19:00:08', '1000-01-01 00:00:00'),
(33, 1, 10, 3, 1, '2025-06-08 19:02:13', '2025-06-08 19:40:06'),
(34, 1, 18, 30, 1, '2025-06-08 19:33:52', '2025-06-12 13:29:11'),
(35, 1, 42, 14, 1, '2025-06-08 19:34:02', '2025-06-12 14:55:42'),
(36, 1, 5, 10, 1, '2025-06-08 19:34:13', '2025-06-12 13:29:27'),
(37, 1, 7, 10, 1, '2025-06-08 19:34:25', '2025-06-12 13:29:31'),
(38, 1, 24, 10, 1, '2025-06-08 19:34:48', '2025-06-12 16:52:12'),
(39, 1, 21, 15, 1, '2025-06-08 19:35:18', '2025-06-08 19:39:53'),
(40, 1, 40, 5, 1, '2025-06-08 19:35:30', '2025-06-08 19:38:51'),
(41, 1, 9, 17, 1, '2025-06-08 19:35:40', '2025-06-08 19:39:55'),
(42, 1, 35, 16, 1, '2025-06-08 19:37:30', '2025-06-12 13:29:15'),
(43, 1, 6, 6, 1, '2025-06-08 19:42:33', '2025-06-12 13:29:22'),
(44, 1, 3, 10, 1, '2025-06-08 19:42:40', '2025-06-12 13:29:25'),
(45, 1, 12, 15, 1, '2025-06-08 19:42:49', '2025-06-12 16:52:08'),
(46, 1, 16, 15, 1, '2025-06-08 19:42:59', '2025-06-08 19:45:13'),
(47, 1, 23, 10, 1, '2025-06-08 19:43:06', '2025-06-12 14:55:34'),
(48, 1, 29, 10, 1, '2025-06-08 19:43:14', '2025-06-12 14:55:37'),
(49, 1, 30, 100, 1, '2025-06-08 19:43:23', '2025-06-12 13:29:14'),
(50, 6, 4, 9, 1, '2025-06-08 19:43:25', '2025-06-12 14:55:31'),
(51, 6, 24, 66, 1, '2025-06-08 19:43:37', '2025-06-12 14:48:39'),
(52, 1, 41, 20, 1, '2025-06-08 19:43:56', '2025-06-12 13:29:18'),
(53, 6, 30, 60, 1, '2025-06-08 19:43:57', '2025-06-12 14:48:41'),
(54, 6, 11, 20, 1, '2025-06-08 19:44:06', '2025-06-08 19:45:12'),
(55, 1, 38, 30, 1, '2025-06-08 19:44:09', '2025-06-08 19:45:11'),
(56, 6, 18, 44, 1, '2025-06-08 19:44:12', '2025-06-08 19:45:10'),
(57, 6, 38, 20, 1, '2025-06-08 19:44:28', '2025-06-08 19:45:12'),
(58, 1, 26, 20, 1, '2025-06-08 19:44:38', '2025-06-08 19:45:08'),
(59, 5, 5, 15, 1, '2025-06-08 19:45:38', '2025-06-12 13:29:08'),
(60, 5, 1, 10, 0, '2025-06-08 19:45:48', '1000-01-01 00:00:00'),
(61, 5, 2, 20, 1, '2025-06-08 19:45:54', '2025-06-11 19:34:57'),
(62, 5, 3, 30, 1, '2025-06-08 19:45:59', '2025-06-12 13:29:24'),
(63, 5, 44, 20, 1, '2025-06-08 19:46:09', '2025-06-12 13:29:17'),
(64, 1, 15, 30, 1, '2025-06-08 20:07:21', '2025-06-12 16:52:10'),
(65, 1, 20, 5, 1, '2025-06-08 20:32:26', '2025-06-12 14:55:36'),
(66, 4, 36, 15, 1, '2025-06-11 19:35:21', '2025-06-12 14:55:38'),
(67, 1, 28, 10, 1, '2025-06-12 13:27:22', '2025-06-12 16:52:16'),
(68, 1, 19, 10, 1, '2025-06-12 13:27:36', '2025-06-12 16:52:13'),
(69, 1, 30, 15, 1, '2025-06-12 13:27:45', '2025-06-12 16:52:18'),
(70, 1, 35, 20, 1, '2025-06-12 13:27:55', '2025-06-12 15:04:07'),
(71, 1, 39, 45, 1, '2025-06-12 13:28:07', '2025-06-12 14:56:06'),
(72, 7, 7, 15, 1, '2025-06-12 13:30:51', '2025-06-12 14:55:50'),
(73, 1, 28, 14, 1, '2025-06-12 13:35:34', '2025-06-12 16:52:16'),
(74, 1, 9, 45, 0, '2025-06-12 13:35:41', '1000-01-01 00:00:00'),
(75, 1, 14, 20, 0, '2025-06-12 13:35:49', '1000-01-01 00:00:00'),
(76, 1, 37, 20, 1, '2025-06-12 13:35:58', '2025-06-12 14:56:06'),
(77, 1, 19, 10, 1, '2025-06-12 13:36:04', '2025-06-12 14:55:59'),
(78, 1, 43, 15, 1, '2025-06-12 14:48:49', '2025-06-12 14:55:41'),
(79, 1, 35, 20, 1, '2025-06-12 14:54:21', '2025-06-12 14:55:39'),
(80, 1, 13, 20, 1, '2025-06-12 14:54:29', '2025-06-12 14:55:47'),
(81, 1, 12, 30, 1, '2025-06-12 14:54:36', '2025-06-12 14:55:48'),
(82, 1, 18, 25, 1, '2025-06-12 14:54:43', '2025-06-12 16:52:14'),
(83, 1, 20, 10, 1, '2025-06-12 14:54:54', '2025-06-12 14:55:35'),
(84, 5, 39, 22, 1, '2025-06-12 14:56:23', '2025-06-12 15:03:30'),
(85, 1, 12, 31, 0, '2025-06-12 15:03:23', '1000-01-01 00:00:00'),
(86, 1, 39, 44, 1, '2025-06-12 15:03:40', '2025-06-12 15:04:01'),
(87, 7, 27, 23, 1, '2025-06-12 15:13:38', '2025-06-12 16:11:44'),
(88, 7, 29, 14, 1, '2025-06-12 15:13:46', '2025-06-13 11:14:16'),
(89, 1, 35, 15, 0, '2025-06-12 16:11:38', '1000-01-01 00:00:00'),
(90, 1, 12, 25, 1, '2025-06-12 16:26:37', '2025-06-12 16:52:08'),
(91, 1, 14, 17, 0, '2025-06-12 16:26:44', '1000-01-01 00:00:00'),
(92, 1, 15, 27, 0, '2025-06-12 16:26:51', '1000-01-01 00:00:00'),
(93, 1, 20, 14, 1, '2025-06-12 16:26:59', '2025-06-12 16:52:11'),
(94, 1, 2, 11, 1, '2025-06-12 16:27:04', '2025-06-12 16:52:06'),
(95, 7, 15, 15, 1, '2025-06-12 16:52:36', '2025-06-13 11:14:22'),
(96, 7, 3, 13, 1, '2025-06-12 16:52:44', '2025-06-13 11:14:27'),
(97, 7, 6, 15, 1, '2025-06-12 16:52:51', '2025-06-13 11:14:30'),
(98, 7, 8, 15, 1, '2025-06-12 16:53:01', '2025-06-13 11:14:32'),
(99, 7, 42, 25, 1, '2025-06-12 16:53:08', '2025-06-13 11:14:34'),
(100, 1, 30, 17, 0, '2025-06-13 11:13:12', '1000-01-01 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `User`
--

CREATE TABLE `User` (
  `user_id` int(11) NOT NULL,
  `nickname` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `balance` int(11) DEFAULT '100',
  `matches_won` int(11) DEFAULT '0',
  `matches_played` int(11) DEFAULT '0',
  `division_id` int(11) NOT NULL,
  `elo` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `User`
--

INSERT INTO `User` (`user_id`, `nickname`, `password`, `email`, `balance`, `matches_won`, `matches_played`, `division_id`, `elo`) VALUES
(1, 'da', '$2b$10$VtgZku9FrTBchK7V3TUGg.Qh0dnV9cZt1Y4lprg/T.p1o.mL8ui2u', 'da', 103902, 21, 32, 2, 300),
(2, 'mirunix11', '$2b$10$kSa9ACtVqWnPQBp2sa9BYuIEQljV7LzBIOZfeRT8k8pDGv74LCFfy', 'miruna@gmail.com', 10000, 0, 0, 1, 0),
(3, 'test1', '$2b$10$sgybvitJ/ZRTnaioOvN8/OKO9JfTsrfMro07DNwhCoLlO/unndQbe', 'test@gmi.com', 10000, 0, 0, 1, 0),
(4, 'test', '$2b$10$DY9rDXzkysO1kpXhmr9jnOR/XC.ecn4e4bp8ft85yaLWOQXuUmPRm', 'test@g.com', 11844, 10, 30, 1, 90),
(5, 'nu', '$2b$10$I2Jq1kykIJU/vylcZFpfZeLl6O1GCp88RPojGmW7Qhpw5dn/v0SV.', 'nu', 9190, 0, 0, 1, 0),
(6, 'username', '$2b$10$9B.j4SrfhQchV6TQfUqyAOWEsNjpmv0ZTxWh9zNL9zJvvdAjzhyg6', 'email', 10035, 0, 0, 1, 0),
(7, 'test_alex', '$2b$10$fD3uB7VE7V8aWUzXCvd1.O1KJfFxGkO7TArbLbjNGn0dPaZxWwtCu', 'test_alex@test.com', 8805, 0, 0, 1, 0),
(8, 'alex', '$2b$10$HYZIfEOCK4TjeK3erd17IuTOOD50l449/9jkcqdlwYT7s1ibIjoea', 'alex@gmail.com', 100, 0, 0, 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `User_Cards`
--

CREATE TABLE `User_Cards` (
  `user_id` int(11) NOT NULL DEFAULT '0',
  `card_id` int(11) NOT NULL DEFAULT '0',
  `card_count` int(11) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `User_Cards`
--

INSERT INTO `User_Cards` (`user_id`, `card_id`, `card_count`) VALUES
(1, 1, 0),
(1, 2, 0),
(1, 3, 1),
(1, 4, 0),
(1, 5, 0),
(1, 6, 2),
(1, 7, 0),
(1, 8, 1),
(1, 9, 0),
(1, 10, 0),
(1, 11, 1),
(1, 12, 0),
(1, 13, 0),
(1, 14, 2),
(1, 15, 3),
(1, 16, 0),
(1, 17, 0),
(1, 18, 5),
(1, 19, 0),
(1, 20, 0),
(1, 21, 0),
(1, 22, 0),
(1, 23, 0),
(1, 24, 7),
(1, 25, 1),
(1, 26, 0),
(1, 27, 1),
(1, 28, 1),
(1, 29, 1),
(1, 30, 1),
(1, 31, 3),
(1, 32, 3),
(1, 33, 2),
(1, 34, 0),
(1, 35, 1),
(1, 36, 1),
(1, 37, 2),
(1, 38, 0),
(1, 39, 4),
(1, 40, 0),
(1, 41, 0),
(1, 42, 1),
(1, 43, 0),
(1, 44, 1),
(1, 45, 4),
(2, 1, 2),
(2, 4, 1),
(2, 6, 1),
(2, 17, 1),
(2, 24, 1),
(2, 25, 1),
(2, 29, 1),
(2, 30, 1),
(2, 34, 2),
(2, 36, 1),
(2, 41, 1),
(3, 13, 1),
(3, 16, 1),
(3, 17, 1),
(3, 18, 0),
(3, 38, 0),
(3, 43, 1),
(4, 2, 1),
(4, 3, 1),
(4, 7, 1),
(4, 10, 1),
(4, 11, 1),
(4, 16, 0),
(4, 17, 2),
(4, 18, 1),
(4, 20, 2),
(4, 21, 1),
(4, 23, 0),
(4, 28, 1),
(4, 33, 1),
(4, 36, 0),
(4, 45, 1),
(5, 1, 0),
(5, 2, 0),
(5, 3, 0),
(5, 4, 1),
(5, 5, 1),
(5, 6, 1),
(5, 7, 1),
(5, 8, 1),
(5, 9, 1),
(5, 11, 1),
(5, 12, 2),
(5, 13, 2),
(5, 15, 0),
(5, 16, 1),
(5, 18, 1),
(5, 19, 1),
(5, 20, 3),
(5, 21, 0),
(5, 23, 2),
(5, 24, 0),
(5, 25, 0),
(5, 26, 0),
(5, 27, 1),
(5, 29, 2),
(5, 31, 1),
(5, 32, 0),
(5, 33, 1),
(5, 35, 1),
(5, 36, 2),
(5, 37, 2),
(5, 38, 2),
(5, 39, 0),
(5, 40, 1),
(5, 42, 1),
(5, 43, 1),
(5, 44, 1),
(6, 3, 1),
(6, 4, 1),
(6, 5, 1),
(6, 9, 2),
(6, 10, 1),
(6, 11, 0),
(6, 13, 1),
(6, 15, 1),
(6, 18, 1),
(6, 21, 1),
(6, 24, 1),
(6, 28, 1),
(6, 30, 1),
(6, 35, 1),
(6, 38, 1),
(6, 40, 1),
(6, 41, 1),
(7, 2, 1),
(7, 3, 1),
(7, 5, 0),
(7, 6, 1),
(7, 7, 0),
(7, 8, 0),
(7, 10, 1),
(7, 12, 2),
(7, 15, 1),
(7, 16, 1),
(7, 18, 3),
(7, 19, 1),
(7, 20, 1),
(7, 22, 1),
(7, 23, 2),
(7, 24, 1),
(7, 27, 0),
(7, 28, 2),
(7, 29, 0),
(7, 30, 2),
(7, 35, 2),
(7, 39, 2),
(7, 41, 0),
(7, 42, 0),
(7, 44, 1),
(7, 45, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Card`
--
ALTER TABLE `Card`
  ADD PRIMARY KEY (`card_id`);

--
-- Indexes for table `Deck`
--
ALTER TABLE `Deck`
  ADD PRIMARY KEY (`deck_card_id`),
  ADD KEY `fk_user` (`user_id`),
  ADD KEY `fk_card` (`card_id`);

--
-- Indexes for table `Division`
--
ALTER TABLE `Division`
  ADD PRIMARY KEY (`division_id`);

--
-- Indexes for table `Friends_Requests`
--
ALTER TABLE `Friends_Requests`
  ADD PRIMARY KEY (`friend_request_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `friend_id` (`friend_id`);

--
-- Indexes for table `Game`
--
ALTER TABLE `Game`
  ADD PRIMARY KEY (`game_id`),
  ADD KEY `winner_id` (`winner_id`),
  ADD KEY `loser_id` (`loser_id`);

--
-- Indexes for table `Shop`
--
ALTER TABLE `Shop`
  ADD PRIMARY KEY (`shop_id`),
  ADD KEY `seller_ID` (`seller_id`),
  ADD KEY `card_id` (`card_id`);

--
-- Indexes for table `User`
--
ALTER TABLE `User`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `nickname` (`nickname`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `division_id` (`division_id`);

--
-- Indexes for table `User_Cards`
--
ALTER TABLE `User_Cards`
  ADD PRIMARY KEY (`user_id`,`card_id`),
  ADD KEY `card_id` (`card_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Card`
--
ALTER TABLE `Card`
  MODIFY `card_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;
--
-- AUTO_INCREMENT for table `Deck`
--
ALTER TABLE `Deck`
  MODIFY `deck_card_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=508;
--
-- AUTO_INCREMENT for table `Division`
--
ALTER TABLE `Division`
  MODIFY `division_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT for table `Friends_Requests`
--
ALTER TABLE `Friends_Requests`
  MODIFY `friend_request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;
--
-- AUTO_INCREMENT for table `Game`
--
ALTER TABLE `Game`
  MODIFY `game_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `Shop`
--
ALTER TABLE `Shop`
  MODIFY `shop_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;
--
-- AUTO_INCREMENT for table `User`
--
ALTER TABLE `User`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `Deck`
--
ALTER TABLE `Deck`
  ADD CONSTRAINT `fk_card` FOREIGN KEY (`card_id`) REFERENCES `Card` (`card_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `Friends_Requests`
--
ALTER TABLE `Friends_Requests`
  ADD CONSTRAINT `Friends_Requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Friends_Requests_ibfk_2` FOREIGN KEY (`friend_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `Game`
--
ALTER TABLE `Game`
  ADD CONSTRAINT `fk_game_l` FOREIGN KEY (`loser_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_game_w` FOREIGN KEY (`winner_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `Shop`
--
ALTER TABLE `Shop`
  ADD CONSTRAINT `Shop_ibfk_1` FOREIGN KEY (`seller_ID`) REFERENCES `User` (`user_id`),
  ADD CONSTRAINT `Shop_ibfk_3` FOREIGN KEY (`card_id`) REFERENCES `Card` (`card_id`);

--
-- Constraints for table `User`
--
ALTER TABLE `User`
  ADD CONSTRAINT `User_ibfk_1` FOREIGN KEY (`division_id`) REFERENCES `Division` (`division_id`);

--
-- Constraints for table `User_Cards`
--
ALTER TABLE `User_Cards`
  ADD CONSTRAINT `User_Cards_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `User_Cards_ibfk_2` FOREIGN KEY (`card_id`) REFERENCES `Card` (`card_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
