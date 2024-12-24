
/**a) Trigger pour les entrées :*/
DELIMITER //
CREATE TRIGGER after_entree_insert
AFTER INSERT ON mouvements_stock
FOR EACH ROW
BEGIN
  IF NEW.type = 'entrée' THEN
    UPDATE produits
    SET stock = stock + NEW.quantite
    WHERE id = NEW.produit_id;
  END IF;
END //
DELIMITER  ;

/*b) Trigger pour les sorties :*/
DELIMITER //
CREATE TRIGGER after_sortie_insert
AFTER INSERT ON mouvements_stock
FOR EACH ROW
BEGIN
  IF NEW.type = 'sortie' THEN
    UPDATE produits
    SET stock = stock - NEW.quantite
    WHERE id = NEW.produit_id;
  END IF;
END //
DELIMITER ;

/** table produit*/
CREATE TABLE produits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(255),
  description TEXT,
  prix DECIMAL(10, 2),
  stock INT DEFAULT 0,
  date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
);

/** table mouvement_stock*/
CREATE TABLE mouvements_stock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produit_id INT,
  date DATE,
  type ENUM('entrée', 'sortie'),
  quantite INT,
  commentaire TEXT,
  FOREIGN KEY (produit_id) REFERENCES produits(id)
);



CREATE TABLE client (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telephone VARCHAR(15) NOT NULL,
    adresse TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE versements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    article INT NOT NULL,
    client_id INT NOT NULL,
    montant DECIMAL(10, 2) NOT NULL,
    date_versement DATETIME DEFAULT CURRENT_TIMESTAMP,
    commentaire TEXT NULL,
    FOREIGN KEY (client_id) REFERENCES client(id) ON DELETE CASCADE
);
















-- Table pour les produits
CREATE TABLE produits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  prix DECIMAL(10, 2) NOT NULL,
  description TEXT
);

-- Table pour les commandes
CREATE TABLE commandes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  produit_id INT NOT NULL,
  quantite INT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produit_id) REFERENCES produits(id),
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Table pour les versements
CREATE TABLE versements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  montant DECIMAL(10, 2) NOT NULL,
  date_versement DATETIME DEFAULT CURRENT_TIMESTAMP,
  commentaire TEXT,
  FOREIGN KEY (client_id) REFERENCES clients(id)
);




-- Ajouter la colonne client_id à la table commandes
ALTER TABLE commandes
ADD COLUMN client_id INT NOT NULL;

-- Ajouter une contrainte de clé étrangère pour client_id
ALTER TABLE commandes
ADD CONSTRAINT fk_client
FOREIGN KEY (client_id) REFERENCES clients(id)
ON DELETE CASCADE;


SELECT * 
FROM produits 
WHERE id = ? 
  AND nom = 'Parfuns' 
  AND description = 'touti tanekh' 
  AND prix = 1750.00 
  AND stock = 100 
  AND date_creation = '2024-11-14T00:16:41.000Z';
