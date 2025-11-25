"use client";

import Link from "next/link";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from "@/components/ui/table";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Component() {
	const router = useRouter();
	interface Transaction {
		hash: string;
		from: string;
		to: string | null;
		value: string;
		timestamp: number;
		blockNumber: number | null;
	}

	const [account, setAccount] = useState<string>("");
	const [balance, setBalance] = useState("0");
	const [isLoading, setIsLoading] = useState(true);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [isLoadingTx, setIsLoadingTx] = useState(false);
	const [avatar, setAvatar] = useState<string | undefined>(undefined);

	// Then in JSX
	<img
		src={avatar}
		alt="Avatar"
	/>;

	useEffect(() => {
		initializeWallet();

		// Listen for account and chain changes
		if (window.ethereum) {
			const accountsChangedHandler = (accounts: unknown) => {
				handleAccountsChanged(accounts as string[]);
			};
			const chainChangedHandler = () => {
				handleChainChanged();
			};

			window.ethereum.on("accountsChanged", accountsChangedHandler);
			window.ethereum.on("chainChanged", chainChangedHandler);

			return () => {
				if (window.ethereum) {
					window.ethereum.removeListener(
						"accountsChanged",
						accountsChangedHandler
					);
					window.ethereum.removeListener("chainChanged", chainChangedHandler);
				}
			};
		}
	}, []);

	const initializeWallet = async () => {
		// Check if wallet is connected
		const storedAddress = localStorage.getItem("walletAddress");

		if (!storedAddress) {
			// Redirect to login if no wallet connected
			router.push("/");
			return;
		}

		setAccount(storedAddress);
		setIsLoading(false); // Set loading to false immediately after setting account

		// Fetch balance and transactions in parallel without blocking UI
		Promise.all([
			fetchBalance(storedAddress),
			fetchTransactions(storedAddress),
		]).catch((err) => {
			console.error("Error loading wallet data:", err);
		});
	};

	const fetchBalance = async (address: string) => {
		try {
			if (!window.ethereum) return;

			const provider = new ethers.BrowserProvider(window.ethereum);
			const balanceWei = await provider.getBalance(address);
			const balanceEth = ethers.formatEther(balanceWei);
			const avatarUrl = (await provider.getAvatar?.(address)) || undefined;

			setAvatar(avatarUrl);
			setBalance(balanceEth);
			localStorage.setItem("walletBalance", balanceEth);
		} catch (err) {
			console.error("Error fetching balance:", err);
		}
	};

	const fetchTransactions = async (address: string) => {
		setIsLoadingTx(true);
		try {
			if (!window.ethereum) {
				setIsLoadingTx(false);
				return;
			}

			const provider = new ethers.BrowserProvider(window.ethereum);
			const network = await provider.getNetwork();

			// Determine Etherscan API endpoint based on network
			let apiUrl = "https://api.etherscan.io/v2/api";

			let apiKey = "936SZ8T8AGGDA4D8FYMMVFF1VZVQ12P1IY"; // You can use this default for testing, or get your own free key

			// Map chain IDs to Etherscan endpoints
			const chainId = Number(network.chainId);
			switch (chainId) {
				case 1: // Ethereum Mainnet
					apiUrl = "https://api.etherscan.io/api";
					break;
				case 11155111: // Sepolia Testnet
					apiUrl = "https://api-sepolia.etherscan.io/api";
					break;
				case 5: // Goerli Testnet
					apiUrl = "https://api-goerli.etherscan.io/api";
					break;
				case 137: // Polygon Mainnet
					apiUrl = "https://api.polygonscan.com/api";
					break;
				case 80001: // Polygon Mumbai Testnet
					apiUrl = "https://api-testnet.polygonscan.com/api";
					break;
				case 56: // BSC Mainnet
					apiUrl = "https://api.bscscan.com/api";
					break;
				case 97: // BSC Testnet
					apiUrl = "https://api-testnet.bscscan.com/api";
					break;
				default:
					console.warn("Unsupported network for transaction history");
					setTransactions([]);
					setIsLoadingTx(false);
					return;
			}

			// Fetch transactions from Etherscan API
			const url = `${apiUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${apiKey}`;

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
				}));

				setTransactions(txList);
			} else {
				// No transactions found or API error
				setTransactions([]);
			}
		} catch (err) {
			console.error("Error fetching transactions:", err);
			setTransactions([]);
		} finally {
			setIsLoadingTx(false);
		}
	};

	const handleAccountsChanged = (accounts: string[]) => {
		if (accounts.length === 0) {
			handleLogout();
		} else {
			setAccount(accounts[0]);
			fetchBalance(accounts[0]);
			fetchTransactions(accounts[0]);
		}
	};

	const handleChainChanged = () => {
		window.location.reload();
	};

	const handleLogout = () => {
		localStorage.removeItem("walletAddress");
		localStorage.removeItem("walletBalance");
		router.push("/");
	};

	const formatAddress = (address: string) => {
		if (!address) return "";
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp * 1000).toLocaleDateString();
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen w-full items-center justify-center">
				<p>Loading...</p>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen w-full flex-col bg-background">
			<header className="flex h-16 items-center justify-between border-b bg-muted px-6">
				<div className="flex items-center gap-4">
					<Link
						href="#"
						className="flex items-center gap-2"
						prefetch={false}
					>
						<WalletIcon className="h-6 w-6" />
						<span className="font-semibold">{formatAddress(account)}</span>
					</Link>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="rounded-full"
						>
							<img
								src={avatar}
								width={32}
								height={32}
								alt="User avatar"
								className="rounded-full"
								style={{ aspectRatio: "32/32", objectFit: "cover" }}
							/>
							{avatar ? (
								<img
									src={avatar}
									width={32}
									height={32}
									alt="User avatar"
									className="rounded-full"
									style={{ aspectRatio: "32/32", objectFit: "cover" }}
								/>
							) : (
								<div className="rounded-full" />
							)}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Account</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem>Settings</DropdownMenuItem>
						<DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</header>
			<main className="flex-1 p-6">
				<div className="grid gap-6">
					<Card>
						<CardContent className="flex flex-col items-center justify-center gap-4 p-8">
							<div className="text-4xl font-bold">
								{parseFloat(balance).toFixed(4)} ETH
							</div>
							<div className="text-muted-foreground">Available Balance</div>
							<Button
								variant="secondary"
								size="sm"
								onClick={() => {
									fetchBalance(account);
									fetchTransactions(account);
								}}
							>
								Refresh Balance
							</Button>
						</CardContent>
						<CardFooter className="grid grid-cols-3 gap-4">
							<Button variant="outline">
								<CoinsIcon className="h-4 w-4" />
								<span>Transactions</span>
							</Button>
							<Button variant="outline">
								<SendIcon className="h-4 w-4" />
								<span>Send</span>
							</Button>
							<Button variant="outline">
								<CreditCardIcon className="h-4 w-4" />
								<span>Cards</span>
							</Button>
						</CardFooter>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Recent Transactions</CardTitle>
						</CardHeader>
						<CardContent>
							{isLoadingTx ? (
								<div className="text-center py-8 text-muted-foreground">
									Loading transactions...
								</div>
							) : transactions.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									No recent transactions found
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Date</TableHead>
											<TableHead>From/To</TableHead>
											<TableHead>Amount</TableHead>
											<TableHead>Type</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{transactions.map((tx) => {
											const isSent =
												tx.from?.toLowerCase() === account.toLowerCase();
											return (
												<TableRow key={tx.hash}>
													<TableCell>{formatDate(tx.timestamp)}</TableCell>
													<TableCell className="font-mono text-xs">
														{isSent
															? formatAddress(tx.to ?? "")
															: formatAddress(tx.from)}
													</TableCell>
													<TableCell
														className={
															isSent ? "text-red-500" : "text-green-500"
														}
													>
														{isSent ? "-" : "+"}
														{parseFloat(tx.value).toFixed(4)} ETH
													</TableCell>
													<TableCell>
														<span
															className={`text-xs px-2 py-1 rounded ${
																isSent
																	? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
																	: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
															}`}
														>
															{isSent ? "Sent" : "Received"}
														</span>
													</TableCell>
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</div>
			</main>
		</div>
	);
}

function CoinsIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<circle
				cx="8"
				cy="8"
				r="6"
			/>
			<path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
			<path d="M7 6h1v4" />
			<path d="m16.71 13.88.7.71-2.82 2.82" />
		</svg>
	);
}

function CreditCardIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect
				width="20"
				height="14"
				x="2"
				y="5"
				rx="2"
			/>
			<line
				x1="2"
				x2="22"
				y1="10"
				y2="10"
			/>
		</svg>
	);
}

function SendIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="m22 2-7 20-4-9-9-4Z" />
			<path d="M22 2 11 13" />
		</svg>
	);
}

function WalletIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
			<path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
		</svg>
	);
}
