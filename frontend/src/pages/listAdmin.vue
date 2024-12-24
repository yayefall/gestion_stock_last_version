<template>
  <q-page padding>
  <q-card>
    <q-toolbar>
      <q-btn label="Ajouter Profil" color="primary" to="/admin"/>
    </q-toolbar>

    <q-table
      :rows="users"
      :columns="columns"
      row-key="id"
      no-data-label="Aucun utilisateur disponible"

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
            @click="editAdmin(props.row)"
          />
          <q-btn
            icon="delete"
            color="negative"
            @click="deleteAdmin(props.row.id)"
          />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="isDialogOpen">
      <q-card style="width: 80vw; max-width: 600px; height: 70vh; max-height: 500px;">
        <q-card-section>
          <div class="text-h6">{{ dialogTitle }}</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="adminForm.nom" label="Nom" />
          <q-input v-model="adminForm.prenom" label="Prenom " />
          <q-input v-model="adminForm.username" label="Username" />
          <q-input v-model="adminForm.password" label="Password" type="password" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn  label="Annuler" color="negative" @click="isDialogOpen = false" :loading="isDeleting"/>
          <q-btn  label="Creer" color="primary" @click="saveAdmin" />
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

export default {
  data() {
    return {
      users: [],
      columns: [
        { name: 'id', required: true, label: 'Numero', align: 'left', field: row => row.id, format: val => `${val}`, sortable: true },
        { name: 'nom', label: 'Nom ', align: 'left', field: 'nom' },
        { name: 'prenom', label: 'Prenom', align: 'left', field: 'prenom' },
        { name: 'username', label: 'Username', align: 'left', field: 'username' },
        { name: 'email', label: 'Email', align: 'left', field: 'email' },
        { name: 'formattedDate', align: 'left', label: 'Date', field: 'formattedDate', sortable: true , format: val => new Date(val).toLocaleDateString() },
        { name: 'actions', label: 'Actions', align: 'center' }
      ],
      pagination: { page: 1, rowsPerPage: 10 },
      isDialogOpen: false,
      dialogTitle: 'Ajouter Profil',
      adminForm: { id: null, nom: '',prenom:'',username:'', email:'', password:''}
    };
  },
  created() {
    this.fetchAdmin();
  },
  methods: {
    async fetchAdmin() {
      try {
        const response = await axios.get('http://localhost:4000/api/admin');
       // Formatage de la date pour chaque admin
       this.users = response.data.map(user => ({
          ...user,
          formattedDate: format(new Date(user.date), 'PPpp', { locale: fr })
        }));

      } catch (error) {
        console.error('Erreur lors de la récupération des profil :', error);
      }
    },
    openAddDialog() {
      this.dialogTitle = 'Ajouter Profil';
      this.adminForm = { id: null, nom: '',prenom:'',username:'',email:'', password:'' };
      this.isDialogOpen = true;
    },
    editAdmin(user) {
      this.dialogTitle = 'Modifier Profil';
      this.adminForm = { ...user };
      this.isDialogOpen = true;
    },
    async saveAdmin() {
      try {
        if (this.adminForm.id) {
          await axios.put(`http://localhost:4000/api/admin/${this.adminForm.id}`, this.adminForm);
        } else {
          await axios.post('http://localhost:4000/api/admin', this.adminForm);
        }
        this.isDialogOpen = false;
        this.fetchAdmin();
      } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'profil :", error);
      }
    },
    confirmDeleteAdmin(id) {
      this.adminToDeleteId = id;
      this.isConfirmDialogOpen = true;
    },

    async deleteAdmin(id) {
    this.isDeleting = true;
    try {
      // Afficher le dialogue de confirmation
      const confirmed = await new Promise(resolve => {
        this.$q.dialog({
          title: 'Confirmation',
          message: 'Êtes-vous sûr de vouloir supprimer ce profil ?',
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
        await axios.delete(`http://localhost:4000/api/admin/${id}`);
        this.$q.notify({
          type: "positive",
          message: "profil supprimé avec succès.",
        });
        this.isConfirmDialogOpen = false;
        this.fetchAdmin();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      this.$q.notify({
        type: "negative",
        message: "Erreur lors de la suppression du profil.",
      });
    }
    finally {
      this.adminToDeleteId = null; // Réinitialise l'ID après la suppression
    }
  },

 /*  async deleteAdmin(id) {
    this.isDeleting = true;
    try {
      await axios.delete(`http://localhost:4000/api/admin/${id}`);
      this.isConfirmDialogOpen = false;
      this.fetchAdmin();
      this.$q.notify({
        type: 'positive',
        message: 'profil supprimée avec succès',
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'profil :", error);
      this.$q.notify({
        type: 'negative',
        message: 'Erreur lors de la suppression de l\'profil',
      });
    }
    finally {
      this.adminToDeleteId = null; // Réinitialise l'ID après la suppression
    }
  } */

  }
};
</script>

<style scoped>
/* Vous pouvez ajouter du style personnalisé ici */
</style>
