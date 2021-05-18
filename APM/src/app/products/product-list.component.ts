import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

import {combineLatest, EMPTY, Subject, BehaviorSubject} from 'rxjs';

// import {Product} from './product';
import {ProductService} from './product.service';
import {catchError, map, startWith} from 'rxjs/operators';
import {ProductCategoryService} from "../product-categories/product-category.service";

// OnPush allows more efficient change detection. Only checks when observables emit or input variables
@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';
  // categories;
  // selectedCategoryId = 1;
  /*
    Regular subject doesn't pass in an initial value. This can be set:
    startWith: Operator that sets the first value in the pipe
      ex: of([...]).pipe(startWith('O'),);

     BehaviorSubject: Different type that has a default value
   */
  // private categorySelectedSubject = new Subject<number>(); // Action stream for selection
  private categorySelectedSubject = new BehaviorSubject<number>(0); // Set default here instead!
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  // products: Product[] = [];
  // Reactive: Automatically subscribes
  /*
    Doing this in the template uses the async pipe:
    products$ | async as products...
   */
  // products$: Observable<Product[]>;

  // Assigning it to the observable of the service is the 'Declarative'
  // approach to avoid the necessity of calling the method
  // products$ = this.productService.productsWithCategory$.pipe(
  //   catchError(err => {
  //     this.errorMessage = err;
  //     return EMPTY;
  //   })
  // );

  // Filter the list of product based on selection:
  products$ = combineLatest([
    this.productService.productsWithCategory$,
    this.categorySelectedAction$
  ]).pipe(
    map(([products, selectedCategoryId]) =>
      products.filter(product =>
        selectedCategoryId ? product.categoryId === selectedCategoryId : true
      )),
    catchError(err => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  categories$ = this.productCategoryService.productCategories$.pipe(
    catchError(err => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  // Hard coded filtering
  // productSimpleFilter$ = this.productService.productsWithCategory$.pipe(
  //   map(products =>
  //     products.filter(product =>
  //       this.selectedCategoryId ? product.categoryId === this.selectedCategoryId : true
  //     ))
  // );

  constructor(private productService: ProductService,
              private productCategoryService: ProductCategoryService) { }

  // ngOnInit(): void {
    // Reactive declaration
    // this.products$ = this.productService.getProducts()

    // Data retrieval pattern. Works fine, but not as reactive.
    //   .subscribe(
    //     products => this.products = products,
    //     error => this.errorMessage = error
    //   );
  // }

  // No need to manage unsubscription with the reactive approach
  // ngOnDestroy(): void {
  //   this.sub.unsubscribe();
  // }

  onAdd(): void {
    console.log('Not yet implemented');
  }

  onSelected(categoryId: string): void {
    /*
      The value is updated but the list is not refiltered because the stream is completed.
      We need an action stream to combine the data from the input
     */
    // this.selectedCategoryId = +categoryId; // '+' cast to a number
    this.categorySelectedSubject.next(+categoryId);
  }
}
