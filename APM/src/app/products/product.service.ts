import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {Observable, throwError, combineLatest, BehaviorSubject, Subject, merge, from} from 'rxjs';
import {catchError, tap, map, scan, shareReplay, mergeMap, toArray, filter, switchMap} from 'rxjs/operators';

import { Product } from './product';
import { Supplier } from '../suppliers/supplier';
import { SupplierService } from '../suppliers/supplier.service';
import {ProductCategoryService} from '../product-categories/product-category.service';

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
      // Note: moved map to 'Product Categories' to combine the data from both streams
      tap(data => console.log('Products: ', JSON.stringify(data))),
      catchError(this.handleError) // Catch and Rethrow error handling
    );

  productsWithCategory$ = combineLatest([
    this.products$,
    this.productCategoryService.productCategories$
  ]).pipe(
    map(([products, categories]) => // Destructoring
      products.map(product => ({ // Parens allow object literal declaration
        ...product, // Spread operator copies original object
        price: product.price * 1.5, // modifies price from original value
        category: categories.find(c => product.categoryId === c.id).name,
        searchKey: [product.productName]
      }) as Product) // Type the result
    ),
    shareReplay(1),
  );

  private productSelectedSubject = new BehaviorSubject<number>(0);
  productSelectedAction$ = this.productSelectedSubject.asObservable();

  selectedProduct$ = combineLatest([
    this.productsWithCategory$,
    this.productSelectedAction$
  ])
    .pipe(
      map(([products, selectedProductId]) =>
        products.find(product => product.id === selectedProductId)
      ),
      tap(product => console.log('selectedProduct', product))
    );

  private productInsertedSubject = new Subject<Product>();
  productInsertedAction$ = this.productInsertedSubject.asObservable();

  // Merge data and action stream to get new data
  productsWithAdd$ = merge(
    this.productsWithCategory$,
    this.productInsertedAction$
  )
    .pipe(
      scan((acc: Product[], value: Product) => [...acc, value])
    );

  // Get it all approach:
  // selectedProductSuppliers$ = combineLatest([
  //   this.selectedProduct$,
  //   this.supplierService.suppliers$,
  // ]).pipe(
  //   map(([selectedProduct, suppliers]) =>
  //     suppliers.filter(supplier => selectedProduct.supplierIds.includes(supplier.id))
  //   )
  // );

  // Just in time approach
  selectedProductSuppliers$ = this.selectedProduct$
    .pipe(
      filter(selectedProduct => Boolean(selectedProduct)), // Shorthand for verfiying it exists
      switchMap(selectedProduct => // Using mergeMap here could result in incorrect values returning to the UI if they are not sequential
        from(selectedProduct.supplierIds)
          .pipe(
            mergeMap(supplierId => this.http.get<Supplier>(`${this.suppliersUrl}/${supplierId}`)),
            toArray(),
            tap(suppliers => console.log('product suppliers', JSON.stringify(suppliers))),
          ))
    );


  constructor(private http: HttpClient,
              private supplierService: SupplierService,
              private productCategoryService: ProductCategoryService) { }

  // Removed by referencing the observable directly
  // getProducts(): Observable<Product[]> {
  //   return
  // }

  selectedProductChanged(selectedProductId: number): void {
    this.productSelectedSubject.next(selectedProductId);
  }

  addProduct(newProduct?: Product): void {
    newProduct = newProduct || this.fakeProduct();
    this.productInsertedSubject.next(newProduct);
  }

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

/* --- Joining Streams
  Ways to combine multiple streams with different side effects:
  combineLatest: outputs a new observable (not an operator) and outputs:
    - After all combined have inputted once,
    - Then every time one is updated
    ex: combineLatest([a$, b$, c$])
   forkJoin: outputs a new observable:
    - All have completed
    - only last
    ex: forkJoin([a, b$, c$])
   withLatestFrom: pipe operator to emit:
    - After all have inputted
    - Once for every source stream emission
    ex: a$.pipe(withLatestFrom(b$, c$))
 */

/* --- Caching
  One way to cache values is to have a method to 'get' data and use the previously stored value unless specified
  as a refresh.

  The declarative RxJs way is to use 'shareReplay'
  shareReplay: operator with specified buffer length
    ex: shareReplay(1)

   Invalidation:
    Evaluate the fluidity of the data, behavior of users
    Consider invalidating over an interval, allow user to refresh, always get fresh on update
 */

/* ---- Joining Related Data Stream Strategies
  We can joing related data in different forms:
  'Get it All': request all the data (cached or not) and combine the related data into an observable. (combineLatest) Suppliers

  'Just in Time': Use higher order observable to combine the data

 */
