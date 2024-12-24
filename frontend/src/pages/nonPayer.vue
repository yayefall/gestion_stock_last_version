<template>
  <q-page padding>
    <q-card>
      <q-toolbar>
        <q-btn label="Nouveau Impayé" color="primary" @click="openDialog" />
      </q-toolbar>

      <!-- Table des impayés -->
      <q-table
        :rows="impayes"
        :columns="columns"
        row-key="id"
        no-data-label="Aucun produit impayé disponible"
        flat
        bordered
      >
        <template v-slot:body-cell-actions="props">
          <q-td align="right" style="white-space: nowrap;">
            <q-btn
              class="q-mx-sm"
              icon="edit"
              color="primary"
              @click="editImpaye(props.row)"
            />
            <q-btn
              icon="delete"
              color="negative"
              @click="deleteImpaye(props.row.id)"
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

      <!-- Dialog pour ajouter/modifier un impayé -->
      <q-dialog v-model="isDialogOpen">
        <q-card style="width: 80vw; max-width: 500px;">
          <q-card-section>
            <div class="text-h6">{{ dialogTitle }}</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="submitForm">
              <q-input
                v-model="impayeForm.client"
                label="Client"
                outlined
                required
              />
              <q-select
                v-model="impayeForm.produit_id"
                :options="produitOptions"
                label="Produit"
                option-value="id"
                option-label="nom"
                emit-value
                map-options
                outlined
                required
              />
              <q-input
                v-model="impayeForm.montant"
                label="Montant"
                type="number"
                outlined
                required
              />
              <q-input
                v-model="impayeForm.date"
                label="Date"
                type="date"
                outlined
                required
              />
              <q-input
                v-model="impayeForm.commentaire"
                label="Commentaire"
                type="textarea"
                outlined
              />

              <q-card-actions align="right">
                <q-btn label="Annuler" color="negative" @click="closeDialog" />
                <q-btn type="submit" label="Enregistrer" color="primary" />
              </q-card-actions>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-card>
  </q-page>
</template>

<script>
import axios from 'axios';
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
  data() {
    return {
      impayes: [],
      produitOptions: [],
      isDialogOpen: false,
      dialogTitle: 'Ajouter un Impayé',
      impayeForm: {
        client: '',
        produit_id: null,
        montant: null,
        date: '',
        commentaire: ''
      },
      columns: [
        { name: 'id', label: 'N°', field: 'id', sortable: true },
        { name: 'client', label: 'Client', field: 'client', sortable: true },
        { name: 'produit', label: 'Produit', field: 'nom_produit', sortable: true },
        { name: 'montant', label: 'Montant', field: 'montant', sortable: true },
        { name: 'date', label: 'Date', field: 'date', format: val => new Date(val).toLocaleDateString(), sortable: true },
        { name: 'commentaire', label: 'Commentaire', field: 'commentaire' },
        { name: 'actions', label: 'Actions', align: 'right' }
      ]
    };
  },

  created() {
    this.fetchImpayes();
    this.fetchProduits();
  },

  methods: {
    async fetchImpayes() {
      try {
        const response = await axios.get('http://localhost:4000/api/impayes');
        this.impayes = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des impayés:', error);
        this.$q.notify({
          type: 'negative',
          message: 'Erreur lors de la récupération des impayés'
        });
      }
    },


    async fetchProduits() {
      try {
        const response = await axios.get('http://localhost:4000/api/produits');
        this.produitOptions = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
      }
    },

    openDialog() {
      this.dialogTitle = 'Ajouter un Impayé';
      this.impayeForm = {
        client: '',
        produit_id: null,
        montant: null,
        date: '',
        commentaire: ''
      };
      this.isDialogOpen = true;
    },

    closeDialog() {
      this.isDialogOpen = false;
    },

    editImpaye(impaye) {
      this.dialogTitle = 'Modifier l\'Impayé';
      this.impayeForm = { ...impaye };
      this.isDialogOpen = true;
    },

    async submitForm() {
      try {
        if (this.impayeForm.id) {
          await axios.put(`http://localhost:4000/api/impayes/${this.impayeForm.id}`, this.impayeForm);
        } else {
          await axios.post('http://localhost:4000/api/impayes', this.impayeForm);
        }
        this.fetchImpayes();
        this.closeDialog();
        this.$q.notify({
          type: 'positive',
          message: this.impayeForm.id ? 'Impayé modifié avec succès' : 'Impayé ajouté avec succès'
        });
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement:', error);
        this.$q.notify({
          type: 'negative',
          message: 'Erreur lors de l\'enregistrement'
        });
      }
    },

// fonction pour supprimer un produit impayer
    async deleteImpaye(id) {
      try {
      // Afficher le dialogue de confirmation
      const confirmed = await new Promise(resolve => {
        this.$q.dialog({
          title: 'Confirmation',
          message: 'Êtes-vous sûr de vouloir supprimer ce produit impayer ?',
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
        await axios.delete(`http://localhost:4000/api/impayes/${id}`);
        this.$q.notify({
          type: "positive",
          message: "produit impayer supprimé avec succès.",
        });
        this.fetchImpayes();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      this.$q.notify({
        type: "negative",
        message: "Erreur lors de la suppression du produit impayer.",
      });
    }
  },


    exportTable() {
      const content = [
        this.columns.map(col => wrapCsvValue(col.label)),
        ...this.impayes.map(row =>
          this.columns.map(col =>
            wrapCsvValue(
              typeof col.field === 'function' ? col.field(row) : row[col.field || col.name],
              col.format,
              row
            )
          ).join(',')
        )
      ].join('\r\n');

      const status = exportFile('impayes-export.csv', content, 'text/csv');

      if (status !== true) {
        this.$q.notify({
          message: 'Téléchargement refusé par le navigateur...',
          color: 'negative',
          icon: 'warning'
        });
      } else {
        this.$q.notify({
          message: 'Fichier téléchargé avec succès !',
          color: 'positive',
          icon: 'cloud_download'
        });
      }
    },

    exportToPDF() {
      if (!this.impayes || this.impayes.length === 0) {
        this.$q.notify({
          message: 'Aucune donnée à exporter.',
          color: 'negative',
          icon: 'warning'
        });
        return;
      }

      // eslint-disable-next-line new-cap
      const doc = new jsPDF();
      const columns = this.columns
        .filter(col => col.name !== 'actions')
        .map(col => ({
          header: col.label,
          dataKey: col.name
        }));

      const rows = this.impayes.map(impaye => {
        const row = {};
        this.columns.forEach(col => {
          if (col.name !== 'actions') {
            row[col.name] = typeof col.field === 'function'
              ? col.field(impaye)
              : impaye[col.field || col.name];
          }
        });
        return row;
      });

      doc.text('Liste des Impayés', 14, 10);
      doc.autoTable({
        columns,
        body: rows,
        startY: 20,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255]
        }
      });

      doc.save('impayes-export.pdf');
      this.$q.notify({
        message: 'Fichier PDF téléchargé avec succès !',
        color: 'positive',
        icon: 'cloud_download'
      });
    }
  }
};
</script>

<style scoped>
.q-page {
  padding: 20px;
}
</style>
