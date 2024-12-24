
<template>
  <q-page padding class=" flex flex-center">
    <q-card class="q-pa-lg  super-admin-page">

      <q-card-section>
        <q-form
        @submit="submitForm">
          <q-input
           v-model="form.nom"
           label="Nom"
           required
           :rules="[val => !!val || 'Le nom est obligatoire']" />

           <q-input
           v-model="form.prenom"
           label="Prenom"
           required
           :rules="[val => !!val || 'Le prenom est obligatoire']" />

           <q-input
           v-model="form.username"
           label="Username"
           required
           :rules="[val => !!val || 'Le username est obligatoire']" />

          <q-input
           v-model="form.email"
           label="Email"
           type="email"
           required
           class="q-mt-md"
           :rules="[val => !!val || 'Email est obligatoire']" />

          <q-input
          v-model="form.password"
          label="Mot de passe"
          type="password"
          required
          class="q-mt-md"
          :rules="[val => !!val || 'Le mot de passe est obligatoire']" />
          <div class="q-pa-md q-gutter-sm">
          <q-btn type="submit"
            label="Créer"
            color="primary"
            class="q-mt-md"
            />
          <q-btn
            to="/listadmin"
            type="submit"
            label="Retour"
            color="primary"
            class="q-mt-md "
           />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>

import axios from 'axios';

export default {

  data() {
    return {
      form: {
        nom: '',
        prenom: '',
        username: '',
        email: '',
        password: ''
      }
    };
  },
  methods: {
    submitForm() {
      axios.post('http://localhost:4000/api/admin', this.form)
        .then(response => {
          this.$q.notify({
            type: 'positive',
            message: 'Super admin créé avec succès!'
          });
          this.form.nom = '';
          this.form.prenom = '';
          this.form.username = '';
          this.form.email = '';
          this.form.password = '';
          this.$router.push('/listadmin');
        })
        .catch(_error => {
          this.$q.notify({
            type: 'negative',
            message: 'Erreur lors de la création du super admin.'
          });
        });
    }
  }
};
</script>

<style scoped>
.super-admin-page {
  max-width: 500px;
  width: 100%;
}

.q-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
.flex {
   display: flex;
 }

.flex-center {
   justify-content: center;
   align-items: center;
   height: 100vh;
 }
</style>
