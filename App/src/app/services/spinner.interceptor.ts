import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AppStore } from '../services';

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {
    static count: number = 0;
    constructor(private store: AppStore) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const authReq = req.clone({ setHeaders: { Authorization: 'API_SECRET_HEADER' }});
        SpinnerInterceptor.count++;
        this.store.spinner = true;
        return next.handle(authReq).pipe(map((event) => {
            if (event instanceof HttpResponse) {
                SpinnerInterceptor.count--;
                if (SpinnerInterceptor.count <= 0) {
                    this.store.spinner = false;
                }
            }
            return event;
        }));
    }

}