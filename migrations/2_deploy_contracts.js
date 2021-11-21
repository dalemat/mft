const MultiTokenFarm = artifacts.require("MultiTokenFarm");
const ERC20 = artifacts.require("ERC20")

const Web3 = require("web3")
const path = require("path");
const dotenv = require('dotenv');
const { web3 } = require("@openzeppelin/test-helpers/src/setup");
result = dotenv.config({ path: path.resolve("../.env") });
if (result.error) {
    console.log("Fail to load .env varilable: migrations.2_deploy_contracts")
    throw result.error
}

module.exports = async function (deployer, network, accounts) {
    console.log(`Deployer accounts: ${accounts[0]}`)

    // MOCK token & Contract deployment
    await deployer.deploy(ERC20, "Multitoken", "MULT")
    const token = await ERC20.deployed()
    await deployer.deploy(MultiTokenFarm, accounts[0], token.address)
    const multiTokenFarm = await MultiTokenFarm.deployed() 

    // Transfer MOCK token to contract
    await token.transfer(multiTokenFarm.address, web3.utils.toWei("10000"))
    // start and unlock the contract by investing through contract owner
    await multiTokenFarm.invest("0x0000000000000000000000000000000000000000", 0, {value: web3.utils.toWei("0.1")})

    console.log(`token addr: ${token.address}`)
    console.log(`contract Addr: ${multiTokenFarm.address}`)
    console.log(`contract reward token balance: ${(await token.balanceOf(multiTokenFarm.address))/1e18}`)
};