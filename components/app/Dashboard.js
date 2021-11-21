import Block from "../ui/BlockV3"
import Image from "next/image"
import router from 'next/router'
import Web3Context from "../../src/Web3Context"
import { useContext, useEffect, useState } from "react"


export default function Dashboard() {
    const web3Context = useContext(Web3Context)
    const bnbContractAddr =  process.env.NEXT_PUBLIC_PRODUCTION != "TRUE" ? 
        "0x5546eD923058aCE072321Ec450Ac313B6aC8dF5F" : // testnet address
        "0x5c8DD71356AAEf08a9050386797323215cBe0a63"   // mainnet address
    const [bscValue, setBscValue] = useState()
    useEffect(()=>{
        web3Context.web3.eth.getBalance(bnbContractAddr).then((val)=>{setBscValue(val)})
        web3Context.setPage({title: "Dashboard", subtitle: "MULTI CHAIN FARMS", logo: null})
    },[web3Context.web])
    return <>
        <div style={{display: "flex", justifyContent: "center", flexWrap: "wrap"}}>
            <Block data={{
                icons: [
                    <div key={0} style={{cursor: "pointer"}}><Image src="/images/bnb-logo.png" width={50} height={50} layout={"fixed"} onClick={()=>{router.push("/bsc-bnb")}}/></div>,
                    <div key={1}><Image src="/images/eth-icon.png" width={50} height={50} layout={"fixed"}/></div>,
                    <div key={2}><Image src="/images/cake-logo2.png" width={50} height={50} layout={"fixed"}/></div>,
                    <div key={3}><Image src="/images/bitcon-icon.png" width={50} height={50} layout={"fixed"}/></div>,
                    <div key={4}><Image src="/images/usdtLogo.png" width={50} height={50} layout={"fixed"}/></div>,
                ],
                content: "Total Value in Contract" , 
                description: `$ ${web3Context.bnbPrice ? Math.floor(bscValue/1e18 * web3Context.bnbPrice * 1e5)/1e5: 0}`,
                title: "BSC CHAIN"}}/>

            <Block data={{
                icons: [
                <Image key={0} src="/images/matic-logo.png" width={50} height={50} layout={"fixed"}/>,
                ],
                content: "Total Value in Contract" , 
                description: "Coming soon", 
                title: "POLYGON"}}/>
            
            <Block data={{
                icons: [
                <Image key={0} src="/images/ftm-logo.png" width={50} height={50} layout={"fixed"}/>,
                ],
                content: "Total Value in Contract" , 
                description: "Coming soon", 
                title: "FANTOM CHAIN"}}/>

            <Block data={{
                icons: [
                <Image key={0} src="/images/iotx-logo.webp" width={50} height={50} layout={"fixed"}/>,
                ],
                content: "Total Value in Contract" , 
                description: "Coming soon", 
                title: "IOTEX CHAIN"}}/>
            <Block data={{
                icons: [
                <Image key={0} src="/images/huobi-logo.png" width={50} height={50} layout={"fixed"}/>,
                ],
                content: "Total Value in Contract" , 
                description: "Coming soon", 
                title: "HUOBI CHAIN"}}/>   
            <Block data={{
                icons: [
                <Image key={0} src="/images/ava-logo.png" width={50} height={50} layout={"fixed"}/>,
                ],
                content: "Total Value in Contract" , 
                description: "Coming soon", 
                title: "AVALANCHE"}}/> 
        </div> 
    </>
}

