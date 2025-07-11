import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class StellarWallet implements ICredentialType {
	name = 'stellarWallet';
	displayName = 'Stellar Wallet';

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