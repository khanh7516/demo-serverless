import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { REGION } from './constants';

//Initialize Cognito client
export const client = new CognitoIdentityProviderClient({
  region: REGION,
});