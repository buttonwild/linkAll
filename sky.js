//填入你的私钥即可  privateKey
import { ethers } from "ethers";

// 连接到以太坊网络
const opbnb_URL = 'https://opbnb.publicnode.com';
const provider = new ethers.JsonRpcProvider(opbnb_URL);

const privateKey = '';
const wallet = new ethers.Wallet(privateKey, provider)

// WETH合约的ABI和地址
const abi = [{ "type": "constructor", "inputs": [{ "name": "_nftAddr", "type": "address", "internalType": "address" }], "stateMutability": "nonpayable" }, { "name": "OwnershipTransferred", "type": "event", "inputs": [{ "name": "previousOwner", "type": "address", "indexed": true, "internalType": "address" }, { "name": "newOwner", "type": "address", "indexed": true, "internalType": "address" }], "anonymous": false, "signature": "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0" }, { "name": "Signin", "type": "event", "inputs": [{ "name": "_type", "type": "uint256", "indexed": true, "internalType": "uint256" }, { "name": "_from", "type": "address", "indexed": true, "internalType": "address" }, { "name": "_timestamp", "type": "uint256", "indexed": false, "internalType": "uint256" }], "anonymous": false, "signature": "0xa39e61b7c88ca891c872fbc7e541f7e480a8f8f2d0895a858c9c31eff654ecd5" }, { "name": "nftAddr", "type": "function", "inputs": [], "outputs": [{ "name": "", "type": "address", "value": "0x961A98999F14e8C5e69bDD4eE0826d6e0C556A0D", "internalType": "address" }], "constant": true, "signature": "0x740f1e18", "stateMutability": "view" }, { "name": "owner", "type": "function", "inputs": [], "outputs": [{ "name": "", "type": "address", "value": "0xf49c3Af1f2d751Ed016735AD5459EDC4fF1c75EC", "internalType": "address" }], "constant": true, "signature": "0x8da5cb5b", "stateMutability": "view" }, { "name": "renounceOwnership", "type": "function", "inputs": [], "outputs": [], "signature": "0x715018a6", "stateMutability": "nonpayable" }, { "name": "signin", "type": "function", "inputs": [{ "name": "_type", "type": "uint256", "internalType": "uint256" }], "outputs": [], "signature": "0x9b7d30dd", "stateMutability": "nonpayable" }, { "name": "transferOwnership", "type": "function", "inputs": [{ "name": "newOwner", "type": "address", "internalType": "address" }], "outputs": [], "signature": "0xf2fde38b", "stateMutability": "nonpayable" }, { "name": "updateNFTAddr", "type": "function", "inputs": [{ "name": "_addr", "type": "address", "internalType": "address" }], "outputs": [], "signature": "0x84235611", "stateMutability": "nonpayable" }, { "name": "withdrawToken", "type": "function", "inputs": [{ "name": "token", "type": "address", "internalType": "address" }, { "name": "to", "type": "address", "internalType": "address" }, { "name": "amount", "type": "uint256", "internalType": "uint256" }], "outputs": [], "signature": "0x01e33667", "stateMutability": "nonpayable" }];

const address = '0x9465fe0e8cdf4e425e0c59b7caeccc1777dc6695' // Contract Address

// 声明可写合约
const contract = new ethers.Contract(address, abi, wallet)

async function main() {
    let counter = 0;

    async function performTransaction() {
        const tx = await contract.signin(1, {
            maxFeePerGas: 10000,
            maxPriorityFeePerGas: 10000,
        });

        // 等待交易上链
        const receipt = await tx.wait();
        console.log(`交易详情：`);
        console.log(receipt);

        counter++;

        if (counter >= 10) {
            clearInterval(interval);
        }
    }

    // 初始执行
    await performTransaction();

    // 每20秒重复执行，最多执行10次
    const interval = setInterval(async () => {
        if (counter < 10) {
            await performTransaction();
        }
    }, 20000);
}

main();