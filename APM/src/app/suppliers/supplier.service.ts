import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { throwError, Observable, of } from 'rxjs';
import {Supplier} from './supplier';
import {map, tap, concatMap, mergeMap, switchMap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  suppliersUrl = 'api/suppliers';

  suppliersWithMap$ = of(1, 5, 8)
    .pipe(
      map(id => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`)
      )
    );

  suppliersWithConcatMap$ = of(1, 5, 8)
    .pipe(
      tap(id => console.log('concatMap source Observable', id)),
      concatMap(id => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`))
    );

  suppliersWithMergeMap$ = of(1, 5, 8)
    .pipe(
      tap(id => console.log('mergeMap source Observable', id)),
      mergeMap(id => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`))
    );

  suppliersWithSwitchMap$ = of(1, 5, 8)
    .pipe(
      tap(id => console.log('switchMap source Observable', id)),
      switchMap(id => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`))
    );

  constructor(private http: HttpClient) {
    // this.suppliersWithMap$
    //   .subscribe( o => o.subscribe( // Nested subscription not great syntax, but shows what's happening here.
    //     item => console.log('map result', item)
    //   ));
    // this.suppliersWithConcatMap$.subscribe(item => console.log('concatMap result', item));
    // this.suppliersWithMergeMap$.subscribe(item => console.log('mergeMap result', item));
    // this.suppliersWithSwitchMap$.subscribe(item => console.log('switchMap result', item));
  }

  private handleError(err: any): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }

}

/*
  Working with higher order observables (nested observables) using operators xxxMap():
  Map each value:
    - from a source (outer)
    - to a new (inner) observable
   Auto subscribe
   Emit as to output observable

   Operators:
   concatMap: Mapping + concatenation
     - Serial: waits for each inner to complete
     - concat in sequence
    ex: concatMap(i => of(i))
    Uses:
      - Wait for prior observables to complete before going to next one
      - to process in sequence

    mergeMap: Mapping + merging (flatMap)
      - Parallel:
      - concat in parallel
     ex: mergeMap(i => of(i))
     Uses:
      - Order doesn't matter

    switchMap: Mapping + switching
        - Stops the prior and switches to the new
    ex: switchMap(i => of(i))
    Uses:
      - Stop prior observable
      - Type ahead or auto complete
      - Selection from list
 */
