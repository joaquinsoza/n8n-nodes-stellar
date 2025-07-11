import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import { Keypair, Networks, Transaction } from '@stellar/stellar-sdk';

export class StellarSigner implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Stellar Signer',
		name: 'stellarSigner',
		icon: { light: 'file:stellarLogo.svg', dark: 'file:stellarLogo.svg' },
		group: ['transform'],
		version: 1,
		description: 'Sign Stellar transactions using a wallet secret key',
		defaults: {
			name: 'Stellar Signer',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'stellarWalletApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Transaction XDR',
				name: 'xdr',
				type: 'string',
				default: '',
				placeholder: 'AAAAAgAAAAC...',
				description: 'The unsigned transaction XDR to sign',
			},
			{
				displayName: 'Network',
				name: 'network',
				type: 'options',
				options: [
					{
						name: 'Mainnet',
						value: 'mainnet',
					},
					{
						name: 'Testnet',
						value: 'testnet',
					},
				],
				default: 'mainnet',
				description: 'The Stellar network to use',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const credentials = await this.getCredentials('stellarWalletApi');

		if (!credentials || !credentials.secretKey) {
			throw new NodeOperationError(this.getNode(), 'Stellar wallet credentials are required');
		}

		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const xdr = this.getNodeParameter('xdr', itemIndex, '') as string;
				const network = this.getNodeParameter('network', itemIndex, 'mainnet') as string;

				if (!xdr) {
					throw new NodeOperationError(this.getNode(), 'Transaction XDR is required');
				}

				const keypair = Keypair.fromSecret(credentials.secretKey as string);
				const networkPassphrase = network === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET;
				
				const transaction = new Transaction(xdr, networkPassphrase);
				transaction.sign(keypair);

				const txHash = transaction.hash().toString('hex');
				const signedXdr = transaction.toXDR();

				const item = items[itemIndex];
				item.json = {
					...item.json,
					signedXdr,
					txHash,
					publicKey: keypair.publicKey(),
					network: networkPassphrase,
				};

				returnData.push(item);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: this.getInputData(itemIndex)[0].json,
						error,
						pairedItem: itemIndex,
					});
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [returnData];
	}
}