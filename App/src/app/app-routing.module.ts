import { NgModule } from '@angular/core';
import { Routes, RouterModule, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { ProducersSheetComponent } from "./producers";
import { ProcurementsSheetComponent } from './procurement';
import { BillSummaryComponent } from './bill-summary';
import { ProducerBillComponent } from './producer-bill';
import { PrintAllBillsComponent } from './print-all-bills';
import { MetricsComponent } from './metrics/metrics.component';
import { Observable } from 'rxjs';

export class GuardProducersSheet implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return prompt('Enter security key', '') == "4123";
  }
}

const routes: Routes = [
  {
    path: 'producers',
    component: ProducersSheetComponent,
    canActivate: [GuardProducersSheet]
  },
  {
    path: 'procurements',
    component: ProcurementsSheetComponent
  },
  {
    path: 'bill-summary',
    component: BillSummaryComponent
  },
  {
    path: 'producer-bill',
    component: ProducerBillComponent
  },
  {
    path: 'print-all-bills',
    component: PrintAllBillsComponent
  },
  {
    path: 'metrics',
    component: MetricsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
