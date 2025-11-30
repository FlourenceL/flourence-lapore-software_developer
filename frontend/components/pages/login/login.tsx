"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/pages/login/logos";
import { useRouter } from "next/navigation";

import { ethers } from "ethers";
import {
	MetaMaskLogo,
	WalletConnectLogo,
} from "@/components/pages/login/logos";
import { toast } from "sonner";

const Login = () => {
	const router = useRouter();

	async function connectWallet() {
		if (!window.ethereum) {
			toast.error("Please install Metamask!", {
				style: {
					"--normal-bg":
						"color-mix(in oklab, var(--destructive) 10%, var(--background))",
					"--normal-text": "var(--destructive)",
					"--normal-border": "var(--destructive)",
				} as React.CSSProperties,
			});
			return null;
		}
		try {
			const accounts = (await window.ethereum.request({
				method: "eth_requestAccounts",
			})) as string[];

			const account = accounts?.[0];
			if (!account) {
				toast.error("No account connected", {
					style: {
						"--normal-bg":
							"color-mix(in oklab, var(--destructive) 10%, var(--background))",
						"--normal-text": "var(--destructive)",
						"--normal-border": "var(--destructive)",
					} as React.CSSProperties,
				});
				return null;
			}

			const provider = new ethers.BrowserProvider(window.ethereum);

			// Get balance
			const balance = await provider.getBalance(account);
			const balanceInEth = ethers.formatEther(balance);

			// Store wallet info in localStorage
			localStorage.setItem("walletAddress", account);
			localStorage.setItem("walletBalance", balanceInEth);

			toast.success(`Connected account: ${account}`, {
				style: {
					"--normal-bg":
						"color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))",
					"--normal-text":
						"light-dark(var(--color-green-600), var(--color-green-400))",
					"--normal-border":
						"light-dark(var(--color-green-600), var(--color-green-400))",
				} as React.CSSProperties,
			});

			// Redirect to dashboard
			router.push("/dashboard");

			return { account, provider };
		} catch (err) {
			toast.error(`User rejected connection: ${err}`, {
				style: {
					"--normal-bg":
						"color-mix(in oklab, var(--destructive) 10%, var(--background))",
					"--normal-text": "var(--destructive)",
					"--normal-border": "var(--destructive)",
				} as React.CSSProperties,
			});
			return null;
		}
	}

	return (
		<div className="h-screen flex items-center justify-center">
			<div className="w-full h-full grid lg:grid-cols-2">
				<div className="relative max-w-sm m-auto w-full flex flex-col items-center p-8 outline-0 sm:outline-2 outline-border/40 dark:outline-border/80 outline-offset-0.5">
					<div className="max-sm:hidden absolute border-t top-0 inset-x-0 w-[calc(100%+4rem)] -translate-x-8" />
					<div className="max-sm:hidden absolute border-b bottom-0 inset-x-0 w-[calc(100%+4rem)] -translate-x-8" />
					<div className="max-sm:hidden absolute border-s left-0 inset-y-0 h-[calc(100%+4rem)] -translate-y-8" />
					<div className="max-sm:hidden absolute border-e right-0 inset-y-0 h-[calc(100%+4rem)] -translate-y-8" />

					<div className="max-sm:hidden absolute border-t -top-1 inset-x-0 w-[calc(100%+3rem)] -translate-x-6" />
					<div className="max-sm:hidden absolute border-b -bottom-1 inset-x-0 w-[calc(100%+3rem)] -translate-x-6" />
					<div className="max-sm:hidden absolute border-s -left-1 inset-y-0 h-[calc(100%+3rem)] -translate-y-6" />
					<div className="max-sm:hidden absolute border-e -right-1 inset-y-0 h-[calc(100%+3rem)] -translate-y-6" />

					<Logo className="h-9 w-9" />

					<Button
						className="mt-8 w-full gap-3"
						onClick={connectWallet}
					>
						<MetaMaskLogo />
						Connect metamask wallet!
					</Button>

					<div className="my-7 w-full flex items-center justify-center overflow-hidden">
						<Separator />
						<span className="text-sm px-2">OR</span>
						<Separator />
					</div>

					<Button
						className="w-full gap-3"
						onClick={connectWallet}
					>
						<WalletConnectLogo />
						Connect wallet connect!
					</Button>
				</div>
				<div className="bg-muted hidden lg:block border-l" />
			</div>
		</div>
	);
};

export default Login;

