import sharp from 'sharp';
const SP='/private/tmp/claude-501/-Users-cesarecicogna-Downloads-sito-candele/743b34db-dc32-4ae3-af59-b03b12700b93/scratchpad';
const img = sharp(SP+'/frames/lastB.jpg');
const { width:w, height:h } = await img.metadata();
const { data } = await img.raw().toBuffer({ resolveWithObject:true });
const at=(x,y)=>{const o=(y*w+x)*3; return [data[o],data[o+1],data[o+2]];};
const hex=c=>'#'+c.map(v=>v.toString(16).padStart(2,'0')).join('');
// colore di sfondo: media degli angoli
const corners=[[8,8],[w-9,8],[8,h-9],[w-9,h-9],[w>>1,10],[w>>1,h-11]].map(([x,y])=>at(x,y));
const avg=[0,1,2].map(i=>Math.round(corners.reduce((s,c)=>s+c[i],0)/corners.length));
console.log('dimensioni frame:', w+'x'+h);
console.log('angoli:', corners.map(hex).join(' '));
console.log('SFONDO AVORIO ->', hex(avg), avg);
// bounding box del logo: pixel che si discostano dallo sfondo
let minX=w, minY=h, maxX=0, maxY=0, n=0;
for(let y=0;y<h;y++) for(let x=0;x<w;x++){
  const [r,g,b]=at(x,y);
  const d=Math.abs(r-avg[0])+Math.abs(g-avg[1])+Math.abs(b-avg[2]);
  if(d>60){ n++; if(x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y; }
}
const bw=maxX-minX, bh=maxY-minY;
console.log('logo bbox:', {minX,minY,maxX,maxY,bw,bh,pixels:n});
console.log('centro logo  x:', ((minX+maxX)/2/w*100).toFixed(2)+'% della larghezza,  y:', ((minY+maxY)/2/h*100).toFixed(2)+'% dell\'altezza');
console.log('larghezza logo:', (bw/w*100).toFixed(2)+'% vw   altezza:', (bh/h*100).toFixed(2)+'% vh');
// colore piu' scuro del logo (verde)
let dark=[255,255,255];
for(let y=minY;y<=maxY;y++) for(let x=minX;x<=maxX;x++){ const c=at(x,y); if(c[0]+c[1]+c[2] < dark[0]+dark[1]+dark[2]) dark=c; }
console.log('verde piu\' scuro nel frame:', hex(dark));
