import * as Vue from 'vue';
import * as Router from 'vue-router';

Vue.use(Router);

// Route-level code splitting
const createListView = async (id: string) => {
  const m = import('../view/create-list-view');
  return m.createListView(id);
};
