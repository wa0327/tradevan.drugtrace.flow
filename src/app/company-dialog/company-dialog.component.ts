import { Component, Input, OnInit } from '@angular/core'
import { Company } from '../entities';

@Component({
    selector: 'app-company-dialog',
    templateUrl: 'company-dialog.component.html',
    styleUrls: ['company-dialog.component.less']
})
export class CompanyDialogComponent implements OnInit {
    @Input() company: Company

    ngOnInit() {
    }

    getDisplay() {
        // console.log('getDisplay')
        return this.company ? 'show' : 'hide'
    }
}