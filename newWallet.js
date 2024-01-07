import { ethers } from "ethers";
import fs from 'fs';

function createWallet(i, walletNew) {
    console.log(`第${i+1}个钱包地址： ${walletNew.address}`);
    console.log(`第${i+1}个钱包地址的私钥： ${walletNew.signingKey.privateKey}`);
    const dataToAppend = {
        pub: walletNew.address,
        key: walletNew.signingKey.privateKey,
        critetime: Date.now()
    };
    const jsonData = JSON.stringify(dataToAppend);
    const filePath = 'keyData.json';
    fs.appendFile(filePath, jsonData + '\n', 'utf8', (err) => {
        if (err) {
            console.error('Error appending file:', err);
        } else {
            console.log('Data appended to', filePath);
        }
    });
}

// 1. 创建HD钱包
console.log("\n1. 创建HD钱包")
// 生成随机助记词
const mnemonic = ethers.Mnemonic.entropyToPhrase(ethers.randomBytes(32))
// 创建HD钱包
const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic)
console.log(hdNode);

// 2. 通过HD钱包派生20个钱包
console.log("\n2. 通过HD钱包派生20个钱包")
const numWallet = 20
// 派生路径：m / purpose' / coin_type' / account' / change / address_index
// 我们只需要切换最后一位address_index，就可以从hdNode派生出新钱包
let basePath = "m/44'/60'/0'/0";
let wallets = [];
for (let i = 0; i < numWallet; i++) {
    let hdNodeNew = hdNode.derivePath(basePath + "/" + i);
    let walletNew = new ethers.Wallet(hdNodeNew.privateKey);
    createWallet(i, walletNew);
    wallets.push(walletNew);
}