import { ethers } from "ethers";
import { Transaction } from "@/interface/transaction";
import { toast } from "sonner";

class WalletService {
	async fetchBalance(address: string, chainId: string) {
		try {
			if (!window.ethereum) {
				return;
			}

			const provider = new ethers.BrowserProvider(window.ethereum);
			const balanceWei = await provider.getBalance(address);
			const avatar = (await provider.getAvatar(address)) || undefined;
			const balance = ethers.formatEther(balanceWei);
			return { balanceWei, avatar, balance };
		} catch (error) {
			toast.error(`Something went wrong: ${error}`, {
				style: {
					"--normal-bg":
						"color-mix(in oklab, var(--destructive) 10%, var(--background))",
					"--normal-text": "var(--destructive)",
					"--normal-border": "var(--destructive)",
				} as React.CSSProperties,
			});
			return error;
		}
	}

	async fetchTransactions(address: string, chainId: string) {
		try {
			if (!window.ethereum) {
				return;
			}

			const provider = new ethers.BrowserProvider(window.ethereum);
			//const network = await provider.getNetwork();

			switch (chainId) {
				case "1": // Ethereum Mainnet
					chainId = "1";
					break;
				case "11155111": // Sepolia Testnet
					chainId = "11155111";
					break;
				default:
					console.warn("Unsupported network for transaction history");
			}

			let url = "";
			const apiKey = process.env.NEXT_PUBLIC_API_KEY;
			if (chainId == "1") {
				url = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${apiKey}`;
				
			} else {
				url = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${apiKey}`;
			}

			const response = await fetch(url);
			const data = await response.json();

			if (data.status === "1" && data.result) {
				const txList: Transaction[] = data.result.map((tx: any) => ({
					hash: tx.hash,
					from: tx.from,
					to: tx.to || null,
					value: ethers.formatEther(tx.value),
					timestamp: parseInt(tx.timeStamp),
					blockNumber: parseInt(tx.blockNumber),
					tokenName: tx.tokenName,
				}));

				return txList;
			} else {
				return [];
			}
		} catch (error) {
			toast.error(`Something went wrong: ${error}`, {
				style: {
					"--normal-bg":
						"color-mix(in oklab, var(--destructive) 10%, var(--background))",
					"--normal-text": "var(--destructive)",
					"--normal-border": "var(--destructive)",
				} as React.CSSProperties,
			});
			return error;
		}
	}
}

const walletService = new WalletService();
export default walletService;
