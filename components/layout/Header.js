
import Button from "../ui/Button"
import Class from "./Header.module.sass"
import router from 'next/router'
import Image from "next/image"


function Header({userAddr, chain, login, logout, page}) {
    
    const loginButtonData = {
        components: [<div key="1" className="connect">Connect</div>],
        width: "150px",
        callback: login
    }

    const logoutButtonData = {
        components: [<div key="1" className="disconnect">Disconnect</div> ],
        width: "150px",
        callback: logout
    }    

    return <>
        <div className={Class.header}>

            <div className={Class.imgs} onClick={()=>{router.push("/")}} >
                <Image src="/images/mult-text-logo.png" width={250} height={150} layout={"fixed"}/>
            </div>
            
            {/* <div className={Class.userInfo}>                
                <div className="addr">{userAddr && userAddr.slice(0,6)+ "...."+userAddr.slice(-4)}</div>
                <div className="chain">{userAddr && chain}</div>
            </div> */}

            <div className={Class.pages}>
                <div>{page.title}</div>
                <div>{page.subtitle}</div>
            </div>

            <div className={Class.pageIcon} onClick={()=>{router.push("/")}} >
                {page.logo && <Image src={page.logo} width={150} height={150} layout={"fixed"}/>}
            </div>
            
            <div className={Class.buttons}>
                {!userAddr && <Button data={loginButtonData} />}
                {userAddr && <Button data={logoutButtonData} />}
            </div>
            
        </div>
    </>
}
export default Header