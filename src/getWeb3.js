import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider"
import { Children } from "react";

const supportedChain = {
    56: "BSC Main Net",
    97: "BSC Test Net"
}
const defaultWeb3 = new Web3(new Web3.providers.HttpProvider(process.env.NEXT_PUBLIC_PRODUCTION != "TRUE" ? 
    "https://data-seed-prebsc-1-s1.binance.org:8545/" :
    "https://bsc-dataseed1.binance.org/"))

const getWeb3 = (chainId) => {
    const web3Promise = new Promise(async (resolve, reject) => {
        // Wait for loading completion to avoid race conditions with web3 injection timing.        
        // Modern dapp browsers...
        let web3 = defaultWeb3
        if (window.ethereum) {
            console.log("Browser injected web3 'ethereum'")
            try {
                // Request account access if needed
                await window.ethereum.enable();
                ethereum.on('chainChanged', (chainId) => {
                    console.log(`network id switched ${chainId}`)
                })
                web3 = new Web3(window.ethereum);
                // Acccounts now exposed
                resolve(web3);
            } catch (error) {
                console.log(error);
                resolve(web3)
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            // Use Mist/MetaMask's provider.
            web3 = window.web3;
            console.log("Injected web3 detected.");
            resolve(web3);
        }
        // Fallback to localhost; use dev console port by default...
        else {
            try {
                console.log("Log in with walletConnect")
                const provider = await new WalletConnectProvider({
                    rpc: {
                        56: "https://bsc-dataseed1.binance.org",
                        97: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
                    },
                    chainId: chainId,
                    // network: "binance",
                    qrcode: true,
                    qrcodeModalOptions: {
                        mobileLinks: [
                            "metamask",
                            "trust",
                        ]
                    }
                });
                console.log(provider)
                await provider.enable();

                web3 = await new Web3(provider);
                resolve(web3)
            } catch(e) {
                console.log(e)
                // console.log("User wallet not connected, default web3 provider is used")
                // let web3 = new Web3(new Web3.providers.HttpProvider("https://data-seed-prebsc-1-s1.binance.org:8545/"))
                // resolve(web3)
            }  
                     
        } 
        resolve(web3)       
    });
    return web3Promise
}


export default getWeb3;
export {supportedChain, defaultWeb3}