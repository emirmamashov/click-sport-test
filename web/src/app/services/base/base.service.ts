import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { API_URL } from '../../config';

interface RequestOptions {
  headers?: { [header: string]: string | string[] };
}

@Injectable({
  providedIn: 'root'
})

export abstract class BaseService {

  protected constructor(
    protected http: HttpClient
  ) { }

  protected get<T = unknown>(url: string, options?: RequestOptions): Observable<T> {
    return this.http.get<T>(`${API_URL}${url}`, options).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  protected post<TResponse = unknown, TData = unknown>(
    url: string,
    data?: TData,
    options?: RequestOptions
  ): Observable<TResponse> {
    return this.http.post<TResponse>(`${API_URL}${url}`, data, options).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  protected patch<TResponse = unknown, TData = unknown> (
    url: string,
    data?: TData,
    options?: RequestOptions,
    sendToken?: boolean
  ): Observable<TResponse> {
    return this.http.patch<TResponse>(`${API_URL}${url}`, data, options).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  protected delete<T = unknown>(url: string, options?: RequestOptions, sendToken?: boolean): Observable<T> {
    return this.http.delete<T>(`${API_URL}${url}`, options).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  private handleError(errVal: HttpErrorResponse) {
    console.log('handleError', errVal);
    const errMsg = errVal.error.message || errVal.error.msg;
    return throwError(errMsg);
  };
}
