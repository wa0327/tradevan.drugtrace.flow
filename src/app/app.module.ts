import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
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
        BrowserAnimationsModule,
        HttpClientModule
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }