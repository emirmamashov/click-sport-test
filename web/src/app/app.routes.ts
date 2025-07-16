import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'shopping-list',
    loadChildren: () => import('./pages/shopping-list/shopping-list.routes').then(m => m.INCOMING_ROUTES)
  },
  { path: '', pathMatch: 'full', redirectTo: '/shopping-list' }
];
