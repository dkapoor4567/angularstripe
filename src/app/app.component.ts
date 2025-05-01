import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from './environment';
declare var Stripe: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  stripe = Stripe(environment.stripeKey); // Only use the publishable key here
  clientSecret: string ='';

  constructor(private http: HttpClient) {}

  async initializePayment(amount: number) {
    try {
      const response = await this.http.post<{ clientSecret: string }>(
        'http://localhost:3000/create-payment-intent',
        { amount: amount * 100 }
      ).toPromise();

      if (response && response.clientSecret) {
        this.clientSecret = response.clientSecret;
      } else {
        throw new Error('Failed to retrieve clientSecret from the response.');
      }

      const elements = this.stripe.elements();
      const cardElement = elements.create('card');
      cardElement.mount('#card-element');

      const result = await this.stripe.confirmCardPayment(this.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Customer Name',
          },
        },
      });

      if (result.error) {
        console.error(result.error.message);
      } else {
        alert('Payment Successful!');
      }
    } catch (error) {
      console.error(error);
    }
  }

  ngOnInit() {
    // Ensure Stripe.js is loaded before initializing
    if (!document.getElementById('stripe-script')) {
      const script = document.createElement('script');
      script.id = 'stripe-script';
      script.type = 'text/javascript';
      script.src = 'https://js.stripe.com/v3/';
      document.body.appendChild(script);
    }
  }
}
