import { Component } from '@angular/core';

@Component({
  selector: 'pm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  pageTitle = 'Acme Product Management';
/*
  RxJS has over 100 operators. They function to handle and transform data.
  Observer: the stream to be observed?
  Subscriber: The output 'listener'

  Data is not sent until the subscription is created.

  pipe: the series of operations that the data undergoes before the 'subscription' method is called with the output

  Try the operator 'Decision Tree' tool on the website.

 */

}
