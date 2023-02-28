import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { IProducer } from '../models';
import { environment } from "src/environments/environment";
import Upsert from ".";

@Injectable()
export class ProducerService {
    constructor(private http: HttpClient) { }

    private url: string = `${environment.apiEndpoint}/api/Producer`

    getProducers(status: 'active' | 'all' = 'active'): Observable<IProducer[]> {
        return this.http.get<IProducer[]>(`${this.url}/${status}`);
    }

    updateProducer(producer: IProducer) {
        let slug = '/XXXXX' // Add slug to support routes ending with .* to be handled by MVC Routing 
        return this.http.put(this.url + slug, producer);
    }

    deactivateProducer(producer: IProducer) {
        return this.http.delete(`${this.url}/${producer._id}`);
    }

    bulkUpdate(producers: IProducer[]): any {
        let updateInserts = producers.map(p => new Upsert<IProducer>(p._id, p));
        return this.http.post<any>(`${this.url}/bulk`, updateInserts);
    }
}