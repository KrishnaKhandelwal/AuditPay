import { Cashfree, CFEnvironment } from 'cashfree-pg';

const appId = process.env.CASHFREE_APP_ID || '';
const secretKey = process.env.CASHFREE_SECRET_KEY || '';
const envMode = process.env.CASHFREE_ENV === 'production' 
  ? CFEnvironment.PRODUCTION 
  : CFEnvironment.SANDBOX;

let cashfreeInstance: Cashfree | null = null;

export function getCashfree(): Cashfree {
  if (!cashfreeInstance) {
    cashfreeInstance = new Cashfree(envMode, appId, secretKey);
  }
  return cashfreeInstance;
}
