import { network } from "hardhat";

const { ethers, networkName } = await network.connect();

console.log(`Deploying Wojak to ${networkName}...`);

const wojak = await ethers.deployContract("Wojak");

console.log("Waiting for the deployment tx to confirm");
await wojak.waitForDeployment();

console.log("Counter address:", await wojak.getAddress());

console.log("Deployment successful!");