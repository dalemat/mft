import Class from "./BlockV3.module.sass"
function BlockV3({data}) {
    return <>
        <div className={Class.block}>
            <div className={Class.title}>{data.title}</div>
            <div className={Class.icon}>
                {data.icons.map((icon, id)=>{
                    return icon
                })}
            </div>            
            <div className={Class.content}>{data.content}</div>
            <div className={Class.description}>{data.description}</div>
            
        </div>
    </>
}
export default BlockV3;