
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
//const PDFDocument = require("pdfkit");
const { Parser } = require("json2csv");
//const fs = require("fs");
//const tmp = require("tmp");
const { PDFDocument, rgb } = require("pdf-lib");
const app = express();
//const bcrypt = require('bcrypt');
app.use(cors());
app.use(bodyParser.json());


const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'bayefall1988',
  database: 'gestionstock',
}).promise();

db.query("SELECT 1 + 1 AS solution")
  .then(([rows]) => {
    console.log("Résultat :", rows);
  })
  .catch((err) => {
    console.error("Erreur :", err);
  });

// Route pour l'authentification dans la page indexpage

 app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';

  try {
    // Exécuter la requête avec le pool
    const [result] = await db.query(sql, [username, password]);

    // Vérifier si un utilisateur correspondant a été trouvé
    if (result.length > 0) {
      // Si l'utilisateur existe, retourner un token factice (JWT)
      res.json({ success: true, token: 'fake-jwt-token' });
    } else {
      // Si les informations sont incorrectes, retourner une erreur 401
      res.status(401).json({ success: false, message: 'Username ou mot de passe incorrect' });
    }
  } catch (err) {
    console.error('Erreur lors de la tentative de connexion :', err);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
});

/*************************************************FIN*****************************************/


/******************************************DEBUT*********************************************/
// Afficher lea tables des archives

  // Route pour afficher les produits
    app.get('/api/produits', async (req, res) => {
      const sql = 'SELECT id, nom, description, prix, stock, date_creation FROM produits';
      try {
        // Obtenir une connexion depuis le pool
        const [results] = await db.query(sql);

      // Retourner les résultats
        res.status(200).json(results);
      } catch (err) {
        console.error('Erreur lors de la récupération des produits :', err);
        res.status(500).json({ message: "Erreur lors de la récupération des produits. Veuillez réessayer plus tard." });
      }
    });

//Inserer des donnees dans la table Produit
app.post('/api/produits', async (req, res) => {
  const { nom, description, prix, stock } = req.body;
  const sql = 'INSERT INTO produits (nom, description, prix, stock) VALUES (?, ?, ?, ?)';

  try {
    // Exécution de la requête d'insertion avec le pool
    const [result] = await db.query(sql, [nom, description, prix, stock]);

    // Réponse avec les informations du produit inséré
    res.status(201).json({ id: result.insertId, nom, description, prix, stock });
  } catch (err) {
    console.error('Erreur lors de l\'insertion du produit :', err);
    res.status(500).json({ message: 'Erreur lors de l\'insertion du produit' });
  }
});

// Route pour supprimer un document
app.delete('/api/produits/:id', async (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM produits WHERE id = ?';

  try {
    // Exécution de la requête de suppression avec le pool
    const [result] = await db.query(sql, [id]);

    // Vérification si aucune ligne n'a été affectée (ID non trouvé)
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // Réponse de succès
    res.sendStatus(200);
  } catch (err) {
    console.error('Erreur lors de la suppression du produit :', err);
    res.status(500).json({ message: 'Erreur lors de la suppression du produit' });
  }
});


// Route pour mettre à jour un document
app.put('/api/produits/:id', async (req, res) => {
  const { id } = req.params;
  const { nom, description, prix, stock } = req.body;

  // Vérification des champs obligatoires
  if (!nom || !description || !prix || !stock) {
    return res.status(400).json({ message: "Tous les champs 'nom', 'description', 'prix', et 'stock' sont obligatoires." });
  }

  const sql = 'UPDATE produits SET nom = ?, description = ?, prix = ?, stock = ? WHERE id = ?';

  try {
    // Exécution de la requête avec le pool
    const [result] = await db.query(sql, [nom, description, prix, stock, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Produit introuvable." });
    }

    // Retourner la réponse avec les nouvelles données
    res.status(200).json({ id, nom, description, prix, stock });
  } catch (err) {
    console.error("Erreur lors de la mise à jour du produit :", err);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
});

// API pour récupérer un produit par ID
app.get('/api/produits/:id', async (req, res) => {
  const { id } = req.params;

  const query = `SELECT * FROM produits WHERE id = ?`;

  try {
    const [rows] = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    res.json(rows[0]);  // Retourner le premier produit trouvé
  } catch (error) {
    console.error('Erreur lors de la récupération du produit :', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

/*********************************FIN*********************************** */

/**************************DEBUT******************************************** */

//Inserer des donnees dans la table ADMIN
app.post('/api/admin', async (req, res) => {
  const { nom, prenom, username, email, password } = req.body;

  const sql = 'INSERT INTO users (nom, prenom, username, email, password) VALUES (?, ?, ?, ?, ?)';

  try {
    // Exécuter la requête avec le pool
    const [result] = await db.query(sql, [nom, prenom, username, email, password]);

    // Retourner la réponse avec l'ID inséré et les données
    res.json({ id: result.insertId, nom, prenom, username, email, password });
  } catch (err) {
    console.error('Erreur lors de l\'ajout de l\'utilisateur :', err);
    res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'utilisateur' });
  }
});


// Afficher tous les  profils
app.get('/api/admin', async (req, res) => {
  const sql = 'SELECT id, nom, prenom, username, email, date FROM users';

  try {
    // Exécuter la requête avec le pool
    const [results] = await db.query(sql);

    // Retourner les résultats
    res.json(results);
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs :', err);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
});


// Route pour supprimer un profil
app.delete('/api/admin/:id', async (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM users WHERE id = ?';

  try {
    // Exécuter la requête de suppression avec le pool
    const [result] = await db.query(sql, [id]);

    // Si aucune ligne n'est affectée, cela signifie que l'ID n'existe pas
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Réponse de succès
    res.sendStatus(200);
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'utilisateur :', err);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});

// Route pour mettre à jour un profil
app.put('/api/admin/:id', async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, username, password } = req.body;
  const sql = 'UPDATE users SET nom = ?, prenom = ?, username = ?, password = ? WHERE id = ?';

  try {
    // Exécution de la requête de mise à jour avec le pool
    const [result] = await db.query(sql, [nom, prenom, username, password, id]);

    // Vérification si aucune ligne n'a été affectée (ID non trouvé)
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Réponse de succès
    res.json({ id, nom, prenom, username, password });
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur :', err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur' });
  }
});

/*************************************FIN***************************************** */

/***********************************DEBUT************************************* */
// Route pour ajouter une commande
app.post('/api/commandes', async (req, res) => {
  const { date_commande, client_id, statut, total } = req.body;
  const sql = 'INSERT INTO commandes (date_commande, client_id, statut, total) VALUES (?, ?, ?,?)';

  try {
    // Exécuter la requête avec le pool
    const [result] = await db.query(sql, [date_commande, client_id, statut, total]);

    // Retourner une réponse avec les informations insérées
    res.json({
      id: result.insertId,  // L'ID de la commande nouvellement insérée
      date_commande,
      client_id,
      statut,
      total
    });
  } catch (err) {
    console.error('Erreur lors de l\'ajout de la commande :', err);
    res.status(500).json({ message: 'Erreur lors de l\'ajout de la commande' });
  }
});


// route pour recuperer tous les commandes
app.get('/api/commandes', async (req, res) => {
  const sql = `
    SELECT
      c.id,
      cl.nom AS nom_client,
      c.date_commande,
      c.statut,
      c.date_creation,
      c.total
    FROM commandes c
     JOIN
      client cl ON c.client_id = cl.id

  `;

  try {
    // Exécuter la requête avec le pool de connexions
    const [results] = await db.query(sql);

    // Retourner les résultats sous forme de JSON
    res.json(results);
  } catch (err) {
    console.error('Erreur lors de la récupération des commandes :', err);
    res.status(500).json({ message: 'Erreur lors de la récupération des commandes' });
  }
});


// route  pour recuperer une commande par ID
app.get('/api/commandes/:id', async (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT
      c.id,
      cl.nom AS nom_client,
      c.date_commande,
      c.statut,
      c.date_creation,
      c.total
    FROM commandes c
    JOIN
      client cl ON c.client_id = cl.id
    WHERE
      c.client_id = ?`;

  try {
    // Exécuter la requête avec le pool
    const [result] = await db.query(sql, [id]);

    // Vérifier si la commande existe
    if (result.length > 0) {
      res.json(result[0]);  // Retourne la première commande trouvée
    } else {
      res.status(404).json({ message: 'Commande non trouvée' }); // Si aucune commande n'est trouvée
    }
  } catch (err) {
    console.error('Erreur lors de la récupération de la commande :', err);
    res.status(500).json({ message: 'Erreur lors de la récupération de la commande' });
  }
});

 // route pour mettre a jour une  commande
 app.put('/api/commandes/:id', async (req, res) => {
  const { id } = req.params;
  const { date_commande, client_id, statut, total } = req.body;

  const sql = 'UPDATE commandes SET date_commande = ?, client_id = ?, statut = ?, total = ? WHERE id = ?';

  try {
    // Exécution de la requête avec le pool de connexions
    const [result] = await db.query(sql, [date_commande, client_id, statut, total, id]);

    // Vérifier si la commande a été mise à jour (affectation de lignes)
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Commande non trouvée.' });
    }

    // Retourner la commande mise à jour
    res.json({ id, date_commande, client_id, statut, total });
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la commande :', err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la commande' });
  }
});


// route pour  supprimer une commande
app.delete('/api/commandes/:id', async (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM commandes WHERE id = ?';

  try {
    // Exécution de la requête avec le pool de connexions
    const [result] = await db.query(sql, [id]);

    // Vérifier si la commande a été supprimée (affectation de lignes)
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Commande non trouvée.' });
    }

    // Retourner un message de succès
    res.json({ message: 'Commande supprimée', id });
  } catch (err) {
    console.error('Erreur lors de la suppression de la commande :', err);
    res.status(500).json({ message: 'Erreur lors de la suppression de la commande' });
  }
});

/************************************FIN****************************************** */

/*********************************DEBUT*************************************** */


// Récupérer les détails d'une commande
app.get('/api/details_commande/:commande_id', async (req, res) => {
  const { commande_id } = req.params;

  const sql = `
   SELECT
  d.produit_id,
  d.quantite,
  d.prix_unitaire,
  (d.quantite * d.prix_unitaire) AS total, -- Calcul du total
  p.nom AS nom_produit,
  cl.nom AS nom_client,
  c.date_commande
FROM
  details_commande d
JOIN
  produits p ON d.produit_id = p.id
JOIN
  commandes c ON d.commande_id = c.id
JOIN
  client cl ON c.client_id = cl.id
WHERE
  d.commande_id = ?;
`;

  try {
    // Exécuter la requête avec le pool
    const [result] = await db.query(sql, [commande_id]);

    // Si aucun détail de commande n'est trouvé
    if (result.length === 0) {
      return res.status(404).json({ message: 'Détails de commande non trouvés' });
    }

    // Retourner les résultats des détails de commande
    res.json(result);
  } catch (err) {
    console.error('Erreur lors de la récupération des détails de commande :', err);
    return res.status(500).json({ message: 'Erreur lors de la récupération des détails de commande' });
  }
});

// Ajouter un détail  d'un produit a une commande
app.post('/api/details_commande', async (req, res) => {
  const { commande_id, produit_id, quantite, prix_unitaire } = req.body;
  const sql = 'INSERT INTO details_commande (commande_id, produit_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)';

  try {
    // Exécuter la requête avec le pool
    const [result] = await db.query(sql, [commande_id, produit_id, quantite, prix_unitaire]);

    // Retourner une réponse avec les informations insérées
    res.json({
      id: result.insertId,  // L'ID du détail de commande nouvellement inséré
      commande_id,
      produit_id,
      quantite,
      prix_unitaire
    });
  } catch (err) {
    console.error('Erreur lors de l\'ajout des détails de la commande :', err);
    res.status(500).json({ message: 'Erreur lors de l\'ajout des détails de la commande' });
  }
});


/****************************FIN******************************************************** */

/*****************************************DEBUT*********************************************** */

// Enregistrement d'un mouvement de stock avec mise à jour automatique du stock
app.post("/api/mouvements_stock", async (req, res) => {
  const { produit_id, date, type, quantite, commentaire } = req.body;

  // Vérifiez les champs obligatoires
  if (!produit_id || !date || !type || !quantite || isNaN(quantite) || quantite <= 0) {
    return res.status(400).json({
      message: "Veuillez remplir tous les champs obligatoires avec des valeurs valides.",
    });
  }

  // Vérifiez le type de mouvement
  if (!["entrée", "sortie"].includes(type)) {
    return res.status(400).json({
      message: "Type de mouvement invalide. Doit être 'entrée' ou 'sortie'.",
    });
  }

  const connection = await db.getConnection(); // Obtenez une connexion dédiée

  try {
    console.log("Vérification du produit...");
    // Vérifiez si le produit existe
    const [produit] = await connection.query("SELECT * FROM produits WHERE id = ?", [produit_id]);
    if (produit.length === 0) {
      return res.status(404).json({ message: "Produit introuvable." });
    }

    console.log("Produit trouvé :", produit[0]);

    // Vérifiez le stock pour une sortie
    if (type === "sortie" && produit[0].stock < quantite) {
      return res.status(400).json({ message: "Stock insuffisant pour effectuer cette sortie." });
    }

    // Commencez une transaction
    console.log("Début de la transaction...");
    await connection.beginTransaction();

    // Insérez le mouvement de stock
    console.log("Insertion du mouvement de stock...");
    await connection.query(
      "INSERT INTO mouvements_stock (produit_id, date, type, quantite, commentaire) VALUES (?, ?, ?, ?, ?)",
      [produit_id, date, type, quantite, commentaire]
    );

    // Calculez le nouveau stock
   const nouveauStock =
   type === "entrée"
    ? produit[0].stock + parseInt(quantite, 10)
    : produit[0].stock - parseInt(quantite, 10);

console.log(`Type: ${type}, Quantité (numérique): ${parseInt(quantite, 10)}, Stock initial: ${produit[0].stock}, Nouveau stock: ${nouveauStock}`);

// Vérifiez si le stock est valide après calcul
if (nouveauStock < 0) {
  return res.status(400).json({ message: "Le stock ne peut pas être négatif." });
}
  //  const nouveauStock = type === "entrée" ? produit[0].stock + quantite : produit[0].stock - quantite;

    // Mettez à jour le stock du produit
    console.log("Mise à jour du stock...");
    await connection.query("UPDATE produits SET stock = ? WHERE id = ?", [nouveauStock, produit_id]);

    // Validez la transaction
    console.log("Validation de la transaction...");
    await connection.commit();

    // Réponse au client
    res.status(200).json({
      message: "Mouvement de stock enregistré avec succès.",
      produit: {
        id: produit[0].id,
        nom: produit[0].nom,
        nouveauStock: nouveauStock,
      },
    });
  } catch (err) {
    await connection.rollback(); // Annulez la transaction en cas d'erreur
    console.error("Erreur lors de l'enregistrement du mouvement de stock :", err);
    res.status(500).json({ message: "Erreur interne du serveur." });
  } finally {
    connection.release(); // Libérez la connexion à la base de données
  }
});

// fonction pour récupérer tous les mouvements de stock
app.get('/api/mouvements_stock', async (req, res) => {
  const sql = `
    SELECT
      m.id,
      p.nom AS produit_nom,
      m.date,
      m.type,
      m.quantite,
      m.commentaire
    FROM
      mouvements_stock m
    JOIN
      produits p ON m.produit_id = p.id
    ORDER BY
      m.date ASC;
  `;

  try {
    // Exécution de la requête avec le pool
    const [results] = await db.query(sql);

    // Retourner les résultats
    res.status(200).json(results);
  } catch (err) {
    console.error("Erreur lors de la récupération des mouvements de stock :", err);
    res.status(500).json({ error: "Erreur lors de la récupération des mouvements de stock." });
  }
});

// pour supprimer un mouvement de stock
app.delete('/api/mouvement_stock/:id', async (req, res) => {
  const { id } = req.params; // Récupérer l'ID du mouvement à supprimer

  try {
    const connection = await db.getConnection(); // Connexion à la base de données

    // Vérifier si le mouvement existe
    const [mouvement] = await connection.query('SELECT * FROM mouvements_stock WHERE id = ?', [id]);
    if (mouvement.length === 0) {
      return res.status(404).json({ message: 'Mouvement de stock non trouvé.' });
    }

    // Supprimer le mouvement
    await connection.query('DELETE FROM mouvements_stock WHERE id = ?', [id]);

    res.status(200).json({ message: 'Mouvement supprimé avec succès.' });
  } catch (err) {
    console.error('Erreur lors de la suppression du mouvement :', err);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

/*app.delete('/api/mouvements_stock/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await db.getConnection();

    // Vérifier si le mouvement existe
    const [result] = await connection.query('SELECT * FROM mouvements_stock WHERE id = ?', [id]);
    if (result.length === 0) {
      return res.status(404).json({ message: 'Mouvement non trouvé.' });
    }

    // Supprimer le mouvement
    await connection.query('DELETE FROM mouvements_stock WHERE id = ?', [id]);

    res.status(200).json({ message: 'Mouvement supprimé avec succès.' });
  } catch (err) {
    console.error('Erreur lors de la suppression du mouvement :', err);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});*/

// pour modifier mouvements de stock
app.put('/api/mouvements_stock/:id', async (req, res) => {
  const { id } = req.params;
  const { produit_id, date, type, quantite, commentaire } = req.body;

  try {
    const connection = await db.getConnection();

    // Vérifier si le mouvement existe
    const [mouvement] = await connection.query('SELECT * FROM mouvements_stock WHERE id = ?', [id]);
    if (mouvement.length === 0) {
      return res.status(404).json({ message: 'Mouvement non trouvé.' });
    }

    // Mise à jour du mouvement
    const updateFields = [];
    const updateValues = [];

    if (produit_id !== undefined) {
      updateFields.push('produit_id = ?');
      updateValues.push(produit_id);
    }
    if (date !== undefined) {
      updateFields.push('date = ?');
      updateValues.push(date);
    }
    if (type !== undefined) {
      updateFields.push('type = ?');
      updateValues.push(type);
    }
    if (quantite !== undefined) {
      updateFields.push('quantite = ?');
      updateValues.push(quantite);
    }
    if (commentaire !== undefined) {
      updateFields.push('commentaire = ?');
      updateValues.push(commentaire);
    }

    updateValues.push(id); // Ajoutez l'ID à la fin des valeurs

    if (updateFields.length > 0) {
      const query = `UPDATE mouvements_stock SET ${updateFields.join(', ')} WHERE id = ?`;
      await connection.query(query, updateValues);
    }

    res.status(200).json({ message: 'Mouvement mis à jour avec succès.' });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du mouvement :', err);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});


// 1) fonction recuperer les stocks ggggggggggggggggggg
app.get('/api/produits/:id/stock', async (req, res) => {
  const { id } = req.params;

  const sql = `SELECT id, nom, stock FROM produits WHERE id = ?`;

  try {
    // Exécuter la requête avec le pool
    const [result] = await db.query(sql, [id]);

    // Si le produit n'est pas trouvé
    if (result.length === 0) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // Retourner le produit avec son stock
    res.json(result[0]);
  } catch (err) {
    console.error('Erreur lors de la récupération du stock :', err);
    return res.status(500).json({ message: 'Erreur lors de la récupération du stock' });
  }
});


/************************************FIN**************************************** */

/**************************DeBUT VERSEMENTS CLIENTS ******************************* */

// Endpoint pour ajouter un versement Client
app.post('/api/versement', async (req, res) => {
  const { produit_id,client_id, montant, commentaire } = req.body;

  // Validation des données
  if (!client_id || !montant || !produit_id) {
    return res.status(400).json({
      message: 'Les champs client_id et montant sont obligatoires.',
    });
  }

  try {
    // Insérer le versement dans la table
    const [result] = await db.query(
      'INSERT INTO versement (produit_id,client_id, montant, commentaire) VALUES (?,?, ?, ?)',
      [produit_id,client_id, montant, commentaire]
    );

    res.status(201).json({
      message: 'Versement ajouté avec succès.',
      versement_id: result.insertId,
    });
  } catch (error) {
    console.error('Erreur lors de l’ajout du versement :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});
// route pour lister les versements
// Endpoint pour récupérer tous les versements
app.get('/api/versement', async (req, res) => {
  try {
    const [versements] = await db.query(
      `SELECT v.*,
         c.nom AS client_nom,
         p.nom AS nom_produit
       FROM
          versement v
        JOIN
          client c ON v.client_id = c.id
        JOIN
          produits p ON v.produit_id = p.id

          ` );

    res.status(200).json(versements);
  } catch (error) {
    console.error('Erreur lors de la récupération des versements :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});


// Supprimer un versement
app.delete("/api/versement/:id", async (req, res) => {
  const versementId = parseInt(req.params.id, 10); // S'assurer que l'ID est un entier
  if (isNaN(versementId)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  try {
    const [result] = await db.query("DELETE FROM versement WHERE id = ?", [versementId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Versement introuvable" });
    }

    res.status(200).json({ message: "Versement supprimé avec succès." });
  } catch (err) {
    console.error("Erreur lors de la suppression du versement :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});


/**************************DeBUT Mes Versements ******************************* */

// Endpoint pour ajouter Mes versements
app.post('/api/MesVersement', async (req, res) => {
  const { produit_id, client, montant, commentaire } = req.body;

  // Validation des données
  if (!client || !montant || !produit_id) {
    return res.status(400).json({
      message: 'Les champs client et montant sont obligatoires.',
    });
  }

  try {
    // Insérer le versement dans la table
    const [result] = await db.query(
      'INSERT INTO mesVersement (produit_id, client, montant, commentaire) VALUES (?,?,?,?)',
      [produit_id,client, montant, commentaire]
    );

    res.status(201).json({
      message: 'Versement ajouté avec succès.',
      versement_id: result.insertId,
    });
  } catch (error) {
    console.error('Erreur lors de l’ajout du versement :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

// route pour lister les versements
app.get('/api/MesVersement', async (req, res) => {
  try {
    const [versements] = await db.query(
      `SELECT v.*,
         p.nom AS nom_produit
       FROM
          mesVersement v
        JOIN
          produits p ON v.produit_id = p.id

          ` );

    res.status(200).json(versements);
  } catch (error) {
    console.error('Erreur lors de la récupération des versements :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});


// Supprimer un versement
app.delete("/api/MesVersement/:id", async (req, res) => {
  const versementId = parseInt(req.params.id, 10); // S'assurer que l'ID est un entier
  if (isNaN(versementId)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  try {
    const [result] = await db.query("DELETE FROM mesVersement WHERE id = ?", [versementId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Versement introuvable" });
    }

    res.status(200).json({ message: "Versement supprimé avec succès." });
  } catch (err) {
    console.error("Erreur lors de la suppression du versement :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});


/******************************************DEBUT client***************************************************** */

// Gestion des routes pour la table `client`

// Récupérer tous les clients
app.get('/api/client', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM client ORDER BY date DESC');
    res.json(rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des clients:', err);
    res.status(500).send('Erreur serveur');
  }
});

// Récupérer un client par son ID
app.get('/api/client/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM client WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).send('Client introuvable');
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Erreur lors de la récupération du client:', err);
    res.status(500).send('Erreur serveur');
  }
});

// Ajouter un nouveau client
app.post('/api/client', async (req, res) => {
  const { nom, email, telephone, adresse ,date} = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO client (nom, email, telephone, adresse,date) VALUES ( ?, ?, ?, ?,?)',
      [nom,email, telephone, adresse,date]
    );
    res.status(201).json({ message: 'Client ajouté avec succès', id: result.insertId });
  } catch (err) {
    console.error('Erreur lors de l’ajout du client:', err);
    res.status(500).send('Erreur serveur');
  }
});

// Modifier un client existant
app.put('/api/client/:id', async (req, res) => {
  const { id } = req.params;
  const { nom, email, telephone, adresse,date } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE client SET  nom = ?, email = ?, telephone = ?, adresse = ? , date=? WHERE id = ?',
      [nom, email, telephone, adresse,date, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).send('Client introuvable');
    }
    res.json({ message: 'Client modifié avec succès' });
  } catch (err) {
    console.error('Erreur lors de la modification du client:', err);
    res.status(500).send('Erreur serveur');
  }
});

// Supprimer un client
app.delete('/api/client/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM client WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).send('Client introuvable');
    }
    res.json({ message: 'Client supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression du client:', err);
    res.status(500).send('Erreur serveur');
  }
});

/*******************************cela concerne  le dashboard********************* */
//  cest pour recupere les statitiques des ventes
app.get("/api/stats", async (req, res) => {
  const connection = await db.getConnection(); // Connexion à la base de données

  try {
    // Requête pour le nombre total d'utilisateurs
    const [userResult] = await connection.query("SELECT COUNT(*) AS clients FROM client");
    const client = userResult[0].clients;

    // Requête pour le nombre total de commandes
    const [orderResult] = await connection.query("SELECT COUNT(*) AS commande FROM commandes");
    const commande = orderResult[0].commande;

    // Requête pour les revenus totaux
    const [revenueResult] = await connection.query("SELECT SUM(total) AS revenue FROM commandes");
    const revenue = revenueResult[0].revenue || 0; // Gérer les résultats nuls

    // Envoyer les résultats au client
    res.json({
      client,
      commande,
      revenue,
    });
  } catch (err) {
    console.error("Erreur lors de la récupération des statistiques :", err);
    res.status(500).json({ message: "Erreur interne du serveur." });
  } finally {
    connection.release(); // Libérer la connexion à la base de données
  }
});
// cest pour le graphique des  clients
app.get('/api/clients', async (req, res) => {
  try {
    const connection = await db.getConnection();

    const [results] = await connection.query(`
      SELECT
        DATE_FORMAT(MIN(date), '%b') AS month,    -- Mois abrégé
        COUNT(*) AS total_clients  -- Nombre total de clients inscrits
      FROM
        client
      GROUP BY
        MONTH(date)
      ORDER BY
        MONTH(date);
    `);

    const allMonths = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

    const filledResults = allMonths.map(month => ({
      month,
      total_clients: results.find(r => r.month === month)?.total_clients || 0
    }));

    res.json(filledResults);
  } catch (err) {
    console.error('Erreur API clients:', err);
    res.status(500).json({ message: 'Erreur interne.' });
  }
});

// cest pour afficher le graphique des commandes
app.get('/api/commandess', async (req, res) => {
  try {
    const connection = await db.getConnection(); // Connexion à la base de données

    // Exécuter la requête pour récupérer les montants par mois
    const [results] = await connection.query(`
      SELECT
        DATE_FORMAT(MIN(date_commande), '%b') AS month, -- Mois abrégé
        SUM(total) AS total                             -- Total des montants
      FROM
        commandes
      GROUP BY
        MONTH(date_commande)
      ORDER BY
        MONTH(date_commande);
    `);
    // Liste complète des mois
    const allMonths = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

    // Fusionner les résultats avec tous les mois
    const filledResults = allMonths.map(month => ({
      month,
      total: results.find(r => r.month === month)?.total || 0 // Si un mois est absent, le total sera 0
    }));

    res.json(filledResults); // Envoyer les résultats remplis au client
  } catch (err) {
    console.error('Erreur API commandes:', err);
    res.status(500).json({ message: 'Erreur interne.' });
  }
});

/*************************************DEBUT********************************************** */
// cest pour  recuperer  les parametre
app.get('/api/parametre/:cle', async (req, res) => {
  const { cle } = req.params;

  try {
    const [result] = await db.query('SELECT valeur FROM parametres WHERE cle = ?', [cle]);

    if (result.length === 0) {
      return res.status(404).json({ message: 'Paramètre non trouvé.' });
    }

    res.json({ cle, valeur: result[0].valeur });
  } catch (error) {
    console.error('Erreur lors de la récupération du paramètre:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

/// cest pour modifier les parametres
app.put('/api/parametre/:cle', async (req, res) => {
  const { cle } = req.params;
  const { valeur } = req.body;

  try {
    const [result] = await db.query('UPDATE parametres SET valeur = ? WHERE cle = ?', [valeur, cle]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Paramètre non trouvé.' });
    }

    res.json({ message: 'Paramètre mis à jour avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du paramètre:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

/******************************************************************* */


2. //Ajoutons les endpoints API dans le fichier server.js :

// Liste des impayés
app.get('/api/impayes', async (req, res) => {
  try {
    const [impayes] = await db.query(`
      SELECT i.*,p.nom as nom_produit 
      FROM impayer i   
      JOIN produits p ON i.produit_id = p.id
    `);
    res.json(impayes);
  } catch (error) {
    console.error('Erreur lors de la récupération des impayés:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Ajouter un impayé
app.post('/api/impayes', async (req, res) => {
  const { client, produit_id, montant, date, commentaire } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO impayer (client, produit_id, montant, date, commentaire) VALUES (?, ?, ?, ?, ?)',
      [client, produit_id, montant, date, commentaire]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'impayé:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Modifier un impayé
app.put('/api/impayes/:id', async (req, res) => {
  const { id } = req.params;
  const { client, produit_id, montant, date, commentaire } = req.body;
  try {
    await db.query(
      'UPDATE impayer SET client = ?, produit_id = ?, montant = ?, date = ?, commentaire = ? WHERE id = ?',
      [client, produit_id, montant, date, commentaire, id]
    );
    res.json({ message: 'Impayé modifié avec succès' });
  } catch (error) {
    console.error('Erreur lors de la modification de l\'impayé:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un impayé
app.delete('/api/impayes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM impayer WHERE id = ?', [id]);
    res.json({ message: 'Impayé supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'impayé:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});



/***************************Cela gere les pdf et consort*************************************** */


app.get("/api/rapports", async (req, res) => {
  const { debut, fin, format } = req.query;

  // Validation des dates
  const isValidDate = (date) => !isNaN(new Date(date).getTime());
  const formatDateToFrench = (date) => {
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Intl.DateTimeFormat("fr-FR", options).format(new Date(date));
  };

  if (
    !debut ||
    !fin ||
    !format ||
    !isValidDate(debut) ||
    !isValidDate(fin) ||
    new Date(debut) > new Date(fin)
  ) {
    return res.status(400).json({
      message:
        "Les paramètres 'debut','fin' et 'format' sont requis et doivent être valides.",
    });
  }

  if (!["pdf", "csv"].includes(format)) {
    return res.status(400).json({
      message: "Format non supporté (utilisez 'pdf' ou 'csv').",
    });
  }

  let connection;
  try {
    const query = `
      SELECT
        p.nom AS produit_nom,
        c.id AS commande_id,
        d.quantite AS commande_quantite,
        c.total AS commande_total,
        v.montant AS versement_montant,
        v.date_versement
      FROM commandes c
      LEFT JOIN details_commande d ON c.id = d.commande_id
      LEFT JOIN produits p ON d.produit_id = p.id
      LEFT JOIN versement v ON c.client_id = v.client_id
      WHERE
        (c.date_commande BETWEEN ? AND ?)
        OR (v.date_versement BETWEEN ? AND ?)
      ORDER BY
        c.date_commande DESC,
        v.date_versement DESC;
    `;

    connection = await db.getConnection();
    const [result] = await connection.query(query, [debut, fin, debut, fin]);

    if (result.length === 0) {
      return res.status(404).json({
        message: "Aucune donnée trouvée pour cette période.",
      });
    }

    if (format === "pdf") {
      try {
        const pdfDoc = await PDFDocument.create();
        let page = pdfDoc.addPage([600, 800]);

        const titleFontSize = 18;
        const textFontSize = 10;
        const tableStartX = 50;
        const tableStartY = 700;
        const rowHeight = 20;

        // Titre
        page.drawText("Rapport de Produits, Commandes et Versements", {
          x: tableStartX,
          y: 750,
          size: titleFontSize,
          color: rgb(0, 0, 0),
        });

        // Période
        const debutFrancais = formatDateToFrench(debut);
        const finFrancais = formatDateToFrench(fin);
        page.drawText(`Période : ${debutFrancais} à ${finFrancais}`, {
          x: tableStartX,
          y: 730,
          size: textFontSize,
        });

        // En-têtes du tableau
        const headers = [
          "Produit",
          "Quantité",
          "Total",
          "Versement",
          "Date Versement",
        ];
        const colWidths = [100, 80, 60, 60, 120];
        let y = tableStartY;

        headers.forEach((header, index) => {
          page.drawText(header, {
            x: tableStartX + colWidths.slice(0, index).reduce((a, b) => a + b, 0),
            y,
            size: textFontSize,
            color: rgb(0, 0, 0),
          });
        });

        y -= rowHeight;

        // Dessiner les données
        result.forEach((row) => {
          if (y < 50) {
            page = pdfDoc.addPage([600, 800]);
            y = tableStartY;
          }

          const values = [
            row.produit_nom || "",
            row.commande_quantite || "",
            row.commande_total || "",
            row.versement_montant || "",
            formatDateToFrench(row.date_versement) || "",
          ];

          values.forEach((value, colIndex) => {
            page.drawText(value.toString(), {
              x: tableStartX + colWidths.slice(0, colIndex).reduce((a, b) => a + b, 0),
              y,
              size: textFontSize,
              color: rgb(0, 0, 0),
            });
          });

          y -= rowHeight;
        });

        const pdfBytes = await pdfDoc.save();
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="rapport_${Date.now()}.pdf"`
        );
        res.end(Buffer.from(pdfBytes));
      } catch (err) {
        console.error("Erreur lors de la génération du PDF :", err);
        res.status(500).json({ message: "Erreur lors de la génération du PDF." });
      }
    } else if (format === "csv") {
      const fields = [
        "produit_nom",
        "commande_quantite",
        "commande_total",
        "versement_montant",
        "date_versement",
      ];
      const parser = new Parser({ fields });
      const csv = parser.parse(result);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="rapport_${Date.now()}.csv"`
      );
      res.send(csv);
    }
  } catch (error) {
    console.error("Erreur lors de la génération du rapport :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  } finally {
    if (connection) connection.release();
  }
});

/************************************cest la fin ** de pdf************************************ */
// revoir pour le modifier si cest necessair
// jai utiliser cursor theme et  dark atom dark green comme thieme

/************************************************************************************** */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});



