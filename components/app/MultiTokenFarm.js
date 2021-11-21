import Web3Context from "../../src/Web3Context"
import { useContext, useEffect, useRef, useState } from "react"
import rpcJson from "../../src/contracts/MultiTokenFarm.json"
import tokenRpc from "../../src/contracts/IERC20.json"
import Block from "../ui/BlockV2"
import Button from "../ui/Button"
import Class from "./MultiTokenFarm.module.sass"
import Stake from "./Stake"
import router from 'next/router'


export default function MultiTokenFarm() {
    const web3Context = useContext(Web3Context)

    const bscscanapikey ="FSQF4MGM6IHGF6WYB3KF52CJQRY3QQ2RA8"

    const contractAddr = process.env.NEXT_PUBLIC_PRODUCTION != "TRUE" ? 
        "0x5546eD923058aCE072321Ec450Ac313B6aC8dF5F" : // testnet address
        "0x5c8DD71356AAEf08a9050386797323215cBe0a63"   // mainnet address
    const tokenAddr = process.env.NEXT_PUBLIC_PRODUCTION != "TRUE" ? 
        "0xA7652876CbeBe7Bb3840E784A5099815BC5249E3": // testnet token address
        "0x063EF8791aD73eb37EcEF97F14281DCe3B7db0B6"  // mainnet token address
    const token = useRef(new web3Context.web3.eth.Contract(tokenRpc.abi, tokenAddr))
    const contract = useRef(new web3Context.web3.eth.Contract(rpcJson.abi, contractAddr))
    const [totalInvested, setTotalInvested] = useState()
    const [totalBonus, setTotalBonus] = useState()
    const [userAvailable, setUserAvailable] = useState()
    const [userWithdrawn, setUserWithdrawn] = useState()
    const [totalReferrals, setTotalReferrals] = useState()
    const [userBnb, setUserBnb] = useState()
    const [userDeposit, setUserDeposit] = useState()
    const [userReferralTotalBonus, setUserReferralTotalBonus] = useState()
    const [userTokenBal, setUserTokenBal] = useState()
    const [contractTokenBal, setContractTockenBal] = useState()
    const [pages, setPages] = useState([true, false, false, false, false])
    
    useEffect(()=>{
        web3Context.setPage({title: "BSC Chain", subtitle: "BNB FARM", logo: "/images/bnb-logo.png"})
        contract.current = new web3Context.web3.eth.Contract(rpcJson.abi, contractAddr)
        token.current = new web3Context.web3.eth.Contract(tokenRpc.abi, tokenAddr)
        fetchData()
        listenContractEvents()
    }, [web3Context.web3])

    async function listenContractEvents() {
        contract.current.once("NewDeposit", ()=>{fetchData()})
        contract.current.once("Withdrawn", ()=>{fetchData()})
    }

    async function fetchData() {
        setTotalInvested((await contract.current.methods.getSiteInfo().call())._totalInvested)
        setTotalBonus((await contract.current.methods.getSiteInfo().call())._totalBonus)
        setContractTockenBal(await token.current.methods.balanceOf(contractAddr).call({from: web3Context.addr}))
        web3Context.addr && setUserAvailable(await contract.current.methods.getUserAvailable(web3Context.addr).call({from: web3Context.addr}))
        web3Context.addr && setUserWithdrawn(await contract.current.methods.getUserTotalWithdrawn(web3Context.addr).call({from: web3Context.addr}))
        web3Context.addr && setTotalReferrals(await contract.current.methods.getUserTotalReferrals(web3Context.addr).call({from: web3Context.addr}))
        web3Context.addr && setUserBnb(await web3Context.web3.eth.getBalance(web3Context.addr))
        web3Context.addr && setUserDeposit(await contract.current.methods.getUserTotalDeposits(web3Context.addr).call({from: web3Context.addr}))        
        web3Context.addr && setUserReferralTotalBonus(await contract.current.methods.getUserReferralTotalBonus(web3Context.addr).call({from: web3Context.addr}))
        web3Context.addr && setUserTokenBal(await token.current.methods.balanceOf(web3Context.addr).call({from: web3Context.addr}))
        
    }
        
    async function harvest() {
        if (userAvailable > 0) {
            await contract.current.methods.withdraw().send({from: web3Context.addr})
        } else {
            alert("No dividend in your farm")
        }
    }
    
    function changePage(page) {
        let newPages = [false, false, false, false, false]
        newPages.forEach((p, id)=>{
            if(page == id){
                newPages[id] = true
            }
        })
        setPages(newPages)
    }

    return <>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", marginTop: "50px"}}>
            <div className={Class.naviBar}>
                <Button data={{components: [ pages[0] && <i className="far fa-play-circle fa-2x"></i>, <div key={0} className="">INFO</div> ],callback: () => {changePage(0)}, width: "170px"}}/>
                <Button data={{components: [ pages[1] && <i className="far fa-play-circle fa-2x"></i>,<div key={0} className="">Forever plan</div> ],callback: () => {changePage(1)}, width: "170px"}}/>
                <Button data={{components: [ pages[2] && <i className="far fa-play-circle fa-2x"></i>,<div key={0} className="">40 days plan</div> ],callback: () => {changePage(2)}, width: "170px"}}/>
                <Button data={{components: [ pages[3] && <i className="far fa-play-circle fa-2x"></i>,<div key={0} className="">60 days plan</div> ],callback: () => {changePage(3)}, width: "170px"}}/>
                <Button data={{components: [ pages[4] && <i className="far fa-play-circle fa-2x"></i>,<div key={0} className="">90 days plan</div> ],callback: () => {changePage(4)}, width: "170px"}}/>
                <Button data={{components: [ <div key={0} className="">Choose Farms</div> ],callback: ()=>{router.push("/")}, width: "170px"}}/>
            
            </div>

            {pages[0] ?
                <div style={{margin: "150px 0px"}}>
                    <Block data={{icon: "",content: "Total Value Deposited" , description: `${totalInvested/1e18} BNB`, title: `$${web3Context.bnbPrice ? Math.floor(totalInvested/1e18 * web3Context.bnbPrice *1e5)/1e5 : 0}`}}/>
                    <Block data={{icon: "",content: "Total Referal Earnings" , description: `${totalBonus/1e18} BNB`, title: `$${web3Context.bnbPrice ?Math.floor( totalBonus/1e18 * web3Context.bnbPrice * 1e5)/1e5 : 0}`}}/>                
                </div>
                :
                <Stake data={{
                    pages, 
                    bnbPrice: web3Context.bnbPrice,
                    contract,
                    userAvailable,
                    userDeposit,
                    userBnb,
                    userTokenBal,
                    totalReferrals,
                    userReferralTotalBonus,
                    contractTokenBal,
                    harvest,
                    }} />
            }
        </div>       
    </>
}