import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms'; //
import { AppComponent } from './app.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { SearchComponent } from './components/search/search.component';
import { PaginatorComponent } from './components/paginator/paginator.component';
import { ResultsComponent } from './components/results/results.component';
import { HomeComponent } from './pages/home/home.component';
import { MainResultsComponent } from './pages/results/results.component';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    SearchComponent,
    PaginatorComponent,
    ResultsComponent,
    HomeComponent,
    MainResultsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
