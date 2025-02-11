-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 11-02-2025 a las 18:51:04
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `whatsapp2425`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grups`
--

CREATE TABLE `grups` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `descripcio` text DEFAULT NULL,
  `data_creacio` datetime NOT NULL DEFAULT current_timestamp(),
  `creador_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `grups`
--

INSERT INTO `grups` (`id`, `nom`, `descripcio`, `data_creacio`, `creador_id`) VALUES
(1, 'Grup Amics', 'Un grup per xatejar amb amics', '2025-01-27 16:06:23', NULL),
(2, 'Grup Projecte', 'Grup per col·laborar en projectes', '2025-01-27 16:06:23', NULL),
(3, 'Grup prova', 'prova', '2025-01-27 16:08:15', NULL),
(4, 'hola', 'hola', '2025-01-27 16:14:55', NULL),
(5, 'prova admin', 'Descripción del nuevo grupo', '2025-01-30 18:07:12', NULL),
(6, 'a', 'ab', '2025-01-31 18:58:49', 5),
(7, 'b', 'bb', '2025-01-31 19:00:07', 5),
(8, 'jo', 'jo', '2025-02-06 18:42:52', NULL),
(9, 'tu', 'tu', '2025-02-06 19:43:28', 0),
(10, 'tu', 'tu', '2025-02-06 19:44:54', 0),
(11, 'tu', 'tu', '2025-02-06 19:48:39', 0),
(12, 'tu', 'tu', '2025-02-06 20:02:54', NULL),
(13, 'jjjjjjjjjjjjjjjjjjjj', '', '2025-02-10 16:31:43', NULL),
(14, 'aaaaaaaaaaaaaaaaaa', '', '2025-02-10 16:58:48', NULL),
(15, 'aaaaaaaaaaaaaaaaaa', '', '2025-02-10 18:21:55', NULL),
(16, 'aaaaaaaaaaaaaaaaaa', '', '2025-02-10 18:40:17', NULL),
(17, 'aaaaaaaaaaaaaaaaaa', '', '2025-02-10 18:47:22', NULL),
(18, 'aaaaaaaaaaaaaaaaaa', '', '2025-02-10 18:51:16', NULL),
(19, 'jjjjjjjjjjjjjjjjjjjj', '', '2025-02-10 20:26:43', NULL),
(20, 'ggggg', 'ggggg', '2025-02-10 20:45:47', NULL),
(21, 'jo', 'vvvvvvvvv', '2025-02-10 20:46:14', NULL),
(22, 'aaaaaaaaaaaaaaaaaa', '', '2025-02-11 17:49:14', NULL),
(23, 'aaaaaaaaaaaaaaaaaa', '', '2025-02-11 17:52:40', NULL),
(24, 'aaaaaaaaaaaaaaaaaa', ',k,', '2025-02-11 17:52:51', NULL),
(25, 'aaaaaaaaaaaaaaaaaa', '', '2025-02-11 17:54:15', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `missatgesamics`
--

CREATE TABLE `missatgesamics` (
  `id` int(11) NOT NULL,
  `emisor` int(11) NOT NULL,
  `receptor` int(11) NOT NULL,
  `missatge` text NOT NULL,
  `data_hora` datetime NOT NULL DEFAULT current_timestamp(),
  `estat` varchar(10) DEFAULT 'enviat'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `missatgesamics`
--

INSERT INTO `missatgesamics` (`id`, `emisor`, `receptor`, `missatge`, `data_hora`, `estat`) VALUES
(1, 1, 2, 'Hola! Com estàs?', '2025-01-27 15:34:42', 'enviat'),
(2, 2, 1, 'Bé! I tu?', '2025-01-27 15:34:42', 'enviat'),
(3, 1, 2, 'Perfecte, gràcies!', '2025-01-27 15:34:42', 'enviat'),
(4, 1, 2, 'Hola, ¿cómo estás?', '2025-01-27 15:55:32', 'enviat'),
(5, 1, 2, 'Hola! Com estàs?', '2025-01-27 16:48:40', 'enviat'),
(6, 2, 1, 'Bé, gràcies! I tu?', '2025-01-27 16:48:40', 'rebut'),
(7, 1, 2, 'Tot perfecte!', '2025-01-27 16:48:40', 'llegit'),
(12, 5, 3, 'Hola', '2025-02-06 17:24:32', 'enviat'),
(22, 5, 3, 'Hola', '2025-02-06 17:24:32', 'enviat'),
(24, 3, 5, 'adeu', '2025-02-06 18:07:30', 'enviat'),
(25, 5, 3, 'hola', '2025-02-10 18:16:25', 'enviat'),
(26, 5, 14, 'hola', '2025-02-10 18:19:02', 'enviat'),
(27, 5, 1, 'hola', '2025-02-10 18:21:44', 'enviat'),
(28, 5, 3, 'hola', '2025-02-10 18:33:43', 'enviat'),
(29, 5, 1, 'hola', '2025-02-10 18:33:48', 'enviat'),
(30, 5, 3, 'hola', '2025-02-10 18:39:05', 'enviat'),
(31, 5, 3, 'adeu', '2025-02-10 18:39:14', 'enviat'),
(32, 5, 3, 'ye', '2025-02-10 18:39:51', 'enviat'),
(33, 5, 3, 'ey', '2025-02-10 18:48:08', 'enviat'),
(34, 5, 3, 'adeu', '2025-02-10 18:49:11', 'enviat'),
(35, 5, 11, 'hola', '2025-02-10 18:59:35', 'enviat'),
(36, 5, 20, 'adeu', '2025-02-10 19:04:40', 'enviat'),
(37, 5, 3, 'ei', '2025-02-10 19:45:57', 'enviat'),
(38, 5, 6, 'adeu', '2025-02-10 20:34:18', 'enviat'),
(39, 5, 6, 'ey', '2025-02-10 20:38:01', 'enviat'),
(40, 5, 3, 's', '2025-02-11 16:48:06', 'enviat');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarisclase`
--

CREATE TABLE `usuarisclase` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarisclase`
--

INSERT INTO `usuarisclase` (`id`, `username`, `password`) VALUES
(0, 'user1', 'scrypt:32768:8:1$WEPJFaJjJwPpKXJc$85f45fef7d073181d4993f80178e373349a0c55e791679c7ce00ce2da2612f7cd57ebf437d6cd97f01fc35c6fdaad9197e9bd0d638092c7a59b528074619b69e'),
(1, 'user2', 'scrypt:32768:8:1$YkMZtFeB6CbOWKqm$f09c184d74e48f073c571d45b3efdc42c9570a0b900ec01a4c7eedd7586f4cf2d1a25ea0b24e5ee7f9c869e8c0aee83d5827e30febfdf728df7e71a78375f06b'),
(2, 'user3', 'scrypt:32768:8:1$hTJjwKlJeCthi8up$d86c17cc6169b55eaa1ebbe5ae9f67faabee7a605edf73420722863bb083b194738cde65b2ef96b20c792021313f0bfa7875133106b84e95b88b6a14a4804738'),
(3, 'alanadrianadamski', 'scrypt:32768:8:1$oNRsuQqlApQIS44G$d3662de915ee2be9a1271a418404160dae4e5ffa63f053e90302a91f65dc5e1f3d6c6be84f1692bb4244a870ca830a8617bf553663b9c3c52eaede0a764dfd9c'),
(4, 'matiasianbastero', 'scrypt:32768:8:1$WBC6y0Zy2dIIZU9s$0754ab9a425c76e82d29742df5da748cd7cee07b28c703d3891547d882679c4cb73dc237034d6f5b3c1e5518a97f33c30491b4e065f25e02e611eb66e0fbc26b'),
(5, 'jaumebauza', 'scrypt:32768:8:1$wp0IeOyeoGKcJMWs$f90d1c2fa8750b5a2f7d9c5cb66b0d8731be1817dc36c04e5b56ca2eb3c8adbfda26df76bd8a54dbda761bd2b88f7f8e87eba4543a830f8ccb576a4045ffa00e'),
(6, 'cristofolcomas', 'scrypt:32768:8:1$Al7giKfi0PxzIHOr$8c85322fc734de61d50c95387055cf431993321b0f7f5f49ddbff2f59f9209d6e04bb7ffe8e1740842460d8bd5f19c150fb06525c5e845c39846963ec3e65258'),
(7, 'marccorcoles', 'scrypt:32768:8:1$45w7i250F8em2LOH$e31f09d5d2f3854c194a03b51fd0e1d27c4144e916b8e392fc98608d2cf26f3d7e7a192b0e0e8e294bdbadbbd0f0cfc29a4a44fb0e10ad8e19031058ed5f9321'),
(8, 'joancortes', 'scrypt:32768:8:1$xjfkMTQUJDiqGwl3$72cf0a680b1a0bf27a05f4168f639ebc39a0b354fa0aac9843ccf7313db39f007f6f2481b42271f64ddea790151f7f72e4223272db1393d98c81998218e1ceb0'),
(9, 'paucortes1', 'scrypt:32768:8:1$m2fpq3SiDbEM7Wqc$07e9f2d62850cf39516e5ce6978c98143460b8cfb51bc5147b9fdc0883a7d4aac3cfac00eeab2f2608e43b1ab74cf44ad185838cc7c842ab4abdb93eb0c3ea45'),
(10, 'rubenespinar', 'scrypt:32768:8:1$ItKEBt7nwWfvQbyU$e322876e746b1cc0c8739d9a6434dd42103ef2731d73a0cff40f24f6b6b08033b1f792cf8af6859f8843399e16bfdf7e2abfa84a03761a0c3c98f9fa1e9e8820'),
(11, 'miquelgarcia', 'scrypt:32768:8:1$rxOOJJZjtrEeL8sq$35e7354151a9eef3f9d0798e3dcd33669ee21be58c77a2ff801163a5a3b0969ad9176e6e88c0956d71555820a3db0c9d297af6d88e2394e62713806b7082bb0b'),
(12, 'helenagoncalves', 'scrypt:32768:8:1$8MxcDlxAy6VOFIsF$700dee872ef54dcc1db0f3931b6211d111b51d266177a846bd753535d6e3813f13560b62e497e53c5e891ae03d04fb878a92d5ff50e28279df1f44c797429800'),
(13, 'manuelguerrero', 'scrypt:32768:8:1$1xzF1gvSc2rowI7d$70fbe80fa969ff9ef038394aa357f535ad68950cb638ae3584ebd3e45750c404bd64c977b5daefad894f01f709fe8ebcd042245ed4d4b1fa7892522bac9d4506'),
(14, 'virginiajimenez', 'scrypt:32768:8:1$GSjthG0gZio6gDGj$1835fc4d67ccbc7641bb528451d530f1e87d647dbdadaeec68883422e1103363787139ce3c45e9a8427df5b1090cd27449105068a3c9abf65057db7a65abafd5'),
(15, 'cristinalopez', 'scrypt:32768:8:1$JeqIZ3AS9xNnxFyY$72ede924802cc937ef8ef08f1583b9f61d20510943e8ae6be67fa986f721a466ee4fdd1b05e0359f0bab24721111096b920fb20047d58dbf8da4d18611bf9f9d'),
(16, 'ivanmartin', 'scrypt:32768:8:1$DPVYV0vIZID9y6O6$b718e9d6dddccbd220b218196f33cef51cb21825e4bebab777b8b7a0c7cbc10e4a2f6557579f723bf08e7c6de9b5076de8501f8c4ab4a212e746a68235ed83d2'),
(17, 'bartomeumoya', 'scrypt:32768:8:1$YJOXf2RTFpr1feEL$00d550324260bc0f1264320c7c21ad20b693091411c653cc0f7bb641b3eaa432a676db4f0bc811eb2cba29a85cba192f54e88e82e821e57609e48bb863dc4914'),
(18, 'facundonastasi', 'scrypt:32768:8:1$WTPabZLLRZwf4ozJ$e463658a55ec45782bbacc24a4b35272f6bc017af60fe20e6ecac8d6d431a4da4901f340f2535f0a55ec8ccfb08231cc75275fe6112dc1269a06f868d186e4a7'),
(19, 'tomaspayeras', 'scrypt:32768:8:1$PDTxAfneCIFfgoTw$3388d5ac4a28a5a92bf83b1154ef7e0b3428d62ce675a1bc7effa5fd9f293a6bbf3278ba897240bf7ef5f5df9dcb3c359d6df941644621dcfb38bf0768a6c0a7'),
(20, 'danielramon', 'scrypt:32768:8:1$4j9IHKNTZJ5g4gmV$ad765fec3b1e29be5943e6025936ebce50b1bd0e78b2f23fbe2dc0d8325594034637749d0e4c2b45e53172e724b0e8bf16c5c5cff30eeb667d27e63ccb6759d3'),
(21, 'mariaelenarivilla', 'scrypt:32768:8:1$mFhpsoDYIPdmH6bh$e7e4cf76a6b4a277882552f62b6116bc321230554db17ca3ead1070bea4b5db8a715d9ff1993de77448c92c16945ce4ca1fa17ea661a980b4827184d237ceb10'),
(22, 'tomasruiz', 'scrypt:32768:8:1$lPU6ExP9GDdbSxGm$cc97208d77a25caef81444489c38dc893f22af9d52af7dc6c2e974b359d960c0cd492d946236ee082cf33061bb7e2e88f10bf76f868dcbcef654605d0f07222e'),
(23, 'hernanmeliveosandoval', 'scrypt:32768:8:1$Jj2VmxoAshxbnkln$c6974bd5d00e015121d45878f88108281f4d43c1c2fab4c1759a7ca467e6d4bf23716475ae16dc1a133a691fbad20f4f676f1029fb7033ae4e006fa7690137e1'),
(24, 'pereserra', 'scrypt:32768:8:1$DwbISHmY3dECGNbD$233424e703c59369948e69a3b5353a4e71526b39d718031c1be9b03a6ae95dc6755e8e70662d0a5ad6b3cf12f542b4426eefd860bee9fcf49abafd9bde6ab9d3'),
(25, 'sergitomas', 'scrypt:32768:8:1$g3ebvcvG9kavQzFc$05146c167966305c75a8196f13dc7c5504a7491cbd7f1333e41bd66421ec0110f806a77fbc23e7466fa4366de4c6fc81c269e63a17e68fe1facf4b87ffd2fa18'),
(26, 'joanvicens', 'scrypt:32768:8:1$0RKG9sGcO7zed6Zg$74790cfbe32c1705d6c1ad8f2e0a91fc7a135fffc5ebe36d7f75e8c343d755787f53700332e3d5f1e07c1a6132932296e628f2f22ccb02557f0dfb58422ac61e'),
(27, 'yukhangwong', 'scrypt:32768:8:1$bOcaeA1ZRFGmCrqT$a51dbdcf5738fd15c7ceaf5c7bafe3d1ad84fb3aaeae35667c694a1e8d8188cc58b9581992e5f503edf813916a227a7709e9148cf5c9f38e42e28892730ebc0d');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuaris_grups`
--

CREATE TABLE `usuaris_grups` (
  `id` int(11) NOT NULL,
  `id_grup` int(11) NOT NULL,
  `id_usuari` int(11) NOT NULL,
  `data_inici` datetime NOT NULL DEFAULT current_timestamp(),
  `usuari_id` int(11) DEFAULT NULL,
  `grup_id` int(11) DEFAULT NULL,
  `es_admin` tinyint(1) DEFAULT 0,
  `usuari_afegeix_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuaris_grups`
--

INSERT INTO `usuaris_grups` (`id`, `id_grup`, `id_usuari`, `data_inici`, `usuari_id`, `grup_id`, `es_admin`, `usuari_afegeix_id`) VALUES
(2, 2, 6, '2025-01-28 11:30:00', NULL, NULL, 0, NULL),
(3, 1, 7, '2025-01-29 09:00:00', NULL, NULL, 0, NULL),
(4, 3, 8, '2025-01-29 15:45:00', NULL, NULL, 0, NULL),
(11, 1, 3, '2025-01-30 18:00:59', NULL, NULL, 0, NULL),
(12, 6, 5, '2025-01-31 18:58:49', NULL, NULL, 1, NULL),
(14, 7, 3, '2025-01-31 19:08:39', NULL, NULL, 0, 5),
(15, 7, 24, '2025-01-31 19:41:37', NULL, NULL, 0, 5),
(16, 7, 2, '2025-01-31 19:45:26', NULL, NULL, 0, 5),
(17, 9, 0, '2025-02-06 19:43:28', NULL, NULL, 1, NULL),
(18, 10, 0, '2025-02-06 19:44:54', NULL, NULL, 1, NULL),
(19, 11, 0, '2025-02-06 19:48:39', NULL, NULL, 1, NULL),
(21, 12, 26, '2025-02-07 18:15:22', NULL, NULL, 0, NULL),
(22, 12, 3, '2025-02-07 18:30:59', NULL, NULL, 0, NULL),
(23, 12, 20, '2025-02-07 18:31:21', NULL, NULL, 0, NULL),
(24, 12, 0, '2025-02-07 20:33:39', NULL, NULL, 0, NULL),
(25, 12, 1, '2025-02-07 20:38:14', NULL, NULL, 0, NULL),
(26, 7, 0, '2025-02-10 16:14:25', NULL, NULL, 0, NULL),
(27, 7, 10, '2025-02-10 16:27:15', NULL, NULL, 0, NULL),
(28, 6, 0, '2025-02-10 16:45:48', NULL, NULL, 0, NULL),
(30, 14, 0, '2025-02-10 16:58:58', NULL, NULL, 0, NULL),
(31, 6, 1, '2025-02-10 18:40:02', NULL, NULL, 0, NULL),
(34, 6, 2, '2025-02-10 18:51:02', NULL, NULL, 0, NULL),
(36, 19, 5, '2025-02-10 20:26:43', NULL, NULL, 1, NULL),
(37, 6, 3, '2025-02-10 20:33:43', NULL, NULL, 0, NULL),
(40, 19, 0, '2025-02-11 16:27:13', NULL, NULL, 0, NULL),
(41, 19, 1, '2025-02-11 16:27:19', NULL, NULL, 0, NULL),
(44, 25, 5, '2025-02-11 17:54:15', NULL, NULL, 1, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `grups`
--
ALTER TABLE `grups`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `missatgesamics`
--
ALTER TABLE `missatgesamics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_emisor` (`emisor`),
  ADD KEY `fk_receptor` (`receptor`);

--
-- Indices de la tabla `usuarisclase`
--
ALTER TABLE `usuarisclase`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuaris_grups`
--
ALTER TABLE `usuaris_grups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_grup` (`id_grup`),
  ADD KEY `id_usuari` (`id_usuari`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `grups`
--
ALTER TABLE `grups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `missatgesamics`
--
ALTER TABLE `missatgesamics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `usuaris_grups`
--
ALTER TABLE `usuaris_grups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `missatgesamics`
--
ALTER TABLE `missatgesamics`
  ADD CONSTRAINT `fk_emisor` FOREIGN KEY (`emisor`) REFERENCES `usuarisclase` (`id`),
  ADD CONSTRAINT `fk_receptor` FOREIGN KEY (`receptor`) REFERENCES `usuarisclase` (`id`);

--
-- Filtros para la tabla `usuaris_grups`
--
ALTER TABLE `usuaris_grups`
  ADD CONSTRAINT `usuaris_grups_ibfk_1` FOREIGN KEY (`id_grup`) REFERENCES `grups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `usuaris_grups_ibfk_2` FOREIGN KEY (`id_usuari`) REFERENCES `usuarisclase` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
