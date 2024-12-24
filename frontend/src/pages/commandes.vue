<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page padding>
  <q-card>
    <q-toolbar>
      <q-btn label="Nouvelle Commande" color="primary" @click="openCommandeForm" />
    </q-toolbar>

    <!-- Dialog pour ajouter une nouvelle commande -->
    <q-dialog v-model="showForm" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6 text-center  ">Nouvelle Commande</div>
        </q-card-section>

        <q-card-section>
          <AjoutCommande
            :initialCommande="selectedCommande"
            :editMode="isEditMode"
            @commande-saved="handleCommandeSaved"
            @close-dialog="closeCommandeForm"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn  label="Annuler" color="negative" @click="closeCommandeForm" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Tableau pour afficher les commandes -->

    <q-table
      :rows="commandes"
      :columns="columns"
      row-key="id"
      no-data-label="Aucun  commandes disponible"

      flat
      bordered
      class="bg-primary-8"
    >
      <template v-slot:body-cell-actions="props">
        <q-td align="right" style="white-space: nowrap;">
          <q-btn
           class="q-mx-sm"
           icon="edit"
           color="primary"
           @click="editCommande(props.row)" />

          <q-btn
          icon="delete"
          color="negative"
          @click="deleteCommande(props.row.id)" />
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
  </q-card>
  </q-page>
</template>
<script>
import AjoutCommande from '../pages/ajoutCommande.vue';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { exportFile } from 'quasar';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function wrapCsvValue(val, formatFn, row) {
  // eslint-disable-next-line no-void
  let formatted = formatFn !== void 0 ? formatFn(val, row) : val;

  // eslint-disable-next-line no-void
  formatted = formatted === void 0 || formatted === null ? '' : String(formatted);

  formatted = formatted.split('"').join('""');

  return `"${formatted}"`;
}

export default {
  components: {
    AjoutCommande,
  },
  data() {
    return {
      showForm: false,
      isEditMode: false,
      selectedCommande: null,
      commandes: [],
      columns: [
        { name: 'id', required: true, label: 'Commande', align: 'left', field: row => row.id, format: val => `${val}`, sortable: true },
        { name: 'nom_client', label: 'Client', align: 'left', field: 'nom_client', sortable: true },
        { name: 'date_commande', label: 'Date Commande', align: 'left', field: 'date_commande', format: val => new Date(val).toLocaleDateString(), sortable: true },
        { name: 'statut', label: 'Statut', align: 'left', field: 'statut', sortable: true },
        // { name: 'formattedDate', align: 'left', label: 'Date', field: 'formattedDate', sortable: true ,format: val => new Date(val).toLocaleDateString()},
        { name: 'total', label: 'Somme (FCFA)', align: 'left', field: 'total', sortable: true },
        { name: 'actions', label: 'Actions', align: 'right' },
      ],
    };
  },
  created() {
    this.fetchCommandes();
  },
  methods: {
    formatDate(date) {
      return new Intl.DateTimeFormat('fr-FR').format(new Date(date));
    },
    openCommandeForm() {
      this.selectedCommande = null;
      this.isEditMode = false;
      this.showForm = true;
    },
    closeCommandeForm() {
      this.showForm = false;
      this.selectedCommande = null;
      this.isEditMode = false;
    },
    handleCommandeSaved() {
      this.fetchCommandes();
      this.closeCommandeForm();
    },
    editCommande(commande) {
      this.selectedCommande = commande;
      this.isEditMode = true;
      this.showForm = true;
    },

    // fonction pour supprimer une commande
  async deleteCommande(id) {
    try {
      // Afficher le dialogue de confirmation
      const confirmed = await new Promise(resolve => {
        this.$q.dialog({
          title: 'Confirmation',
          message: 'Êtes-vous sûr de vouloir supprimer cette commande ?',
          ok: {
            label: 'Confirmer',
            color: 'negative'
          },
          cancel: {
            label: 'Annuler',
            color: 'primary'
          },
          persistent: true
        }).onOk(() => resolve(true))
          .onCancel(() => resolve(false));
      });

      if (confirmed) {
        await axios.delete(`http://localhost:4000/api/commandes/${id}`);
        this.$q.notify({
          type: "positive",
          message: "Commande supprimé avec succès.",
        });
        this.fetchCommandes();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      this.$q.notify({
        type: "negative",
        message: "Erreur lors de la suppression de la commande.",
      });
    }
  },

  // fonction lister les commandes
    async fetchCommandes() {
      try {
        const response = await axios.get('http://localhost:4000/api/commandes');
        this.commandes = response.data.map(commande => ({
          ...commande,
          formattedDate: format(new Date(commande.date_creation), 'dd/MM/yyyy', { locale: fr }),
        }));
      } catch (error) {
        console.error('Erreur lors de la récupération des commandes :', error);
      }
    },
    exportTable() {
      const rows = this.commandes; // Les données à exporter
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

      const status = exportFile("commandes-export.csv", content, "text/csv");

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

   exportToPDF() {
        // Vérifiez si les commandes sont disponibles
        if (!this.commandes || this.commandes.length === 0) {
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
        const rows = this.commandes.map((commande) => {
          const row = {};
          this.columns.forEach((col) => {
            if (col.name !== 'actions') { // Ignorer les colonnes non pertinentes
              row[col.name] =
                typeof col.field === 'function'
                  ? col.field(commande)
                  : commande[col.field || col.name];
            }
          });
          return row;
        });

       // Ajout du titre
        doc.text('Liste des produits', 14, 10);

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
        doc.save('produits-export.pdf');

        this.$q.notify({
          message: 'Fichier PDF téléchargé avec succès !',
          color: 'positive',
          icon: 'cloud_download',
        });
      }

  },
};
</script>
