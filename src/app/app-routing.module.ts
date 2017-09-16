import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ChartComponent } from './chart/chart.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent

  },
  {
    path: 'dbox/:chart',
    component: ChartComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
