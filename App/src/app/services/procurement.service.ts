import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { IProcurement } from '../models';
import { environment } from "src/environments/environment";
import Upsert from ".";

@Injectable()
export class ProcurementService {
    constructor(private http: HttpClient) { }

    private url: string = `${environment.apiEndpoint}/api/Procurement`

    getProcurements(date: Date, shift?: string): Observable<IProcurement[]> {
        return this.http.get<IProcurement[]>(`${this.url}/${date.toISOString()}/${shift}`);
    }

    deleteProcurement(procurement: IProcurement) {
        return this.http.delete(`${this.url}/${procurement._id}`);
    }

    getBillProcurements(fromDate: Date, toDate: Date, producerCode?: string): Observable<IProcurement[]> {
        let slug = '/XXXXX' // Add slug to support routes ending with .* to be handled by MVC Routing 
        return this.http.get<IProcurement[]>(`${this.url}/Bill/${fromDate.toISOString()}/${toDate.toISOString()}${(producerCode ? '/' + producerCode : '')}${slug}`);
    }
    bulkUpdate(procurements: IProcurement[]): any {
        let updateInserts = procurements.map(p => new Upsert<IProcurement>(p._id, p));
        return this.http.post<any>(`${this.url}/bulk`, updateInserts);
    }
}