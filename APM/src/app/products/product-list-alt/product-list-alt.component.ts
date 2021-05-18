import {ChangeDetectionStrategy, Component} from '@angular/core';

import {combineLatest, EMPTY, Subject} from 'rxjs';

// import { Product } from '../product';
import {ProductService} from '../product.service';
import {catchError, filter, map} from 'rxjs/operators';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListAltComponent {
  pageTitle = 'Products';
  // errorMessage = ''; // Doesn't update the DOM right now
  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();
  // selectedProductId: number;

  // products: Product[] = [];
  products$ = this.productService.productsWithCategory$
    .pipe(
      catchError(err => {
        this.errorMessageSubject.next(err);
        return EMPTY;
      })
    );

  selectedProduct$ = this.productService.selectedProduct$;

  vm$ = combineLatest([
    this.products$,
    this.selectedProduct$,
  ]).pipe(
    filter(([products]) => Boolean(products)),
    map(([products, selectedProduct]) =>
      ({ products, selectedProduct }))
  ); // How can this be done while retaining auto complete on the view?

  constructor(private productService: ProductService) { }

  // ngOnInit(): void {
  //   this.sub = this.productService.getProducts().subscribe(
  //     products => this.products = products,
  //     error => this.errorMessage = error
  //   );
  // }

  // ngOnDestroy(): void {
  //   this.sub.unsubscribe();
  // }

  onSelected(productId: number): void {
    this.productService.selectedProductChanged(productId);
  }
}
