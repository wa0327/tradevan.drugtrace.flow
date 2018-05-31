import { Component, Input } from '@angular/core'
import { Lot } from '../entities';

@Component({
    selector: 'app-lots',
    templateUrl: 'lots.component.html',
    styleUrls: ['lots.component.less']
})
export class LotsComponent {
    @Input() caption: string
    @Input() lots: Lot[]
}