<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page padding>
    <q-card>
      <!-- Barre d'outils avec le bouton pour ouvrir le dialog -->
     <q-toolbar>
        <q-btn label="Ajouter Versement" color="primary" @click="openDialog" />
        <q-btn class="container q-ml-md" label="Générer Rapport" color="primary" @click="openReportDialog" />

      <!--  <q-input
          v-model="searchTerm"
          label="Rechercher un versement"
          debounce="300"
          clearable
          outlined
          class="q-ml-sm"
          @input="filterVersements"
        />-->
      </q-toolbar>

     <!-- Dialog pour générer un rapport -->
     <q-dialog v-model="isDialogOpens">
        <q-card style="width: 400px;">
          <q-card-section>
            <div class="text-h6">Générer un rapport</div>
          </q-card-section>

          <!-- Formulaire -->
          <q-card-section>
            <q-input v-model="reportForm.debut" label="Date de début" type="date" outlined />
            <q-input v-model="reportForm.fin" label="Date de fin" type="date" outlined />
            <q-select
              v-model="reportForm.format"
              :options="['pdf', 'csv']"
              label="Format"
              outlined
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn  label="Annuler" color="negative" @click="isDialogOpens = false" />
            <q-btn  label="Générer" color="primary" @click="generateReport" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Tableau des versements -->
      <q-table
        :rows="filteredVersements"
        :columns="columns"
        row-key="id"
        no-data-label="Aucun versements disponible"

        flat
        bordered
      >
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              icon="delete"
              color="negative"
              @click="deleteMesVersement(props.row.id)"
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

      <!-- Dialog pour ajouter un versement -->
      <q-dialog v-model="isDialogOpen">
        <q-card style="width: 80vw; max-width: 500px;">
          <q-card-section>
            <div class="text-h6 text-center "> Ajouter un Versement </div>
          </q-card-section>
          <q-card-section>
            <q-form @submit="submitMesVersement">
             <q-select
                v-model="versement.produit_id"
                :options="articleOptions"
                label="Produit"
                option-value="id"
                option-label="nom"
                emit-value
                map-options
                outlined
                required
              />
              <q-input
                v-model="versement.client"
                label="Client"
                outlined
                required
              />
              <q-input
                v-model="versement.montant"
                label="Montant"
                type="number"
                outlined
                required
              />
              <q-input
                v-model="versement.commentaire"
                label="Commentaire"
                type="textarea"
                autogrow
                maxlength="500"
                hint="Entrez une description (max 500 caractères)"
                outlined
                required
              />
              <q-card-actions align="right">
                <q-btn label="Annuler"  color="negative"  @click="isDialogOpen = false"    />
                <q-btn type="submit"  label="Ajouter" color="primary" />
              </q-card-actions>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-card>
  </q-page>
</template>

<script>
import axios from "axios";
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
      isDialogOpens: false,
      reportForm: {
        debut: '',
        fin: '',
        format: 'pdf',  // Format par défaut (pdf ou csv)
      },
      articleOptions:[],// liste des  produits
      clientOptions:[], // liste des clients
      versements: [], // Liste des versements
      filteredVersements: [], // Liste filtrée des versements
      searchTerm: "", // Terme de recherche
      isDialogOpen: false, // État du dialog
      versement: {
        produit_id: "",
        client: "",
        montant: "",
        commentaire: "",
      },
      columns: [
        { name: 'id', required: true, label: 'Numero', align: 'left', field: row => row.id, format: val => `${val}`, sortable: true },
        { name: "nom_produit", label: "Produit", align: "left", field: "nom_produit" },
        { name: "client", label: "Client", align: "left", field: "client",},
        { name: "montant", label: "Montant", align: "left", field: "montant", },
        { name: "commentaire", label: "Commentaire", align: "left", field: "commentaire",},
        { name: 'formattedDate', label: 'Date', align: 'left', field: 'formattedDate', sortable: true, /* format: (val) => new Date(val).toLocaleDateString() */},
        { name: "actions", label: "Actions", align: "center" },
      ],
    };
  },
  created() {
    this.fetchMesVersements();
    this.fetchProduit();
  },
  methods: {
     // Récupère la liste de tous les produits
     async fetchProduit() {
      try {
        const response = await axios.get('http://localhost:4000/api/produits');
        this.articleOptions = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des produits :", error);
      }
    },

async fetchMesVersements() {
  try {
    // Appel API pour récupérer les versements
    const response = await axios.get("http://localhost:4000/api/MesVersement");

    // Vérifier si les données sont bien reçues
    const versements = response.data;

    // Transformation des données avec vérification du format de date
    this.versements = versements.map(versement => {
      let formattedDate = null;

      try {
        // Si la date est déjà au format ISO, elle sera correctement gérée
        formattedDate = format(new Date(versement.date_versement), 'dd/MM/yyyy', { locale: fr });
      } catch (dateError) {
        console.error("Erreur de formatage de la date :", dateError);

        // Vous pouvez définir une valeur par défaut si la date est invalide
        formattedDate = "Date invalide";
      }

      return {
        ...versement,
        formattedDate, // Ajouter la date formatée
      };
    });

    // Initialisation des versements filtrés
    this.filteredVersements = [...this.versements];
  } catch (error) {
    console.error("Erreur lors de la récupération des versements :", error);

    // Notification d'erreur
    this.$q.notify({
      type: "negative",
      message: "Erreur lors de la récupération des versements.",
    });
  }
},

   async submitMesVersement() {
      try {
        await axios.post("http://localhost:4000/api/Mesversement", this.versement);
        this.$q.notify({
          type: "positive",
          message: "Versement ajouté avec succès.",
        });
        this.isDialogOpen = false; // Fermer le dialog
        this.fetchMesVersements(); // Recharger la liste des versements
        this.resetForm();
      } catch (error) {
        console.error("Erreur lors de l’ajout du versement :", error);
        this.$q.notify({
          type: "negative",
          message: "Erreur lors de l’ajout du versement.",
        });
      }
    },

    resetForm() {
      this.versement = {
        produit_id: "",
        client: "",
        montant: "",
        commentaire: "",
      };
    },
    openDialog() {
      this.isDialogOpen = true;
      this.resetForm();
    },
    filterMesVersements() {
      const term = this.searchTerm.toLowerCase();
      this.filteredVersements = this.versements.filter(
        (v) =>
          v.produit_id.toLowerCase().includes(term) ||
          v.client.toString().includes(term) ||
          v.montant.toString().includes(term) ||
          (v.commentaire && v.commentaire.toLowerCase().includes(term))
      );
    },

// fonction pour supprimer un versement
  async deleteMesVersement(id) {
    try {
      // Afficher le dialogue de confirmation
      const confirmed = await new Promise(resolve => {
        this.$q.dialog({
          title: 'Confirmation',
          message: 'Êtes-vous sûr de vouloir supprimer ce versement ?',
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
        await axios.delete(`http://localhost:4000/api/MesVersement/${id}`);
        this.$q.notify({
          type: "positive",
          message: "Versement supprimé avec succès.",
        });
        this.fetchMesVersements();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      this.$q.notify({
        type: "negative",
        message: "Erreur lors de la suppression du versement.",
      });
    }
  },


    // fonction telecharger en fichier excel
    exportTable() {
      const rows = this.versements; // Les données à exporter (versements)
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

      const status = exportFile("versements-export.csv", content, "text/csv");

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
   // fonction pour telecharger en fichier pdf
    exportToPDF() {
      // Vérifiez si les versements sont disponibles
      if (!this.versements || this.versements.length === 0) {
        this.$q.notify({
          message: 'Aucune donnée à exporter.',
          color: 'negative',
          icon: 'warning',
        });
        return;
      }

      // Initialisation du document PDF
      // eslint-disable-next-line new-cap
      const doc = new jsPDF();

      // Colonnes du tableau
      const columns = this.columns
        .filter((col) => col.name !== 'actions') // Exclure les colonnes inutiles
        .map((col) => ({
          header: col.label, // Nom affiché dans l'en-tête du PDF
          dataKey: col.name, // Correspond à la clé de données
        }));

      // Lignes du tableau
        const rows = this.versements.map((versement) => {
        const row = {};
        this.columns.forEach((col) => {
          if (col.name !== 'actions') { // Ignorer les colonnes non pertinentes
            row[col.name] =
              typeof col.field === 'function'
                ? col.field(versement) // Si le champ est une fonction, appliquez-la
                : versement[col.field || col.name]; // Sinon, récupérez la valeur brute
          }
        });
        return row;
      });

      // Ajout du titre
      doc.text('Liste des versements', 14, 10);

      // Génération du tableau
      doc.autoTable({
        columns,
        body: rows,
        startY: 20, // Point de départ du tableau
        theme: 'grid', // Style du tableau
        styles: { fontSize: 10 }, // Taille de la police
        headStyles: {
          fillColor: [41, 128, 185], // Couleur d'arrière-plan de l'en-tête
          textColor: [255, 255, 255], // Couleur du texte de l'en-tête
        },
      });

      // Téléchargement du fichier PDF
      doc.save('versements-export.pdf');

      this.$q.notify({
        message: 'Fichier PDF téléchargé avec succès !',
        color: 'positive',
        icon: 'cloud_download',
      });

  },

     // Ouvrir le dialog pour générer un rapport
     openReportDialog() {
      this.isDialogOpens = true;
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

        if (response.data.length === 0) {
          this.$q.notify({
            type: 'warning',
            message: 'Aucun enregistrement trouvé pour cette période.',
          });
          return;
        }
        // Fermer le dialog après génération du rapport
        this.isDialogOpens = false;
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
/* Ajouter vos styles personnalisés ici */
</style>
