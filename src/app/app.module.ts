import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { HttpClientModule } from '@angular/common/http'
import { AppComponent } from './app.component'
import { LotsComponent } from './lots/lots.component'

@NgModule({
    declarations: [
        AppComponent,
        LotsComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }