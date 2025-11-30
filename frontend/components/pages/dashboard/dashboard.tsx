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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import walletService from "@/service/wallet.service";
import { toast } from "sonner";
import React from "react";
import { cn } from "@/lib/utils";
import { Transaction } from "@/interface/transaction";

export default function Component() {
	const router = useRouter();
	const chains = [
		{
			value: "1",
			label: "Ethereum Mainnet",
		},
		{
			value: "11155111",
			label: "Sepolia Testnet",
		},
	];

	const [account, setAccount] = useState<string>("");
	const [balance, setBalance] = useState("0");
	const [isLoading, setIsLoading] = useState(true);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [isLoadingTx, setIsLoadingTx] = useState(false);
	const [avatar, setAvatar] = useState<string | undefined>(undefined);
	const [open, setOpen] = React.useState(false);
	const [chainId, setChainId] = useState("1");
	const [dropDownValue, setDropDownValue] = React.useState("1");

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
	}, [chainId, account]);

	const initializeWallet = async () => {
		// Check if wallet is connected
		setIsLoadingTx(true);
		const storedAddress = localStorage.getItem("walletAddress");

		if (!storedAddress) {
			// Redirect to login if no wallet connected
			router.push("/");
			return;
		}

		setAccount(storedAddress);
		setIsLoading(false); // Set loading to false immediately after setting account

		// Fetch balance and transactions in parallel without blocking UI
		try {
			const [balanceData, transactionsData] = await Promise.all([
				walletService.fetchBalance(storedAddress, chainId),
				walletService.fetchTransactions(storedAddress, chainId),
			]);

			// Update state with the fetched data
			if (balanceData && typeof balanceData === "string") {
				setBalance(balanceData);
				setAvatar(avatar);
			}

			if (transactionsData && Array.isArray(transactionsData)) {
				setTransactions(transactionsData);
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
		} finally {
			setIsLoadingTx(false);
		}
	};

	const handleAccountsChanged = async (accounts: string[]) => {
		try {
			if (accounts.length === 0) {
				handleLogout();
			} else {
				setAccount(accounts[0]);
				await walletService.fetchBalance(accounts[0], chainId);

				await walletService.fetchTransactions(accounts[0], chainId);
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
		}
	};

	const handleChainChanged = () => {
		window.location.reload();
	};

	const handleLogout = () => {
		try {
			localStorage.removeItem("walletAddress");
			localStorage.removeItem("walletBalance");
			toast.success(`User logged out`, {
				style: {
					"--normal-bg":
						"color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))",
					"--normal-text":
						"light-dark(var(--color-green-600), var(--color-green-400))",
					"--normal-border":
						"light-dark(var(--color-green-600), var(--color-green-400))",
				} as React.CSSProperties,
			});
			router.push("/");
		} catch (error) {
			toast.error(`Something went wrong: ${error}`, {
				style: {
					"--normal-bg":
						"color-mix(in oklab, var(--destructive) 10%, var(--background))",
					"--normal-text": "var(--destructive)",
					"--normal-border": "var(--destructive)",
				} as React.CSSProperties,
			});
		}
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
								onClick={async () => {
									setIsLoadingTx(true);
									try {
										const [balanceData, transactionsData] = await Promise.all([
											walletService.fetchBalance(account, chainId),

											walletService.fetchTransactions(account, chainId),
										]);

										if (balanceData && typeof balanceData === "string") {
											setBalance(balanceData);
										}

										if (transactionsData && Array.isArray(transactionsData)) {
											setTransactions(transactionsData);
										}
									} catch (err) {
										console.error("Error refreshing data:", err);
									} finally {
										setIsLoadingTx(false);
									}
								}}
							>
								Refresh Balance
							</Button>
						</CardContent>
						<CardFooter className="grid grid-cols-2 gap-4">
							<Button variant="outline">
								<CoinsIcon className="h-4 w-4" />
								<span>Transactions</span>
							</Button>
							{/* <Button variant="outline">
								<SendIcon className="h-4 w-4" />
								<span>Send</span>
							</Button>
							<Button variant="outline">
								<CreditCardIcon className="h-4 w-4" />
								<span>Cards</span>
							</Button> */}
							<Popover
								open={open}
								onOpenChange={setOpen}
							>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										role="combobox"
										aria-expanded={open}
										className=" justify-between"
									>
										{dropDownValue
											? chains.find((chains) => chains.value === dropDownValue)
													?.label
											: "Select chain..."}
										<ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className=" p-0">
									<Command>
										<CommandList>
											<CommandGroup>
												{chains.map((chains: any) => (
													<CommandItem
														key={chains.value}
														value={chains.value}
														onSelect={(currentValue) => {
															setDropDownValue(
																currentValue === dropDownValue
																	? ""
																	: currentValue
															);
															setChainId(currentValue);
															setOpen(false);
														}}
													>
														<CheckIcon
															className={cn(
																"mr-2 h-4 w-4",
																dropDownValue === chains.value
																	? "opacity-100"
																	: "opacity-0"
															)}
														/>
														{chains.label}
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
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
