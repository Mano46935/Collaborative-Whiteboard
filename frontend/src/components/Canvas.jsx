import {useEffect, useRef, useCallback} from "react";
//Draw single stroke onto 2d context
function drawStroke(ctx,stroke){
const {points,color,width,tool}=stroke;
if(!points ||points.length==0)return;
ctx.lineJoin="round";
ctx.lineCap="round";
ctx.lineWidth=width;
ctx.globalCompositeOperation=tool==="eraser"?"destination-out" : "source-over";
ctx.strokeStyle=tool=="eraser"? "rgba(0,0,0,1)" : color;
if (points.length === 1) {
    // A single dot
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, width / 2, 0, Math.PI * 2);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
}
export default function Canvas({strokes,liveStrokes,tool,color,width,onLocalStrokeStart,onLocalStrokePoint,onLocalStrokeEnd,onCursorMove}){
    const canvasRef=useRef(null);//For canvas
    const containerRef=useRef(null);
    const drawingRef=useRef(false);
    const activeStrokeRef=useRef(null);

    const resizeCanvas=useCallback(()=>{
const canvas=canvasRef.current;
const container=containerRef.current;
if(!canvas || !container)return;
const dpr=window.devicePixelRatio||1;//1 Css pixel equal how many physical pixels.
const{width:w,height:h}=container.getBoundingClientRect();
canvas.width=w*dpr;
canvas.height=h*dpr;
canvas.style.width=`${w}px`;
canvas.style.height=`${h}px`;
const ctx=canvas.getContext("2d");
ctx.setTransform(dpr,0,0,dpr,0,0);
    },[]);
    useEffect(()=>{
        resizeCanvas();
        window.addEventListener("resize",resizeCanvas);
        return ()=>window.removeEventListener("resize",resizeCanvas);

    },[resizeCanvas]);
    
    useEffect(()=>{
        const canvas=canvasRef.current;
          if (!canvas) return;
        const ctx=canvas.getContext("2d");
        const dpr=window.devicePixelRatio||1;
        ctx.save();
        ctx.setTransform(1,0,0,1,0,0);
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.restore();
    strokes.forEach((s) => drawStroke(ctx, s));
    Object.values(liveStrokes).forEach((s) => drawStroke(ctx, s));
  }, [strokes, liveStrokes]);
 const getPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };
  //Mouse click/Touch
  const handlePointerDown=(e)=>{
    const point=getPoint(e);
    drawingRef.current=true;
    const stroke={
        strokeId:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
        tool,
        color,
        width,
        points:[point],
    };
    activeStrokeRef.current=stroke;
    onLocalStrokeStart(stroke);
  };
  const handlePointerMove=(e)=>{
    const point=getPoint(e);
    onCursorMove(point.x,point.y);
    if(!drawingRef.current ||!activeStrokeRef.current)return;
    activeStrokeRef.current.points.push(point);
    onLocalStrokePoint(activeStrokeRef.current.strokeId,point);
    //Draw the new segment
    const canvas=canvasRef.current;
    const ctx=canvas.getContext("2d");
    drawStroke(ctx,activeStrokeRef.current);
  };
  const handlePointerUp=()=>{
    if(!drawingRef.current || !activeStrokeRef.current)return;
    drawingRef.current=false;
    onLocalStrokeEnd(activeStrokeRef.current);
    activeStrokeRef.current=null;
  };

  return(
    <div ref={containerRef} className="canvas-container">
        <canvas ref={canvasRef}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        />

    </div>
  );
}