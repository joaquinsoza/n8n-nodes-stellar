import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class StellarWalletApi implements ICredentialType {
	name = 'stellarWalletApi';
	displayName = 'Stellar Wallet API';

	documentationUrl = 'https://developers.stellar.org/docs/fundamentals/wallets';

	properties: INodeProperties[] = [
		{
			displayName: 'Secret Key',
			name: 'secretKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
			description: 'The secret key of your Stellar wallet (starts with S)',
		},
	];
}