const MultiTokenFarm = artifacts.require("MultiTokenFarm")
const ERC20 = artifacts.require("ERC20")
const path = require("path");
const expect = require("./setupTest")
const {time} = require("@openzeppelin/test-helpers")
const dotenv = require('dotenv');
const { web3 } = require("@openzeppelin/test-helpers/src/setup");
result = dotenv.config({ path: "./.env" });

if (result.error) {
    console.log("Fail to load .env varilable: test.MyToken.test.js")
    throw result.error
}

contract ("My contract test", ([alice, bob, care, dev, eric, frank, gary, harry, iris, jerry, kevin, lora, money, noah, olivia])=>{
    beforeEach(async ()=>{
        this.startLine = (content)=>{
            console.log(`------------ ${content} ------------`)
        }
        this.finishLine = (content) => {
            console.log(`============ ${content} ============`)
        }
        this.printTestContent = async (content) => {
            console.log(`  * ${content}`) 
        }
        this.beforeAndAfter = (title ,before, after) =>{
            this.printTestContent(`${title}: ${before} --> ${after} dif: (${after - before})`)
        }
        this.invest = async (user, name, amt, referrer, plan) => {
            const contractBal = await this.token.balanceOf(this.multiTokenFarm.address)/1e18
            // const referrerBal = referrer !== "0x0000000000000000000000000000000000000000" ? await web3.eth.getBalance(referrer)/1e18 : 0
            const totalRefBonus = await this.multiTokenFarm.totalRefBonus()
            const userRewardAmt = await this.multiTokenFarm.getUserRewardAmt(user)
            // const teamBnbBal = await web3.eth.getBalance(bob)
            const userBal = await this.token.balanceOf(user)/1e18
            await this.multiTokenFarm.invest(referrer, plan, {from: user, value: web3.utils.toWei(amt)})
            this.startLine(`${name} invest ${amt}`)
            this.beforeAndAfter("contractBal", contractBal, await this.token.balanceOf(this.multiTokenFarm.address)/1e18)
            // this.beforeAndAfter("referrerBal", referrerBal, referrer !== "0x0000000000000000000000000000000000000000" ? await web3.eth.getBalance(referrer)/1e18 : 0)
            this.beforeAndAfter("userBal", userBal, await this.token.balanceOf(user)/1e18)
            this.beforeAndAfter("userRewardAmt", userRewardAmt/1e18, await this.multiTokenFarm.getUserRewardAmt(user)/1e18)
            this.beforeAndAfter("totalRefBonus", totalRefBonus/1e18, await this.multiTokenFarm.totalRefBonus()/1e18 )
            // this.beforeAndAfter("teamBnbBal", teamBnbBal, await web3.eth.getBalance(dev)/1e18)            
        }
    })

    it("Should deploy and set contracts parameters", async () => {
        this.token = await ERC20.new("Multitoken", "MULT")
        this.multiTokenFarm = await MultiTokenFarm.new(
            dev, // fee wallet
            this.token.address, // reward token
        )
        this.token.transfer(this.multiTokenFarm.address, web3.utils.toWei("1000"), {from: alice})     
        this.startLine("Deploy contracts")
        this.printTestContent(`contract addr: ${this.multiTokenFarm.address}`)
        this.printTestContent(`Mock token addr: ${this.token.address}`)
        this.printTestContent(`reward token amt in contract: ${await this.token.balanceOf(this.multiTokenFarm.address)/1e18}`)
        this.finishLine("")
    })

    it("Should let commission wallet to start the contract", async () => {
        await expect(this.invest( care, "care", "0.1", "0x0000000000000000000000000000000000000000", 2)).to.be.rejected
        await this.invest( dev, "Commission wallet", "0.1", "0x0000000000000000000000000000000000000000", 2)
        
    })
    it("Should let user invest and get reward token", async () => {
        await this.invest( care, "care", "0.05", "0x0000000000000000000000000000000000000000", 2)
        await this.invest( eric, "eric", "0.2", "0x0000000000000000000000000000000000000000", 2)
        await this.invest( frank, "frank", "0.7", "0x0000000000000000000000000000000000000000", 2)
        await this.invest( gary, "gary", "1.2", "0x0000000000000000000000000000000000000000", 2)
        await this.invest( harry, "harry", "6", "0x0000000000000000000000000000000000000000", 2)
        await this.invest( iris, "iris", "11", "0x0000000000000000000000000000000000000000", 2)
        await this.invest( jerry, "jerry", "16", "0x0000000000000000000000000000000000000000", 2)
        await this.invest( kevin, "kevin", "45", "0x0000000000000000000000000000000000000000", 2)
    })
    it("Should let user invest and get reward token with referrer", async () => {
        await this.invest( care, "care", "0.05", "0x0000000000000000000000000000000000000000", 2)
        await this.invest( eric, "eric", "0.2", care, 2)
        await this.invest( frank, "frank", "0.7", eric, 2)
        await this.invest( gary, "gary", "1.2", frank, 2)
        await this.invest( harry, "harry", "6", gary, 2)
        await this.invest( iris, "iris", "11", harry, 2)
        await this.invest( jerry, "jerry", "16", iris, 2)
        await this.invest( kevin, "kevin", "45", jerry, 2)
    })

})