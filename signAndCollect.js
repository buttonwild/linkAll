import { ethers } from "ethers";
import fetch from 'node-fetch';
import randomUserAgent from 'random-useragent';
import { promises as fsPromises } from 'fs';

let address = '';
let privateKey = '';

async function getDataInfo() {
    try {
        const data = await fsPromises.readFile('mydata.json', 'utf8');
        const jsonData = JSON.parse(data);

        // 访问变量 a 和 b
        address = jsonData.address;
        privateKey = jsonData.privateKey;

        console.log('地址:', address);
        console.log('私钥:', privateKey);
    } catch (parseError) {
        console.error('解析 JSON 时发生错误:', parseError);
    }
}

function getHeaders() {
    const headers = {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        'Origin': 'https://skygate.skyarkchronicles.com',
        'Referer': 'https://skygate.skyarkchronicles.com/',
        'User-Agent': randomUserAgent.getRandom(), // 假设有一个名为 randomUA 的函数来生成随机的 User-Agent
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site'
    };

    return headers;
}


let signPromise = '';
let jwt = '';
let wallet;

class YourLoginClass {

    constructor() {
        this.jwt = null;
        // 其他属性初始化
    }

    async login() {
        // 获取登录态jwt
        if (this.jwt) {
            return this.jwt;
        }
        const host = 'https://apisky.ntoken.bwtechnology.net/api/{}';
        const url = host.replace('{}', 'wallet_signin.php');
        const payload = {
            api_id: 'skyark_react_api',
            api_token: '3C2D36F79AFB3D5374A49BE767A17C6A3AEF91635BF7A3FB25CEA8D4DD',
            uWalletAddr: address,
            sign: signPromise
        };

        if (this.invite_code) {
            payload.inviter = this.invite_code;
        }

        try {
            const res = await fetch(url, {
                method: 'POST',
                body: new URLSearchParams(payload),
                timeout: 30000, // 超时设置为30秒
                // proxies: this.proxy, // 如果需要代理的话，添加代理配置
                headers: getHeaders() // 假设有一个用于获取请求头的函数 getHeaders
            });

            if (res.status !== 200) {
                throw new Error(`login error, status code ${res.status}`);
            }

            const jsonRes = await res.json();

            if (jsonRes.err !== 0) {
                throw new Error(`login error, error code ${jsonRes.err}, error message ${jsonRes[0]}`);
            }

            // {"err":0,"msg":"verify_success","jwt":"...","uWalletAddr":"..."}
            this.jwt = jsonRes.jwt;
            return this.jwt;
        } catch (error) {
            throw new Error(`login error: ${error.message}`);
        }
    }

    // 其他辅助函数和属性定义
}

async function getJWT() {
    try {
        const ALCHEMY_GOERLI_URL = 'https://opbnb.publicnode.com';
        const provider = new ethers.JsonRpcProvider(ALCHEMY_GOERLI_URL);

        wallet = new ethers.Wallet(privateKey, provider)
        const result = await wallet.signMessage("skygate");
        console.log(result);
        signPromise = result;
    } catch (error) {
        console.error(error);
        // 在这里可以处理错误
    }
}

async function startLoginWithRetry(maxRetries = 3) {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const yourLoginInstance = new YourLoginClass();
            jwt = await yourLoginInstance.login();
            console.log(`JWT Token: ${jwt}`);
            return; // 成功登录，退出循环
        } catch (error) {
            console.error(`Error: ${error.message}`);
            retries++;
            if (retries < maxRetries) {
                console.log(`Retrying... (attempt ${retries} of ${maxRetries})`);
                await sleep(1000); // 可以添加等待时间，以避免过于频繁的重试
            } else {
                console.error("Max retries reached. Unable to start login.");
                throw error; // 如果达到最大重试次数仍然失败，抛出错误
            }
        }
    }
}

async function checkinWithRetry(maxRetries = 3) {
    let retries = 0;
    const retryInterval = 1000; // 1秒间隔

    async function doCheckin() {
        try {
            const result = await checkin();
            return result;
        } catch (error) {
            if (retries < maxRetries) {
                console.error(`Error during checkin, retrying in ${retryInterval / 1000} seconds...`);
                await new Promise((resolve) => setTimeout(resolve, retryInterval));
                retries++;
                return doCheckin(); // 递归调用重试
            } else {
                throw new Error(`Maximum retry limit (${maxRetries}) reached. Error: ${error.message}`);
            }
        }
    }

    return doCheckin();
}

async function checkin() {
    const host = 'https://apisky.ntoken.bwtechnology.net/api/{}';
    const url = host.replace('{}', 'checkIn_skyGate_member.php');
    const payload = {
        api_id: 'skyark_react_api',
        api_token: '3C2D36F79AFB3D5374A49BE767A17C6A3AEF91635BF7A3FB25CEA8D4DD',
        jwt: jwt,
    };

    const response = await fetch(url, {
        method: 'POST',
        body: new URLSearchParams(payload),
        timeout: 30000,
        headers: getHeaders(),
    });

    if (response.status !== 200) {
        throw new Error(`checkin error, status code: ${response.status}`);
    }

    const result = await response.json();

    if (result.err !== 0) {
        throw new Error(`checkin error, error code ${result.err}, error message ${result['0']}`);
    }

    return result;
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function collect() {
    const abi = [{ "type": "constructor", "inputs": [{ "name": "_nftAddr", "type": "address", "internalType": "address" }], "stateMutability": "nonpayable" }, { "name": "OwnershipTransferred", "type": "event", "inputs": [{ "name": "previousOwner", "type": "address", "indexed": true, "internalType": "address" }, { "name": "newOwner", "type": "address", "indexed": true, "internalType": "address" }], "anonymous": false, "signature": "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0" }, { "name": "Signin", "type": "event", "inputs": [{ "name": "_type", "type": "uint256", "indexed": true, "internalType": "uint256" }, { "name": "_from", "type": "address", "indexed": true, "internalType": "address" }, { "name": "_timestamp", "type": "uint256", "indexed": false, "internalType": "uint256" }], "anonymous": false, "signature": "0xa39e61b7c88ca891c872fbc7e541f7e480a8f8f2d0895a858c9c31eff654ecd5" }, { "name": "nftAddr", "type": "function", "inputs": [], "outputs": [{ "name": "", "type": "address", "value": "0x961A98999F14e8C5e69bDD4eE0826d6e0C556A0D", "internalType": "address" }], "constant": true, "signature": "0x740f1e18", "stateMutability": "view" }, { "name": "owner", "type": "function", "inputs": [], "outputs": [{ "name": "", "type": "address", "value": "0xf49c3Af1f2d751Ed016735AD5459EDC4fF1c75EC", "internalType": "address" }], "constant": true, "signature": "0x8da5cb5b", "stateMutability": "view" }, { "name": "renounceOwnership", "type": "function", "inputs": [], "outputs": [], "signature": "0x715018a6", "stateMutability": "nonpayable" }, { "name": "signin", "type": "function", "inputs": [{ "name": "_type", "type": "uint256", "internalType": "uint256" }], "outputs": [], "signature": "0x9b7d30dd", "stateMutability": "nonpayable" }, { "name": "transferOwnership", "type": "function", "inputs": [{ "name": "newOwner", "type": "address", "internalType": "address" }], "outputs": [], "signature": "0xf2fde38b", "stateMutability": "nonpayable" }, { "name": "updateNFTAddr", "type": "function", "inputs": [{ "name": "_addr", "type": "address", "internalType": "address" }], "outputs": [], "signature": "0x84235611", "stateMutability": "nonpayable" }, { "name": "withdrawToken", "type": "function", "inputs": [{ "name": "token", "type": "address", "internalType": "address" }, { "name": "to", "type": "address", "internalType": "address" }, { "name": "amount", "type": "uint256", "internalType": "uint256" }], "outputs": [], "signature": "0x01e33667", "stateMutability": "nonpayable" }];

    const address = '0x9465fe0e8cdf4e425e0c59b7caeccc1777dc6695' // Contract Address

    // 声明可写合约
    const contract = new ethers.Contract(address, abi, wallet)
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

async function main() {
    try {
        await getDataInfo();
        await getJWT(); // 等待getJWT完成
        await startLoginWithRetry(); // 等待startLogin完成
        await checkinWithRetry();
        await collect();
    } catch (error) {
        console.error(error);
    }
}


main(); // 调用主函数开始执行操作