import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { UserComponent } from './components/user/user.component';
import { D3Component } from './components/d3/d3.component';
import { TopologyComponent } from './components/topology/topology.component';

const appRoutes: Routes = [
  { path: '', component: UserComponent },
  { path: 'd3', component: D3Component },
  { path: 'tp', component: TopologyComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    UserComponent,
    D3Component,
    TopologyComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
