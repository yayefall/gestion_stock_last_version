-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:3306
-- Généré le : lun. 23 déc. 2024 à 22:08
-- Version du serveur :  8.0.40-0ubuntu0.20.04.1
-- Version de PHP : 7.4.3-4ubuntu2.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `gestionstock`
--

-- --------------------------------------------------------

--
-- Structure de la table `client`
--

CREATE TABLE `client` (
  `id` int NOT NULL,
  `nom` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telephone` varchar(15) NOT NULL,
  `adresse` text,
  `date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `client`
--

INSERT INTO `client` (`id`, `nom`, `email`, `telephone`, `adresse`, `date`) VALUES
(1, 'Khadim Colobane', 'khadimclobane@gmail..com', '781844545', 'Dakar, Sénégal', '2024-12-09'),
(2, 'Aida Ndiaye', 'aidandiaye@gmail.com', '772474240', 'Thiès, Sénégal', '2024-12-09'),
(3, 'Arame Thioune', 'aramethioune@gmail..com', '705910796', 'Dakar, Sénégal', '2024-12-09'),
(5, 'Penda Diagne', 'pendadiagne@gmail.com', '773501743', 'Touba,Sénégal', '2024-12-09'),
(6, 'Cheikh Ibra Diop', 'cheikhibra@gmail.com', '777756542', 'Touba Guédiawaye, Sénégal', '2024-12-09');

-- --------------------------------------------------------

--
-- Structure de la table `commandes`
--

CREATE TABLE `commandes` (
  `id` int NOT NULL,
  `date_commande` date NOT NULL,
  `statut` enum('En cours','Complétée','Annulée','Livrée') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'En cours',
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `total` decimal(10,0) NOT NULL,
  `client_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `commandes`
--

INSERT INTO `commandes` (`id`, `date_commande`, `statut`, `date_creation`, `total`, `client_id`) VALUES
(15, '2024-12-01', 'Livrée', '2024-12-09 11:28:44', '30000', 3),
(16, '2024-11-25', 'Livrée', '2024-12-09 11:38:32', '75000', 1),
(17, '2024-12-04', 'Livrée', '2024-12-09 12:02:19', '112500', 5),
(18, '2024-12-09', 'Livrée', '2024-12-09 15:46:42', '51000', 6),
(19, '2024-12-16', 'Livrée', '2024-12-16 11:36:23', '75000', 6);

-- --------------------------------------------------------

--
-- Structure de la table `details_commande`
--

CREATE TABLE `details_commande` (
  `id` int NOT NULL,
  `commande_id` int DEFAULT NULL,
  `produit_id` int DEFAULT NULL,
  `quantite` decimal(10,0) NOT NULL,
  `prix_unitaire` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `details_commande`
--

INSERT INTO `details_commande` (`id`, `commande_id`, `produit_id`, `quantite`, `prix_unitaire`) VALUES
(11, 15, 7, '50', '600.00'),
(12, 16, 7, '100', '650.00'),
(13, 17, 7, '150', '650.00'),
(14, 18, 7, '68', '650.00'),
(15, 19, 7, '50', '650.00');

-- --------------------------------------------------------

--
-- Structure de la table `impayer`
--

CREATE TABLE `impayer` (
  `id` int NOT NULL,
  `client` varchar(255) NOT NULL,
  `produit_id` int NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `date` date NOT NULL,
  `commentaire` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `impayer`
--

INSERT INTO `impayer` (`id`, `client`, `produit_id`, `montant`, `date`, `commentaire`) VALUES
(1, 'Ramatoulaye Diaw', 7, '4000.00', '2024-12-23', 'il a deja payé les 2000 francs'),
(3, 'Penda Diagne', 7, '8250.00', '2024-12-23', 'elle lui reste 11 pieces de parfums '),
(4, 'Tapha Amar', 7, '2000.00', '2024-12-23', 'il a prix 2 parfums  depuis presque 1 moi'),
(5, 'Issa Sarr', 7, '4000.00', '2024-12-23', 'il a prix pieces'),
(6, 'Touba  Diouf', 7, '5000.00', '2024-12-23', 'il a prix 5 pieces'),
(7, 'Allassane Dia', 7, '4000.00', '2024-12-23', 'il a prix 4 pieces 3 pour lui 1 pour mme thiam'),
(8, 'Youssou Thiam', 7, '2000.00', '2024-12-23', 'il a prix aussi 2 pieces\n'),
(10, 'Bocar et Baye Mass', 7, '2000.00', '2024-12-23', 'ils sont prix chacun 1 piece'),
(11, 'Tapha Amar ', 7, '2000.00', '2024-12-23', 'il a prix 2 pieces');

-- --------------------------------------------------------

--
-- Structure de la table `mesVersement`
--

CREATE TABLE `mesVersement` (
  `id` int NOT NULL,
  `client` varchar(50) NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `date_versement` datetime DEFAULT CURRENT_TIMESTAMP,
  `commentaire` text,
  `produit_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `mesVersement`
--

INSERT INTO `mesVersement` (`id`, `client`, `montant`, `date_versement`, `commentaire`, `produit_id`) VALUES
(6, 'fgklmsrtyuiop', '1256.00', '2024-12-18 13:06:48', 'xcvhjklzertyuiop', 7);

-- --------------------------------------------------------

--
-- Structure de la table `mouvements_stock`
--

CREATE TABLE `mouvements_stock` (
  `id` int NOT NULL,
  `produit_id` int DEFAULT NULL,
  `date` date NOT NULL,
  `type` enum('Entrée','Sortie') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `quantite` int NOT NULL,
  `commentaire` text,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `mouvements_stock`
--

INSERT INTO `mouvements_stock` (`id`, `produit_id`, `date`, `type`, `quantite`, `commentaire`, `date_creation`) VALUES
(20, 7, '2024-12-09', 'Sortie', 50, 'Quantité commandé par Arame thioune', '2024-12-09 12:25:46'),
(21, 7, '2024-12-09', 'Sortie', 150, 'Quantite commandé par Penda Diagne', '2024-12-09 12:48:02'),
(22, 7, '2024-12-09', 'Sortie', 100, 'Quantité commandé par khadim colobane', '2024-12-09 12:49:26'),
(23, 7, '2024-12-09', 'Sortie', 68, 'Quantité commandé par cheikh Ibra Diop', '2024-12-09 14:47:19'),
(24, 7, '2024-12-16', 'Sortie', 50, 'Quantite commandé par cheikh ibra  diop vers Thiess', '2024-12-16 11:42:58'),
(26, 7, '2024-12-23', 'Sortie', 89, 'quanitité commander par plusieurs personnes', '2024-12-23 21:44:48');

--
-- Déclencheurs `mouvements_stock`
--
DELIMITER $$
CREATE TRIGGER `after_entree_insert` AFTER INSERT ON `mouvements_stock` FOR EACH ROW BEGIN
  IF NEW.type = 'entrée' THEN
    UPDATE produits
    SET stock = stock + NEW.quantite
    WHERE id = NEW.produit_id;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_sortie_insert` AFTER INSERT ON `mouvements_stock` FOR EACH ROW BEGIN
  IF NEW.type = 'sortie' THEN
    UPDATE produits
    SET stock = stock - NEW.quantite
    WHERE id = NEW.produit_id;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `produits`
--

CREATE TABLE `produits` (
  `id` int NOT NULL,
  `nom` varchar(100) NOT NULL,
  `description` text,
  `prix` decimal(10,2) NOT NULL,
  `stock` int DEFAULT '0',
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `produits`
--

INSERT INTO `produits` (`id`, `nom`, `description`, `prix`, `stock`, `date_creation`) VALUES
(7, 'Parfums', 'Hommes et Femmes', '750.00', 21, '2024-12-09 11:24:33'),
(9, 'Lunettes', 'Homme et Femmes', '6500.00', 18, '2024-12-23 20:10:12');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `nom` varchar(50) NOT NULL,
  `prenom` varchar(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `date` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `nom`, `prenom`, `username`, `email`, `password`, `date`) VALUES
(1, 'Diop', 'Cheikh Ibra', 'lampfall', 'lampfall@gmail.com', 'lampfall', '2024-11-12 20:03:01'),
(2, 'Dia', 'Alassane', 'alassanedia', 'alassanedia@gmail.com', 'dia', '2024-11-13 12:32:38'),
(3, 'Anne', 'Bocar', 'bocaranne', 'bocaranne@gmail.com', 'anne', '2024-11-13 12:33:39');

-- --------------------------------------------------------

--
-- Structure de la table `versement`
--

CREATE TABLE `versement` (
  `id` int NOT NULL,
  `client_id` int NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `date_versement` datetime DEFAULT CURRENT_TIMESTAMP,
  `commentaire` text,
  `produit_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `versement`
--

INSERT INTO `versement` (`id`, `client_id`, `montant`, `date_versement`, `commentaire`, `produit_id`) VALUES
(9, 3, '30000.00', '2024-12-09 13:03:50', 'versement complet pour 50 pieces Arame Thioune ', 7),
(10, 1, '29900.00', '2024-12-09 13:49:56', 'versement pour 46 pieces  sur 100 pieces', 7),
(11, 5, '65000.00', '2024-12-09 13:50:43', 'versement  de 100 pieces sur 150 pieces', 7),
(12, 6, '44200.00', '2024-12-09 14:39:37', 'versement complet pour 68 pieces', 7),
(13, 6, '65000.00', '2024-12-16 11:40:29', 'versement complet pour 50 pieces vers thies', 7),
(14, 5, '27300.00', '2024-12-16 12:08:50', 'Versement pour 42 pieces 50', 7);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `client`
--
ALTER TABLE `client`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Index pour la table `commandes`
--
ALTER TABLE `commandes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_client` (`client_id`);

--
-- Index pour la table `details_commande`
--
ALTER TABLE `details_commande`
  ADD PRIMARY KEY (`id`),
  ADD KEY `commande_id` (`commande_id`),
  ADD KEY `produit_id` (`produit_id`);

--
-- Index pour la table `impayer`
--
ALTER TABLE `impayer`
  ADD PRIMARY KEY (`id`),
  ADD KEY `produit_id` (`produit_id`);

--
-- Index pour la table `mesVersement`
--
ALTER TABLE `mesVersement`
  ADD PRIMARY KEY (`id`),
  ADD KEY `produit_id` (`produit_id`);

--
-- Index pour la table `mouvements_stock`
--
ALTER TABLE `mouvements_stock`
  ADD PRIMARY KEY (`id`),
  ADD KEY `produit_id` (`produit_id`);

--
-- Index pour la table `produits`
--
ALTER TABLE `produits`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Index pour la table `versement`
--
ALTER TABLE `versement`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `fk_produit` (`produit_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `client`
--
ALTER TABLE `client`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `commandes`
--
ALTER TABLE `commandes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT pour la table `details_commande`
--
ALTER TABLE `details_commande`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT pour la table `impayer`
--
ALTER TABLE `impayer`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `mesVersement`
--
ALTER TABLE `mesVersement`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `mouvements_stock`
--
ALTER TABLE `mouvements_stock`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT pour la table `produits`
--
ALTER TABLE `produits`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `versement`
--
ALTER TABLE `versement`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `commandes`
--
ALTER TABLE `commandes`
  ADD CONSTRAINT `fk_client` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`);

--
-- Contraintes pour la table `details_commande`
--
ALTER TABLE `details_commande`
  ADD CONSTRAINT `details_commande_ibfk_1` FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `details_commande_ibfk_2` FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `impayer`
--
ALTER TABLE `impayer`
  ADD CONSTRAINT `impayer_ibfk_1` FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `mesVersement`
--
ALTER TABLE `mesVersement`
  ADD CONSTRAINT `mesVersement_ibfk_1` FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `mouvements_stock`
--
ALTER TABLE `mouvements_stock`
  ADD CONSTRAINT `mouvements_stock_ibfk_1` FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `versement`
--
ALTER TABLE `versement`
  ADD CONSTRAINT `fk_produit` FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`),
  ADD CONSTRAINT `versement_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
