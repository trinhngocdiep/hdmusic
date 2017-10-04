import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule, Http, JsonpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { ApiService } from './services/api.service';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        RouterModule,
        CommonModule,
        FormsModule,
        BrowserModule,
        HttpModule,
        JsonpModule
    ],
    providers: [
        ApiService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
