import InputTextField from "../ui/InputTextField"
import Button from "../ui/Button"
import { useRef } from "react"
export default function InputButton({data}) {
    const ref = useRef()
    
    function click() {
        data.callback(ref.current.value)
    }
    return <>
        <div style={{display: "flex"}}>
            <InputTextField data={{ref: ref,callback: null, placeholder: null,width: null}}/>
            <Button data={{components: [<div key={0} className="">{data.buttonText}</div> ],callback: click, width: "200px"}}/>
        </div>
    </>
}
// data = {callback: null, buttonText: "TEST"}