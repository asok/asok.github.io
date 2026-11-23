// A low-resolution software-rendered title screen, drawn once at load.
function drawWorld(canvas) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width, height = canvas.height;
  let seed = 719;
  function random() {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  }
  function face(points, fill) {
    ctx.beginPath();
    points.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }
  const sky = ctx.createLinearGradient(0,0,0,height);
  sky.addColorStop(0,'#101726'); sky.addColorStop(.6,'#294563'); sky.addColorStop(1,'#102338');
  ctx.fillStyle = sky; ctx.fillRect(0,0,width,height);
  for(let i=0;i<170;i++) {
    ctx.fillStyle = i%7 ? '#678096' : '#c6d9d4';
    ctx.fillRect(Math.floor(random()*width),Math.floor(random()*135),1,1);
  }
  // A receding, triangulated mountain range and a perspective floor.
  for(let ridge=0;ridge<3;ridge++){
    let x=-30,y=133+ridge*13;
    while(x<width){
      const step=18+random()*53, peakX=x+step*.5;
      const peakY=y-10-random()*30;
      const tone=45-ridge*9+Math.floor(random()*10);
      face([[x-23,y+25],[peakX,peakY],[x+step+25,y+25]],'rgb('+tone+','+(tone+22)+','+(tone+40)+')');
      face([[peakX,peakY],[x+step+25,y+25],[peakX+7,y+20]],'rgb('+(tone-12)+','+(tone+8)+','+(tone+28)+')');
      x+=step;
    }
  }
  ctx.fillStyle='#162a3c'; ctx.fillRect(0,174,width,46);
  ctx.strokeStyle='#355263';ctx.lineWidth=.6;
  for(let n=-18;n<=18;n++){ctx.beginPath();ctx.moveTo(420+n*9,174);ctx.lineTo(420+n*78,220);ctx.stroke()}
  for(const y of [175,178,183,191,204,219]){ctx.fillRect(0,y,width,1);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke()}
  // The sword's local origin is at the guard, with the blade pointing down.
  ctx.save();
  ctx.translate(468, 55);
  ctx.rotate(-0.29);
  face([[-16,0],[22,0],[22,88],[-16,123]], '#75828d');
  face([[-16,0],[-13,0],[-13,118],[-16,123]], '#414d5a');
  face([[12,0],[22,0],[22,88],[-16,123],[12,85]], '#cbd7da');
  face([[19,0],[22,0],[22,88],[-16,123],[19,87]], '#edf3ef');
  face([[-10,40],[5,33],[-8,41]], '#95a0a9');
  face([[-6,72],[3,66],[-5,73]], '#596673');

  // Center the hilt on the blade, whose shoulders span x=-16 to x=22.
  ctx.translate(3, 0);
  face([[-21,-6],[21,-6],[24,-3],[21,1],[-21,1],[-24,-3]], '#88724f');
  face([[-21,-6],[21,-6],[23,-4],[-23,-4]], '#c3af82');
  ctx.fillStyle = '#643e37';
  ctx.fillRect(-4,-36,8,30);
  for (let y=-35; y<-10; y+=5) {
    face([[-4,y], [4,y+2], [4,y+4], [-4,y+2]], '#a26a55');
  }
  ctx.fillStyle = '#a1a9a9';
  ctx.fillRect(-5,-39,10,4);
  ctx.restore();

  // A ridge crosses the lower blade so the point disappears into the rock.
  face([[402,193],[451,168],[479,160],[501,155],[524,162],[550,173],[584,192]], '#344455');
  face([[402,193],[479,160],[463,177]], '#4e5d6b');
  face([[463,177],[501,155],[484,180],[447,193]], '#435464');
  face([[484,180],[501,155],[524,162],[544,188]], '#283849');
  face([[402,193],[463,177],[484,180],[544,188],[584,192],[493,200]], '#1c2c3b');
  // Ordered screen-door shading ties the planes and the landscape together.
  ctx.fillStyle='#08142319';
  for(let y=0;y<height;y+=2) for(let x=y%4;x<width;x+=4)ctx.fillRect(x,y,1,1);
  const shade=ctx.createLinearGradient(0,0,width*.65,0);
  shade.addColorStop(0,'#091323e8');shade.addColorStop(.62,'#091323ba');shade.addColorStop(1,'#09132300');
  ctx.fillStyle=shade;ctx.fillRect(0,0,width,height);
}
const canvas=document.querySelector('#world');
if(canvas)drawWorld(canvas);
addEventListener('keydown',event=>{
  if(event.altKey || event.metaKey || event.ctrlKey || event.target.closest('input,textarea,select,[contenteditable]'))return;
  const id={'ArrowLeft':'prev','ArrowRight':'next'}[event.key];
  if(id){event.preventDefault();document.getElementById(id).click()}
});
