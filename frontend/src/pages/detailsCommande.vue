<template>
  <q-page padding>
    <q-card>
    <!-- Bouton pour ouvrir le dialog pour ajouter un produit à la commande -->
    <q-toolbar>
      <q-btn label="Ajouter Detail" color="primary" @click="openDialog" />
    </q-toolbar>

    <!-- Dialog pour ajouter un produit -->
    <q-dialog v-model="dialogOpen">
      <q-card>
        <q-card-section>
          <div class="text-h6">Ajouter un Produit à la Commande</div>
        </q-card-section>

        <q-card-section>
    <q-form @submit="submitForms">
      <!-- Sélection de la commande -->
      <q-select
        v-model="detailsCommande.commande_id"
        :options="commandesOptions"
        label="Commande"
        option-value="id"
        option-label="nom_client"
        emit-value
        map-options
        outlined
        required
      />

      <!-- Sélection du produit -->
      <q-select
        v-model="detailsCommande.produit_id"
        :options="produitsOptions"
        label=" Produit"
        option-value="id"
        option-label="nom"
        emit-value
        map-options
        outlined
        required
      />

      <!-- Champs pour quantité et prix unitaire -->
      <q-input v-model="detailsCommande.quantite" label="Quantité" type="number" outlined required />
      <q-input v-model="detailsCommande.prix_unitaire" label="Prix Unitaire" type="number" outlined required />

      <div class="q-mt-md">
        <q-btn label="Ajouter Produit" color="primary" type="submit"  class="q-mx-sm" />
        <q-btn label="Annuler" color="negative" @click="closeDialog" />
      </div>
    </q-form>
   </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Liste des commandes avec bouton pour voir leurs détails -->
    <q-table
    :rows="commandes"
    :columns="columns"
    row-key="id"
    no-data-label="Aucun detail de commande disponible"
    >
      <template v-slot:body-cell-actions="props">
        <q-td align="center">
          <q-btn
          icon="visibility"
          color="primary"
          @click="showDetails(props.row.id)"
          title="Voir les details de la commande" />
        </q-td>
      </template>
    </q-table>

    <!-- Dialog pour afficher les détails de la commande -->
    <q-dialog v-model="detailDialogOpen">
      <q-card>
        <q-card-section>
          <div class="text-h6 text-center">Détails de la Commande</div>
        </q-card-section>

        <q-card-section>
          <q-table :rows="detailsCommande" :columns="detailsColumns" row-key="id" />
        </q-card-section>

        <q-card-actions>
          <q-btn label="Fermer" color="negative" @click="closeDetailDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
  </q-page>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      detailsCommande: {
        commande_id: null,
        produit_id: null,
        nom_produit: null,
        nom_client: null,
        quantite: null,
        prix_unitaire: null,
      },
      dialogOpen: false, // Etat du dialog pour ajouter un produit
      detailDialogOpen: false, // Etat du dialog pour afficher les détails de la commande
      commandesOptions: [],  // Pour stocker les options des commandes
      produitsOptions: [],
      commandes: [],  // Liste des commandes
      columns: [
        { name: 'id', label: ' Commande', align: 'left', field: 'id' },
        { name: 'nom_client', label: 'Client', align: 'left', field: 'nom_client' },
        { name: 'date_commande', label: 'Date', align: 'left', field: 'date_commande', format: val => new Date(val).toLocaleDateString() },
        { name: 'total', label: 'Total', align: 'left', field: 'total' },
        { name: 'actions', label: 'Actions', align: 'center' }
      ],
      detailsColumns: [
        { name: 'produit_id', label: 'Numero Produit', align: 'left', field: 'produit_id' },
        { name: 'nom_client', label: 'Nom Client', align: 'left', field: 'nom_client' },
        { name: 'nom_produit', label: 'Nom Produit', align: 'left', field: 'nom_produit' },
        { name: 'quantite', label: 'Quantité', align: 'left', field: 'quantite' },
        { name: 'prix_unitaire', label: 'Prix Unitaire', align: 'left', field: 'prix_unitaire' },
        { name: 'total', label: 'Total', align: 'left', field: 'total' }
      ]
    };
  },
  created() {
    this.fetchCommande();
    this.fetchCommandes();
    this.fetchProduits();
  },
  methods: {
    // Ouvrir le dialog pour ajouter un produit
    openDialog() {
      this.dialogOpen = true;
    },

    // Fermer le dialog
    closeDialog() {
      this.dialogOpen = false;
    },

    // Récupérer les commandes depuis l'API
    fetchCommande() {
      axios.get('http://localhost:4000/api/commandes')
        .then(response => {
          this.commandes = response.data;
        })
        .catch(error => {
          console.error('Erreur lors de la récupération des commandes', error);
        });
    },

    // Afficher les détails de la commande
    showDetails(idCommande) {
      axios.get(`http://localhost:4000/api/details_commande/${idCommande}`)
        .then(response => {
          // Ajouter un champ "total" calculé pour chaque ligne
          this.detailsCommande = response.data.map(detail => ({
            ...detail,
            total: detail.quantite * detail.prix_unitaire
          }));
          this.detailDialogOpen = true;
        })
        .catch(error => {
          console.error('Erreur lors de la récupération des détails de la commande', error);
        });
    },

    // Fermer le dialog des détails
    closeDetailDialog() {
      this.detailDialogOpen = false;
    },


     // Récupère la liste des commandes
     async fetchCommandes() {
      try {
        const response = await axios.get('http://localhost:4000/api/commandes');
        this.commandesOptions = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des commandes :", error);
      }
    },
    // Récupère la liste des produits
    async fetchProduits() {
      try {
        const response = await axios.get('http://localhost:4000/api/produits');
        this.produitsOptions = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des produits :", error);
      }
    },
    // Envoie les données au backend
    async submitForms() {
      try {
       axios.post('http://localhost:4000/api/details_commande', this.detailsCommande)
        .then(response => {
          this.fetchCommandes(); // Recharger les commandes
          this.closeDialog(); // Fermer le dialog après l'ajout
          this.$q.notify({
            type: 'positive',
            message: 'Produit ajouté à la commande avec succès'
          });
        })
        .catch(error => {
          console.error('Erreur lors de l\'ajout du produit', error);
          this.$q.notify({
            type: 'negative',
            message: 'Erreur lors de l\'ajout du produit'
          });
        });
        this.resetForm();
      } catch (error) {
        console.error("Erreur lors de l'ajout du produit :", error);
      }
    },
    resetForm() {
      this.detailsCommande = { commande_id: null, produit_id: null, quantite: null, prix_unitaire: null };
    },
    closeDialogs() {
      this.resetForm();
    },
  }
};
</script>

<style scoped>
.q-page {
  padding: 20px;
}

</style>
