import { ethers } from "ethers";
import { toast } from "sonner";

class ContractService {
	async mintTokens(address: string, amount: string) {
		try {
			if (!window.ethereum) {
				return;
			}

			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();
			const contract = new ethers.Contract(
				"0xaBEf3d5e6fdEbcBa6cB347315725A058fdC4F0b5",
				["function mint(address to, uint256 amount) public"],
				signer
			);

			const tx = await contract.mint(address, ethers.parseUnits(amount, 18));
			await tx.wait();
			return { success: true, txHash: tx.hash, amount };
		} catch (error: any) {
			const message = String(error);

			// User rejected the transaction
			if (error.code === 4001 || message.includes("user rejected")) {
				toast.error("Transaction rejected by user.", {
					style: {
						"--normal-bg":
							"color-mix(in oklab, var(--destructive) 10%, var(--background))",
						"--normal-text": "var(--destructive)",
						"--normal-border": "var(--destructive)",
					} as React.CSSProperties,
				});
				return { success: false, reason: "user-rejected" };
			}

			// Not owner error
			if (
				message.includes("unknown custom error") ||
				message.includes("OwnableUnauthorizedAccount") ||
				message.includes("execution reverted")
			) {
				toast.error("You are not the contract owner.", {
					style: {
						"--normal-bg":
							"color-mix(in oklab, var(--destructive) 10%, var(--background))",
						"--normal-text": "var(--destructive)",
						"--normal-border": "var(--destructive)",
					} as React.CSSProperties,
				});
				return { success: false, reason: "not-owner" };
			}

			// Default error
			toast.error(`Something went wrong: ${message}`, {
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

const contractService = new ContractService();
export default contractService;
