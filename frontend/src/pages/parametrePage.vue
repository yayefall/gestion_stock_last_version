<template>
  <div>
    <q-table
      :rows="parametres"
      :columns="columns"
      row-key="cle"
    />
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      parametres: [],
      columns: [
        { name: 'cle', label: 'Clé', align: 'left', field: 'cle' },
        { name: 'valeur', label: 'Valeur', align: 'left', field: 'valeur' },
        { name: 'description', label: 'Description', align: 'left', field: 'description' },
      ],
    };
  },
  methods: {
    async fetchParametres() {
      try {
        const response = await axios.get('http://localhost:4000/api/parametres');
        this.parametres = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des paramètres :', error);
      }
    },
  },
  mounted() {
    this.fetchParametres();
  },
};
</script>
