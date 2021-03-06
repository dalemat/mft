import Class from "./Button.module.css"
function Button({data}) {
    return <>
        <div onClick={data.callback} className={!data.pageButton2 ? Class.pageButton : Class.pageButton2} style={{
                width: data.width ? data.width : "auto", 
            }} ref={data.ref}>
            {data.components.map(compoennt=>compoennt)}
        </div>
    </>
}
export default Button

// data format 

// const logoutButtonData = {
//     components: [<i class="fas fa-sign-out-alt"></i>,<div className="disconnect">Logout</div> ],
//     width: null,
//     callback: logout
// }