import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

import { Product } from './product';
import { Supplier } from '../suppliers/supplier';
import { SupplierService } from '../suppliers/supplier.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = this.supplierService.suppliersUrl;

  products$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      // This is piping the whole array through since we are asking for array from the service
      // map( item => item.price * 1.5),
      // In this version we are not mapping the whole object, but instead just a value breaking our observable
      // map(products =>
      //   products.map(product => product.price * 1.5)
      // ),
      map(products =>
        products.map(product => ({ // Parens allow object literal declaration
          ...product, // Spread operator copies original object
          price: product.price * 1.5, // modifies price from original value
          searchKey: [product.productName]
        }) as Product) // Type the result
      ),
      tap(data => console.log('Products: ', JSON.stringify(data))),
      catchError(this.handleError) // Catch and Rethrow error handling
    );

  constructor(private http: HttpClient,
              private supplierService: SupplierService) { }

  // Removed by referencing the observable directly
  // getProducts(): Observable<Product[]> {
  //   return
  // }

  private fakeProduct(): Product {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      // category: 'Toolbox',
      quantityInStock: 30
    };
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
