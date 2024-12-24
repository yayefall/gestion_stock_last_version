
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'index',component: () => import('pages/IndexPage.vue') },
      { path: '/produits',name: 'produits', component: () => import('src/pages/produits.vue') },
      { path: '/admin',  name: 'admin',component: () => import('pages/adminPage.vue') },
      { path: '/login', name: 'login', component: () => import('pages/loginPage.vue') },
      { path: '/commandes', name: 'commandes', component: () => import('src/pages/commandes.vue') },
      { path: '/listadmin', name: 'listadmin', component: () => import('pages/listAdmin.vue') },
      { path: '/dashboard', name: 'dashboard', component: () => import('pages/dashboard.vue') },
      { path: '/commandes/ajouter', name: 'ajout_commandes', component: () => import('src/pages/ajoutCommande.vue') },
      { path: '/rapport', name: 'rapport', component: () => import('src/pages/rapport.vue') },
      { path: '/commandes/ajouter', name: 'ajout_commandes', component: () => import('src/pages/ajoutCommande.vue') },
      { path: '/details/commande', name: 'details_commande', component: () => import('src/pages/detailsCommande.vue') },
      { path: '/mouvements_stock', name: 'mouvements_stock', component: () => import('src/pages/mouvementStock.vue') },
      { path: '/versement', name: 'versement', component: () => import('src/pages/versement.vue') },
      { path: '/client', name: 'clients', component: () => import('src/pages/clientPage.vue') },
      { path: '/parametre', name: 'parametre', component: () => import('src/pages/parametrePage.vue') },
      { path: '/mouvement_stock/sortie', name: 'sortie', component: () => import('src/pages/sortiePage.vue') },
      { path: '/mesVersement', name: 'mesVersement', component: () => import('src/pages/mesVersement.vue') },
      { path: '/nonPayer', name: 'nonPayer', component: () => import('src/pages/nonPayer.vue') },










    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
