// Decode separate opaque figures instead of assuming equal cells in generated art.
// Cached canvases are runtime textures; the original image assets stay intact.
export function decodeSprites(image,rows,{splitQueen=false}={}){
 const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
 const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(image,0,0);const pixels=c.getImageData(0,0,canvas.width,canvas.height),{width:w,height:h}=canvas;
 const labels=new Int32Array(w*h),queue=new Int32Array(w*h),components=[];let next=0;
 const seamX=Math.round(w*861/1254),seamTop=Math.round(h*599/1254),seamBottom=Math.round(h*828/1254),minBody=Math.max(50,w*h/(rows*6)*.08);
 const seam=(a,b)=>splitQueen&&Math.min(a%w,b%w)<seamX&&Math.max(a%w,b%w)>=seamX&&Math.floor(a/w)>=seamTop&&Math.floor(a/w)<seamBottom;
 for(let p=0;p<labels.length;p++){
  if(labels[p]||pixels.data[p*4+3]<128)continue;const id=++next;let head=0,tail=1,minX=w,minY=h,maxX=0,maxY=0;queue[0]=p;labels[p]=id;
  while(head<tail){const q=queue[head++],x=q%w,y=Math.floor(q/w);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
   for(const n of [x>0?q-1:-1,x<w-1?q+1:-1,y>0?q-w:-1,y<h-1?q+w:-1])if(n>=0&&!labels[n]&&pixels.data[n*4+3]>=128&&!seam(q,n)){labels[n]=id;queue[tail++]=n;}
  }if(tail>minBody)components.push({id,count:tail,x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1});
 }
 const result=Array.from({length:rows},()=>[]);
 for(const s of components){const row=Math.min(rows-1,Math.floor((s.y+s.h/2)/h*rows));result[row].push(s);}
 result.forEach((row,r)=>{row.sort((a,b)=>b.count-a.count);row.splice(6);row.sort((a,b)=>a.x+a.w/2-b.x-b.w/2);if(row.length!==6)throw new Error(`Sprite row ${r}: ${row.length}/6 poses`);
  row.forEach(s=>{const cv=document.createElement('canvas');cv.width=s.w;cv.height=s.h;const out=new ImageData(s.w,s.h);let footX=0,footN=0;
   for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++){const source=(s.y+y)*w+s.x+x;if(labels[source]!==s.id)continue;const dest=(y*s.w+x)*4;out.data.set(pixels.data.subarray(source*4,source*4+4),dest);if(y>=s.h-12){footX+=x;footN++;}}
   cv.getContext('2d').putImageData(out,0,0);s.image=cv;s.pivotX=footN?footX/footN:s.w/2;s.pivotY=s.h;s.scaleHeight=row[0].h;
  });
 });return result;
}
export function spriteBounds(sprite,x,foot,scale){return{x:x-sprite.pivotX*scale,y:foot-sprite.h*scale,width:sprite.w*scale,height:sprite.h*scale};}
export function drawSprite(c,sprite,x,foot,scale){const r=spriteBounds(sprite,x,foot,scale);c.drawImage(sprite.image,r.x,r.y,r.width,r.height);return r;}

export function fitSpriteScale(frames,x,height,viewportWidth,padding=8,foot=Infinity){const left=Math.max(...frames.map(s=>s.pivotX)),right=Math.max(...frames.map(s=>s.w-s.pivotX));return Math.max(.05,Math.min(height/frames[0].h,(foot-padding)/Math.max(...frames.map(s=>s.h)),(x-padding)/Math.max(1,left),(viewportWidth-x-padding)/Math.max(1,right)));}
