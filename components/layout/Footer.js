import Class from "./Footer.module.sass"
import Button from "../ui/Button"
import Image from "next/image"

function Footer({data}) {
    return <>
        <div className={Class.footer}>

            <div className={Class.naviBar}>
                <Button data={{components: [<div key={0} className="">Multitoken Farm Contract</div> ],callback: null, width: "250px", pageButton2: true}}/>
                <Button data={{components: [<div key={0} className="">Multitoken Contract</div> ],callback: null, width: "250px", pageButton2: true}}/>
                <Button data={{components: [<div key={0} className="">Project Information</div> ],callback: null, width: "250px", pageButton2: true}}/>
                <Button data={{components: [<div key={0} className="">Join us on telegram</div> ],callback: null, width: "250px", pageButton2: true}}/>
            </div>

            <div style={{fontSize: "3em", cursor: "pointer", lineHeight: "1em", textAlign: "center"}}>AUDIT REPORT</div>

            <div className={Class.bottom}>
                <div className={Class.socialIcons}>
                    {/* <div className={Class.icon}><a href={data && data.github}><i className="fab fa-github-square fa-2x"></i></a></div> */}
                    <div className={Class.icon}><a href={data && data.twitter}><i className="fab fa-telegram-plane fa-2x"></i></a></div>
                    <div className={Class.icon}><a href={data && data.telegram}><i className="fab fa-twitter-square fa-2x"></i></a></div>
                    <div className={Class.icon}><a href={data && data.medium}><i className="fab fa-medium fa-2x"></i></a></div>
                
                </div>

                <div className={Class.copyright}>{data && data.copyright}</div>
            </div>
        </div>
    </>
}

export default Footer