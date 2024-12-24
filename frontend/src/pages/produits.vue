<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page padding>
    <q-card>
    <q-toolbar>
      <q-btn label="Nouveau Produit"
      color="primary"
      class="text-center"
      @click="openAddDialog" />
    </q-toolbar>

    <q-table
      :rows="produits"
      :columns="columns"
      row-key="id"
      no-data-label="Aucun produits disponible"

      flat
      bordered
      :pagination="pagination"
      @update:pagination="val => pagination = val"
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn class="text-center q-mx-sm"
            title="Modifier le produit"
            icon="edit"
            color="primary"
            @click="editProduit(props.row)"
          />
          <q-btn
             title="Supprimer le produit"
            icon="delete"
            color="negative"
            @click="deleteProduit(props.row.id)"
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

    <q-dialog v-model="isDialogOpen">
      <q-card style="width: 80vw; max-width: 600px; height: 70vh; max-height: 500px;">
        <q-card-section>
          <div class="text-h6">{{ dialogTitle }}</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="produitForm.nom" label="Nom" outlined required/>
          <q-input v-model="produitForm.description" label="Description" outlined required/>
          <q-input v-model="produitForm.prix" label="Prix" type="number" outlined required/>
          <q-input v-model="produitForm.stock" label="Stock" type="number" outlined required/>



        </q-card-section>

        <q-card-actions align="right">
          <q-btn  label="Annuler" color="negative" @click="isDialogOpen = false" :loading="isDeleting"/>
          <q-btn  label="Enregistrer" color="primary" @click="saveProduit" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
  </q-page>
</template>

<script>
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
  created() {
    this.fetchProduit();
  },
  data() {
    return {
      produits: [],
      columns: [
        { name: 'id', required: true, label: 'Numero', align: 'left', field: row => row.id, format: val => `${val}`, sortable: true },
        { name: 'nom', label: 'Nom', align: 'left', field: 'nom' },
        { name: 'description', label: 'Description', align: 'left', field: 'description' },
        { name: 'prix', label: 'Prix', align: 'left', field: 'prix' },
        { name: 'stock', label: 'Quantite', align: 'left', field: 'stock' },
        { name: 'formattedDate', align: 'left', label: 'Date', field: 'formattedDate', sortable: true },
        { name: 'actions', label: 'Actions', align: 'center' }
      ],
      pagination: { page: 1, rowsPerPage: 10 },
      isDialogOpen: false,
      dialogTitle: 'Ajouter Produit',
      produitForm: { id: null, nom: '', description: '',prix:'',stock:''  }
    };
  },

  methods: {
    async fetchProduit() {
      try {
        const response = await axios.get('http://localhost:4000/api/produits');
       // Formatage de la date pour chaque archive
       this.produits = response.data.map(produit => ({
          ...produit,
          formattedDate: format(new Date(produit.date_creation), 'dd/MM/yyyy', { locale: fr })
        }));

      } catch (error) {
        console.error('Erreur lors de la récupération des produits :', error)
      }
    },
    openAddDialog() {
      this.dialogTitle = 'Ajouter produits';
      this.produitForm = { id: null, nom: '', description: '',prix:'',stock:'' };
      this.isDialogOpen = true;

    },
    editProduit(produit) {
      this.dialogTitle = 'Modifier Produits';
      this.produitForm = { ...produit };
      this.isDialogOpen = true;
    },
    async saveProduit() {
      try {
        if (this.produitForm.id) {
          await axios.put(`http://localhost:4000/api/produits/${this.produitForm.id}`, this.produitForm);
        } else {
          await axios.post('http://localhost:4000/api/produits', this.produitForm);
        }
        this.isDialogOpen = false;
        this.fetchProduit();
      } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'archive :", error);
      }
    },
    confirmDeleteProduit(id) {
      this.produitToDeleteId = id;
      this.isConfirmDialogOpen = true;
    },

  // fonction pour supprimer un produit
  async deleteProduit(id) {
    this.isDeleting = true;
    try {
      // Afficher le dialogue de confirmation
      const confirmed = await new Promise(resolve => {
        this.$q.dialog({
          title: 'Confirmation',
          message: 'Êtes-vous sûr de vouloir supprimer ce produit ?',
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
        await axios.delete(`http://localhost:4000/api/produits/${id}`);
        this.$q.notify({
          type: "positive",
          message: "produit supprimé avec succès.",
        });
        this.isConfirmDialogOpen = false;
        this.fetchProduit();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      this.$q.notify({
        type: "negative",
        message: "Erreur lors de la suppression du produit.",
      });
    }
    finally {
      this.produitToDeleteId = null; // Réinitialise l'ID après la suppression
    }
  },

  // fonction pour exporter  un ficher excel
  exportTable() {
      const rows = this.produits; // Les données à exporter
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

      const status = exportFile("produits-export.csv", content, "text/csv");

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
        if (!this.produits || this.produits.length === 0) {
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
        const rows = this.produits.map((produit) => {
          const row = {};
          this.columns.forEach((col) => {
            if (col.name !== 'actions') { // Ignorer les colonnes non pertinentes
              row[col.name] =
                typeof col.field === 'function'
                  ? col.field(produit)
                  : produit[col.field || col.name];
            }
          });
          return row;
        });

        // console.log('Colonnes pour le tableau :', columns);
       // console.log('Lignes pour le tableau :', rows);

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



  }
};
</script>

<style scoped>
/* Vous pouvez ajouter du style personnalisé ici */
</style>


