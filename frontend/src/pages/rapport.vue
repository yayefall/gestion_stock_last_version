<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page padding>
      <!-- Toolbar -->
      <q-toolbar>
        <q-btn  class="container" label="Générer Rapport" color="primary" @click="openReportDialog" />
      </q-toolbar>

      <!-- Dialog pour générer un rapport -->
      <q-dialog v-model="isDialogOpen">
        <q-card style="width: 400px;">
          <q-card-section>
            <div class="text-h6">Générer un rapport</div>
          </q-card-section>

          <!-- Formulaire -->
          <q-card-section>
            <q-input v-model="reportForm.debut" label="Date de début" type="date" />
            <q-input v-model="reportForm.fin" label="Date de fin" type="date" />
            <q-select
              v-model="reportForm.format"
              :options="['pdf', 'csv']"
              label="Format"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Annuler" color="negative" @click="isDialogOpen = false" />
            <q-btn flat label="Générer" color="primary" @click="generateReport" />
          </q-card-actions>
        </q-card>
      </q-dialog>
  </q-page>
</template>
<script>
import axios from "axios";

export default {
  data() {
    return {
      isDialogOpen: false,
      reportForm: {
        debut: '',
        fin: '',
        format: 'pdf',  // Format par défaut (pdf ou csv)
      },
    };
  },
  methods: {
    // Ouvrir le dialog pour générer un rapport
    openReportDialog() {
      this.isDialogOpen = true;
    },

    // Fonction pour générer le rapport
    async generateReport() {
      const { debut, fin, format } = this.reportForm;

      // Vérifier que tous les champs sont remplis
      if (!debut || !fin || !format) {
        this.$q.notify({
          type: "negative",
          message: "Tous les champs sont obligatoires !",
        });
        return;
      }

      try {
        // Faire l'appel API pour générer le rapport
        const response = await axios.get("http://localhost:4000/api/rapports", {
          params: { debut, fin, format },
          responseType: 'blob', // Indiquer que la réponse est un fichier
        });

        // Créer un lien pour télécharger le fichier
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `rapport_${Date.now()}.${format}`);
        document.body.appendChild(link);
        link.click();

        // Fermer le dialog après génération du rapport
        this.isDialogOpen = false;
      } catch (error) {
        console.error("Erreur lors de la génération du rapport", error);
        this.$q.notify({
          type: "negative",
          message: "Erreur lors de la génération du rapport.",
        });
      }
    },
  },
};
</script>

<style scoped>
  .q-card {
    max-width: 500px;
    margin: auto;
  }

</style>
