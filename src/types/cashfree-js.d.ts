declare module '@cashfreepayments/cashfree-js' {
  export interface CheckoutOptions {
    paymentSessionId: string;
    redirectTarget?: '_self' | '_blank' | '_top' | '_modal';
  }

  export interface CashfreeInstance {
    checkout(options: CheckoutOptions): Promise<void>;
  }

  export function load(config: { mode: 'sandbox' | 'production' }): Promise<CashfreeInstance>;
}
