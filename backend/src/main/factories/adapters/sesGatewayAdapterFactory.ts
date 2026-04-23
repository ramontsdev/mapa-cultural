import { SESGatewayAdapter } from '@/main/adapters/SESGatewayAdapter';

export function makeSESGatewayAdapter() {
  return new SESGatewayAdapter();
}
