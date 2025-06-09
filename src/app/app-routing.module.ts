import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { MainResultsComponent } from './pages/results/results.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'results', component: MainResultsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

