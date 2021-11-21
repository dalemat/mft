import Class from "./Stake.module.sass"
import InfoColum from "../ui/InfoColum"
import Button from "../ui/Button"
import Block from "../ui/BlockV2"
import InputTextField from "../ui/InputTextField"
import InputButton from "../modules/InputButton"
import { useContext, useEffect, useRef, useState } from "react"
import Web3Context from "../../src/Web3Context"

export default function Stake({data}) {
    console.log(data.referRef)
    const web3Context = useContext(Web3Context)
    let plan = {days: null, dailyProfit: null, totalProfit: null};
    data.pages.forEach((page, id)=>{
        if (page) {
            switch (id) {
                case 1:
                    plan = {id: 0, days: "Forever", dailyProfit: "2%", totalProfit: "∞"}
                    break;
                case 2:
                    plan = {id: 1, days: "40", dailyProfit: "4%", totalProfit: "160%"}
                    break;
                case 3:
                    plan = {id: 2, days: "60", dailyProfit: "3.5%", totalProfit: "210%"}
                    break;
                case 4:
                    plan = {id: 3, days: "90", dailyProfit: "3%", totalProfit: "270%"}
            }
        }
    })
    const referRef = useRef()

    useEffect(()=>{
        fetchData()
    }, [web3Context.web3])

    async function fetchData() {
        if (referRef.current) {
            referRef.current.value = web3Context.addr && window.location.protocol+"//"+window.location.host+window.location.pathname+ "#"+web3Context.addr
        }
    }

    async function inputValue(val){
        const [_, referrer] =  window.location.href.split("#")
        let referrerLink;
        referrerLink = web3Context.web3.utils.isAddress(referrer) && referrer != web3Context.addr ? 
            referrer :
            await data.contract.current.methods.getUserReferrer(web3Context.addr).call({from: web3Context.addr})
            
        if (Number(val) && Number(val)>0) {
            await data.contract.current.methods.invest(referrerLink, plan.id).send({from: web3Context.addr, value: web3Context.web3.utils.toWei(val)})
        }
    }

    function copyRefLink() {
        referRef.current.select() // for PC
        referRef.current.setSelectionRange(0, 99999) // for Mobile
        document.execCommand("copy")
    }
    
    return <>
        <div className={Class.stake}>
            <div className={Class.left}>
                <InfoColum data={[
                    {title: "Days", content: plan.days},
                    {title: "Dailys %", content: plan.dailyProfit},
                    {title: "Total %" , content: plan.totalProfit}
                ]} />
                <div className={Class.stakeBNB}>
                    <div>Stake BNB</div>
                    <InputButton data={{callback: inputValue, buttonText: "Submit"}}/>
                    <div>MultiToken left for claim: {Math.floor(data.contractTokenBal/1e18 * 1e5)/1e5}</div>
                </div>
                
                <div className={Class.warn}>
                    <div>Read before use</div>
                    <div>The principal deposit cannot be withdrawn, the only return users can get are daily dividends
                        and referral rewards.  Payments is possible only if contract balance have enough BNB.
                        Please analyze the transaction history and balance of the smart contract before investing.
                        High risk - high profit, DYOR
                    </div>
                </div>
            </div>
            <div className={Class.right}>
                <div className={Class.rightTop}>
                    <div className={Class.dashboardData}>
                        <div>BNB To Harvest</div>
                        <div>{Math.floor(data.userAvailable/1e18 * 1e5)/1e5} BNB</div>
                        <div>$ {web3Context.bnbPrice ? Math.floor(data.userAvailable/1e18 * data.bnbPrice * 1e5)/1e5 : "Calculating"}</div>
                    </div>
                    <div className={Class.dashboardData}>
                        <div>BNB Staked</div>
                        <div>{Math.floor((data.userDeposit/1e18)*1e5)/1e5} BNB</div>
                        <div>$ {web3Context.bnbPrice ? Math.floor((data.userDeposit/1e18) * data.bnbPrice *1e5)/1e5 : "Calculating"}</div>
                    </div>
                    <div className={Class.dashboardData}>
                        <div>BNB in Wallet</div>
                        <div>{Math.floor((data.userBnb/1e18)*1e5)/1e5} BNB</div>
                        <div>$ {web3Context.bnbPrice ? Math.floor((data.userBnb/1e18)*data.bnbPrice*1e5)/1e5 : "Calculating"}</div>
                    </div>
                    <div className={Class.dashboardData}>
                        <div>MULT in wallet</div>
                        <div>{Math.floor((data.userTokenBal/1e18)*1e5)/1e5} MULT</div>
                    </div>
                    
                    <Button data={{components: [<div key={0} className="">Harvest</div> ],callback: data.harvest, width: "200px"}}/>
                    
                    
                </div>
                <div className={Class.rightBottom}>
                    <div>Invited users: {data.totalReferrals}</div>
                    <div>Total earnings: {Math.floor((data.userReferralTotalBonus/1e18)*1e5)/1e5} BNB</div>
                    <Block data={{
                        icon: <Button data={{components: [<div key={0} className="">Copy</div> ],callback: copyRefLink}}/>,
                        content: "Your ref link", 
                        description: <InputTextField data={{ref: referRef, placeholder: "", width: "170px"}}/>,
                        }}/>
                </div>
            </div>
        </div>
    </>
}