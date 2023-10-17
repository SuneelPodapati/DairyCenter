import { Component, OnInit } from "@angular/core";
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AppStore } from "../services";

@Component({
    selector: 'metrics',
    styleUrls: ['./metrics.component.css'],
    templateUrl: './metrics.component.html'
})
export class MetricsComponent implements OnInit {

    constructor(private sanitizer: DomSanitizer, private store: AppStore) { }

    ngOnInit(): void {
        this.store.spinner = false;
        let url = localStorage['dashboard-url'];
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    url: SafeUrl;
}