<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page class="q-pa-md q-mt-md">
  <q-card class="q-pa-md" >
    <q-form @submit.prevent="submitCommande" class="q-gutter-md">
      <q-select
        v-model="commande.client_id"
        :options="clientOptions"
        label="Client"
        option-value="id"
        option-label="nom"
        emit-value
        map-options
        required
              />
      <q-input
        v-model="commande.date_commande"
        label="Date Commande"
        type="date"
        outlined
        required
      />

      <q-select
        v-model="commande.statut"
        :options="statuts"
        label="Statut de la commande"
        outlined
        required
      />
      <q-input
        v-model="commande.total"
        label="Montant total"
        type="number"
        outlined
        required
      />
      <q-btn type="submit" label="Enregistrer" color="primary" />

    </q-form>
  </q-card>
</q-page>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    initialCommande: {
      type: Object,
      default: () => ({
        client_id: '',
        date_commande: '',
        statut: 'En cours',
        total: 0
      })
    },
    editMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      clientOptions:[],
      commande: { ...this.initialCommande },
      statuts: ['En cours', 'Complétée', 'Livrée', 'Annulée']
    };
  },
  created() {
    this.fetchClient();
  },
  methods: {
  // Récupère la liste de tous les clients
  async fetchClient() {
      try {
        const response = await axios.get('http://localhost:3000/api/client');
        this.clientOptions = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des produits :", error);
      }
    },

    async submitCommande() {
      try {
        if (this.editMode) {
          // Mettre à jour la commande
          await axios.put(`http://localhost:4000/api/commandes/${this.commande.id}`, this.commande);
          this.$q.notify({ type: 'positive', message: 'Commande mise à jour avec succès' });
        } else {
          // Ajouter une nouvelle commande
          await axios.post('http://localhost:4000/api/commandes', this.commande);
          this.$router.push('/commandes');
          this.$q.notify({ type: 'positive', message: 'Commande ajoutée avec succès' });

        }
        this.$emit('commande-saved');
      } catch (error) {
        this.$q.notify({ type: 'negative', message: 'Erreur lors de la sauvegarde de la commande' });
        console.error(error);
      }
    }
  }
};
</script>

<style scoped>
.q-card {
  max-width: 400px;
  margin: 0 auto;
}
.q-page {
  max-width: 400px;
  margin: 0 auto;
}
</style>
