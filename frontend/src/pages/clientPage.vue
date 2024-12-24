<template>
  <q-page padding>
    <q-card>
      <!-- Toolbar -->
      <q-toolbar>
        <!-- Bouton pour ouvrir le formulaire dans un dialog -->
        <q-btn label="Ajouter Client" color="primary" @click="openAddDialog" />
      </q-toolbar>

      <!-- Table des clients -->
      <q-table
        :rows="users"
        :columns="columns"
        row-key="id"
        no-data-label="Aucun clients disponible"

        flat
        bordered
        :pagination="pagination"
        @update:pagination="val => pagination = val"
      >
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              class="q-mx-sm"
              icon="edit"
              color="primary"
              @click="editClient(props.row)"
            />
            <q-btn
              icon="delete"
              color="negative"
              @click="deleteClient(props.row.id)"
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

      <!-- Dialog pour ajouter ou modifier un client -->
      <q-dialog v-model="isDialogOpen">
        <q-card style="width: 80vw; max-width: 600px; height: 70vh; max-height: 500px;">
          <!-- Titre du dialog -->
          <q-card-section>
            <div class="text-h6">{{ dialogTitle }}</div>
          </q-card-section>

          <!-- Formulaire du client -->
          <q-card-section>
            <q-input v-model="adminForm.nom" label="nom"  outlined required/>
            <q-input v-model="adminForm.email" label="Email" outlined required />
            <q-input v-model="adminForm.telephone" label="Téléphone" outlined required />
            <q-input v-model="adminForm.adresse" label="Adresse" outlined required />
            <q-input v-model="adminForm.date" label="Date" type="date" outlined required />

          </q-card-section>

          <!-- Boutons d'action -->
          <q-card-actions align="right">
            <q-btn  label="Annuler" color="negative" @click="isDialogOpen = false" />
            <q-btn  label="Enregistrer" color="primary" @click="saveClient" />
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
  data() {
    return {
      users: [],
      columns: [
        { name: 'nom', label: 'Nom', align: 'left', field: 'nom' },
        { name: 'email', label: 'Email', align: 'left', field: 'email' },
        { name: 'telephone', label: 'Téléphone', align: 'left', field: 'telephone' },
        { name: 'adresse', label: 'Adresse', align: 'left', field: 'adresse' },
        { name: 'date', label: 'Date', align: 'left', field: 'date', sortable: true ,format: (val) => new Date(val).toLocaleDateString()},
        { name: 'actions', label: 'Actions', align: 'center' },
      ],
      pagination: { page: 1, rowsPerPage: 10 },
      isDialogOpen: false,
      dialogTitle: 'Ajouter Client',
      adminForm: { id: null, nom:'', email: '', telephone: '', adresse: '' ,date:""},
    };
  },
  created() {
    this.fetchClient();
  },
  methods: {
    async fetchClient() {
      try {
        const response = await axios.get('http://localhost:4000/api/client');
        this.users = response.data.map(user => ({
          ...user,
          formattedDate: format(new Date(user.date), 'PPpp', { locale: fr }),
        }));
      } catch (error) {
        console.error('Erreur lors de la récupération des clients :', error);
      }
    },
    openAddDialog() {
      this.dialogTitle = 'Ajouter Client';
      this.adminForm = { id: null, nom: '', email: '', telephone: '', adresse: '' ,date:''};
      this.isDialogOpen = true;
    },
    editClient(user) {
      this.dialogTitle = 'Modifier Client';
      this.adminForm = { ...user };
      this.isDialogOpen = true;
    },
    async saveClient() {
      try {
        if (this.adminForm.id) {
          await axios.put(`http://localhost:4000/api/client/${this.adminForm.id}`, this.adminForm);
        } else {
          await axios.post('http://localhost:4000/api/client', this.adminForm);
        }
        this.isDialogOpen = false;
        this.fetchClient();
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du client :", error);
      }
    },

    // fonction pour supprimer un versement
  async deleteClient(id) {
    try {
      // Afficher le dialogue de confirmation
      const confirmed = await new Promise(resolve => {
        this.$q.dialog({
          title: 'Confirmation',
          message: 'Êtes-vous sûr de vouloir supprimer ce client ?',
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
        await axios.delete(`http://localhost:4000/api/client/${id}`);
        this.$q.notify({
          type: "positive",
          message: "client supprimé avec succès.",
        });
        this.fetchClient();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      this.$q.notify({
        type: "negative",
        message: "Erreur lors de la suppression du client.",
      });
    }
  },

    // fonction pour exporter  un ficher excel
   exportTable() {
      const rows = this.users; // Les données à exporter
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

      const status = exportFile("Clients-export.csv", content, "text/csv");

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
        if (!this.users || this.users.length === 0) {
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
        const rows = this.users.map((user) => {
          const row = {};
          this.columns.forEach((col) => {
            if (col.name !== 'actions') { // Ignorer les colonnes non pertinentes
              row[col.name] =
                typeof col.field === 'function'
                  ? col.field(user)
                  : user[col.field || col.name];
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
        doc.save('Clients-export.pdf');

        this.$q.notify({
          message: 'Fichier PDF téléchargé avec succès !',
          color: 'positive',
          icon: 'cloud_download',
        });
      }

  },
};
</script>

<style scoped>
/* Ajouter vos styles personnalisés ici */
</style>
