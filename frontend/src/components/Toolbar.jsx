const COLORS=["#1e1e1e", "#e53935", "#1e88e5", "#43a047", "#fb8c00", "#8e24aa"];
const WIDTHS=[2,4,8,14];
export default function Toolbar({tool,setTool,color,setColor,width,setWidth,onClear,onUndo,onLeave,boardName}){
    return(
        <div className="toolbar">
            <div className="toolbar-section toolbar-title">
                <button className="icon-btn" onClick={onLeave} title="Back to boards">
                       ←
                </button>
                <span className="board-title">{boardName}</span>
            </div>
            <div className="toolbar-section">
                <button className={`tool-btn ${tool==="pen"?"active":""}`}
                onClick={()=>setTool("pen")}
                title="Pen"
                >
                   ✎ Pen 
                </button>
                <button className={`tool-btn ${tool==="eraser"?"active":""}`}
                onClick={()=>setTool("eraser")}
                title="Eraser">
                      ▭ Eraser
                </button>
                </div>
                <div className="toolbar-section">
                    {COLORS.map((c)=>(
                        <button key={c}
                        className={`color-swatch ${color===c?"active":""}`}
                        style={{backgroundColor:c}}
                        onClick={()=>setColor(c)}
                        title={c}
                        />
                    ))}
                </div>
                <div className="toolbar-section">
                    {WIDTHS.map((w)=>(
                        <button key={w}
                        className={`width-btn ${width===w?"active":""}`}
                        onClick={()=>setWidth(w)}
                        title={`${w}px`}>
                            <span className="width-dot" style={{width:w,height:w}}/>
                        </button>
                    ))}
                </div>
                 <div className="toolbar-section toolbar-actions">
        <button className="tool-btn" onClick={onUndo} title="Undo your last stroke">
          ↶ Undo
        </button>
        <button className="tool-btn danger" onClick={onClear} title="Clear the entire board">
          🗑 Clear
        </button>
      </div>
           
        </div>
    );
}