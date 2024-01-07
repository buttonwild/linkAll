//填入你的地址和私钥即可  address privateKey

import ethers from "ethers";
import fetch from 'node-fetch';
import randomUserAgent from 'random-useragent';

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

const ALCHEMY_GOERLI_URL = 'https://opbnb.publicnode.com';
const provider = new ethers.JsonRpcProvider(ALCHEMY_GOERLI_URL);
const address = '';
const privateKey = '';
const wallet = new ethers.Wallet(privateKey, provider)
let signPromise = '';
let jwt = '';

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

async function checkin() {
    // 签到
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


async function main() {
    try {
        await getJWT(); // 等待getJWT完成
        await startLoginWithRetry(); // 等待startLogin完成
        await checkin();
    } catch (error) {
        console.error(error);
    }
}


main(); // 调用主函数开始执行操作