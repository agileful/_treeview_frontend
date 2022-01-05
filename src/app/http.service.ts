import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../environments/environment';


/**
 * this service is for handling RESTFUL APIs
 */
@Injectable()
export class HttpService {
  /**
   * @param http
   * @param eventEmitterService
   */
  constructor(private http: HttpClient) {
  }

  /**
   *  it adds the input url to the base URL
   */
  getFullUrl(url: string): string {
    return environment.baseUrl + url;
  }

  /**
   * @param {string:url}
   *  Here we can call a get request to get an/array item/s.
   *  @return {Observable}
   */
  get(url: string): Observable<any> {
    return this.http.get(this.getFullUrl(url)).pipe();
  }

  /**
   * @param {string:url},{json:body}
   *  Here we can call a post request to add an item.
   *  @return {Observable}
   */
  post(url: string, body: any): Observable<any> {
    return this.http.post(this.getFullUrl(url), body).pipe();
  }

  /**
   * @param {string:url},{json:body}
   *  Here we can call a put request to update an item.
   *  @return {Observable}
   */
  put(url: string, body: any): Observable<any> {
    return this.http.put(this.getFullUrl(url), body).pipe();
  }

  /**
   * @param {string:url}
   *  Here we can call a delete request to delete an item.
   *  @return {Observable}
   */
  delete(url: string): Observable<any> {
    return this.http.delete(this.getFullUrl(url)).pipe();
  }
}
