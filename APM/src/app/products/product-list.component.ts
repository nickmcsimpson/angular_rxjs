import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

import { EMPTY } from 'rxjs';

// import {Product} from './product';
import {ProductService} from './product.service';
import {catchError} from 'rxjs/operators';

// OnPush allows more efficient change detection. Only checks when observables emit or input variables
@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';
  categories;

  // products: Product[] = [];
  // Reactive: Automatically subscribes
  /*
    Doing this in the template uses the async pipe:
    products$ | async as products...
   */
  // products$: Observable<Product[]>;

  // Assigning it to the observable of the service is the 'Declarative'
  // approach to avoid the necessity of calling the method
  products$ = this.productService.products$.pipe(
    catchError(err => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  constructor(private productService: ProductService) { }

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
    console.log('Not yet implemented');
  }
}
