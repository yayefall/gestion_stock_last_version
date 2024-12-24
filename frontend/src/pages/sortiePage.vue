<!-- eslint-disable no-undef -->
<template>
  <q-page padding>
    <q-card>
      <q-toolbar>
        <q-btn label="Ajouter Mouvement" color="primary" @click="openDialog" />
      </q-toolbar>
      <q-card-section>

        <!-- Table des mouvements -->
        <q-table
          :rows="mouvements"
          :columns="columns"
          row-key="id"
          no-data-label="Aucun mouvement de stock disponible"
        >
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              icon="delete"
              color="negative"
              @click="deleteMouvement(props.row.id)"
            />
          </q-td>
        </template>
        <template v-slot:top-right>
        <q-btn
          class="q-mx-sm"
          title="Exporter en fichier Excel"
          color="primary"
          icon-right="archive"
          no-caps
          @click="exportTable"
        />
        <q-btn

        title="Télécharger en fichier PDF"
        color="primary"
        icon="picture_as_pdf"
        no-caps
        @click="exportToPDF"
        />
      </template>
        </q-table>
     </q-card-section>
      <!-- Dialog pour ajouter un mouvement -->
      <q-dialog v-model="dialog" persistent>
        <q-card style="min-width:500px">
          <q-card-section>
            <div class="text-h6 text-center">Ajouter un Mouvement</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="saveStockMovement">
              <q-select
                v-model="mouvement.produit_id"
                :options="produitsOptions"
                label="Produit"
                option-label="nom"
                option-value="id"
                map-options
                required
              />

              <q-input
               v-model="mouvement.date"
               label="Date"
               type="date" required />

              <q-select
                v-model="mouvement.type"
                 :options="['entrée', 'sortie']"
                label="Type de Mouvement"
                required
              />

              <q-input v-model="mouvement.quantite" label="Quantité" type="number" required />
              <q-input v-model="mouvement.commentaire" label="Commentaire" type="text" />

              <div class="q-mt-md">
                <q-btn label="Enregistrer" color="primary" type="submit"  class="q-mx-sm"/>
                <q-btn label="Annuler" color="negative" @click="closeDialog" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-card>
  </q-page>
</template>

<script>
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { exportFile } from 'quasar';


function wrapCsvValue(val, formatFn, row) {
  // eslint-disable-next-line no-void
  let formatted = formatFn !== void 0 ? formatFn(val, row) : val;

  // eslint-disable-next-line no-void
  formatted = formatted === void 0 || formatted === null ? '' : String(formatted);

  formatted = formatted.split('"').join('""');

  return `"${formatted}"`;
}

export default {
  data() {
    return {
      mouvements: [],
      produits: [], // Liste des produits
      produitsOptions: [], // Liste des produits pour le dialogue mouvement
      mouvement: {
        produit_id: null,
        date: "",
        type: "",
        quantite: null,
        commentaire: "",
      },
      columns: [
        { name: 'id', label: 'Numéro', align: 'left', field: 'id' },
        { name: 'produit_nom', label: 'Nom du Produit', align: 'left', field: 'produit_nom' },
        { name: 'date', label: 'Date', align: 'left', field: 'date', format: (val) => new Date(val).toLocaleDateString() },
        { name: 'type', label: 'Type', align: 'left', field: 'type' },
        { name: 'quantite', label: 'Quantité', align: 'right', field: 'quantite' },
        { name: 'commentaire', label: 'Commentaire', align: 'left', field: 'commentaire' },
        { name: 'actions', label: 'Actions', align: 'center' },

      ],
      dialog: false,
     /* typesMouvement: [
        { label: 'Entrée', value: 'entrée' },
        { label: 'Sortie', value: 'sortie' },
      ], */
    };
  },
  created() {
    this.fetchMouvements();
    this.fetchProduits();
  },
  methods: {
    // afficher tous les mouvements stock
    async fetchMouvements() {
      try {
        const response = await axios.get('http://localhost:4000/api/mouvements_stock');
        this.mouvements = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des mouvements de stock :', error);
        this.$q.notify({
          type: 'negative',
          message: 'Erreur lors de la récupération des mouvements de stock',
        });
      }
    },

   // Méthode pour récupérer tous les produits
     async fetchProduits() {
      try {
        const response = await axios.get("http://localhost:4000/api/produits");
        this.produitsOptions = response.data;
        console.log('liste produit:', this.produitsOptions)
      } catch (error) {
        console.error("Erreur lors de la récupération des produits :", error);
        this.$q.notify({
          message: "Impossible de charger les produits.",
          color: "negative",
          icon: "error",
        });
      }
    },

    openDialog() {
      this.dialog = true;
    },

    closeDialog() {
      this.dialog = false;
      this.resetForm();
    },

       // fonction pour exporter  un ficher excel
  exportTable() {
      const rows = this.mouvements; // Les données à exporter
      const columns = this.columns; // Les colonnes pour le fichier CSV

      const content = [
        columns.map((col) => wrapCsvValue(col.label)), // Entêtes
        ...rows.map((row) =>
          columns.map((col) =>
            wrapCsvValue(
              typeof col.field === "function" ? col.field(row) : row[col.field || col.name],
              col.format,
              row
            )
          ).join(",")
        ),
      ].join("\r\n");

      const status = exportFile("mouvement-stock-export.csv", content, "text/csv");

      if (status !== true) {
        this.$q.notify({
          message: "Téléchargement refusé par le navigateur...",
          color: "negative",
          icon: "warning",
        });
      } else {
        this.$q.notify({
          message: "Fichier téléchargé avec succès !",
          color: "positive",
          icon: "cloud_download",
        });
      }
    },

    // fonction pour exporter les produits en pdf
     exportToPDF() {
        // Vérifiez si les produits sont disponibles
        if (!this.mouvements || this.mouvements.length === 0) {
          this.$q.notify({
            message: 'Aucune donnée à exporter.',
            color: 'negative',
            icon: 'warning',
          });
          return;
        }

        // eslint-disable-next-line new-cap
        const doc = new jsPDF();

        // Colonnes du tableau
        const columns = this.columns
          .filter((col) => col.name !== 'actions') // Exclure les colonnes inutiles
          .map((col) => ({
            header: col.label,
            dataKey: col.name,
          }));

        // Lignes du tableau
        const rows = this.mouvements.map((mouvement) => {
          const row = {};
          this.columns.forEach((col) => {
            if (col.name !== 'actions') { // Ignorer les colonnes non pertinentes
              row[col.name] =
                typeof col.field === 'function'
                  ? col.field(mouvement)
                  : mouvement[col.field || col.name];
            }
          });
          return row;
        });

        // console.log('Colonnes pour le tableau :', columns);
       // console.log('Lignes pour le tableau :', rows);

        // Ajout du titre
        doc.text('Liste des Clients', 14, 10);

        // Génération du tableau
        doc.autoTable({
          columns,
          body: rows,
          startY: 20,
          theme: 'grid',
          styles: { fontSize: 10 },
          headStyles: {
            fillColor: [41, 128, 185], // Couleur d'arrière-plan
            textColor: [255, 255, 255], // Couleur du texte
          },
        });

        // Téléchargement du fichier PDF
        doc.save('Mouvement-stock-export.pdf');

        this.$q.notify({
          message: 'Fichier PDF téléchargé avec succès !',
          color: 'positive',
          icon: 'cloud_download',
        });
      },

  // Envoie les données au backend
    // Fonction qui ajoute un nouveau mouvement de stock

    async saveStockMovement() {
      try {
        // Validation basique des champs
        if (!this.mouvement.produit_id || !this.mouvement.date || !this.mouvement.type || !this.mouvement.quantite) {
          this.$q.notify({
            message: "Veuillez remplir tous les champs obligatoires.",
            color: "negative",
            icon: "warning",
          });
          return;
        }

        const payload = {
          produit_id: this.mouvement.produit_id.id, // L'ID est directement utilisé
          date: this.mouvement.date,
          type: this.mouvement.type,
          quantite: this.mouvement.quantite,
          commentaire: this.mouvement.commentaire,
        };

        // Envoi des données à l'API pour enregistrer le mouvement
        const response = await axios.post("http://localhost:4000/api/mouvements_stock", payload);
        await this.fetchMouvements();
        // Notification de succès
        this.$q.notify({
          message: response.data.message,
          color: "positive",
          icon: "check_circle",
        });

        // Rafraîchir la liste des produits pour mettre à jour les stocks
        await this.fetchProduits();

        // Fermer le formulaire
        this.closeDialog();
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du mouvement de stock :", error);

        // Gérer les erreurs avec les messages de l'API
        const errorMessage = error.response?.data?.message || "Erreur interne du serveur.";
        this.$q.notify({
          message: errorMessage,
          color: "negative",
          icon: "error",
        });
      }
    },
    async deleteMouvement(id) {
      try {
        await axios.delete(`http://localhost:4000/api/mouvement_stock/${id}`);
        this.fetchMouvements();
      } catch (error) {
        console.error("Erreur lors de la suppression du mouvement de stock :", error);
      }
    },

    resetForm() {
      this.mouvement = {
        produit_id: null,
        date: "",
        type: "",
        quantite: null,
        commentaire: "",
      };
    },

  },
};
</script>

<style scoped>
.q-page {
  padding: 20px;
}

.success {
  color: green;
}

.error {
  color: red;
}
</style>
