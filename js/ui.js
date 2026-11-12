// UI: tab, tema, kontrol, grafik SVG, animasi canvas, hitung manual. Butuh engine.js
const $=id=>document.getElementById(id);
const fmt=(x,d)=>x.toLocaleString('id-ID',{minimumFractionDigits:d,maximumFractionDigits:d});
const JAAM={datang:18,selesai:17,m1:67.85,m2:45.85,daftar:11.06,bayar:11.09,wq:5.24,lq:0.1967,lmax:2};
const ROWS=[['datang','Mobil datang',0],['selesai','Mobil selesai',0],['m1','Utilisasi Montir 1 (%)',2],['m2','Utilisasi Montir 2 (%)',2],['daftar','Utilisasi Pendaftaran (%)',2],['bayar','Utilisasi Pembayaran (%)',2],['wq','Waktu tunggu rata-rata (menit)',2],['lq','Panjang antrian rata-rata',3],['lmax','Antrian maksimum',0]];

function barSvg(labels,series,unit){
  const W=460,H=220,mx=Math.max(1,...series.flatMap(s=>s.v))*1.15,bw=Math.min(26,(W-60)/labels.length/(series.length+.6)),g=(W-50)/labels.length;let o='<svg viewBox="0 0 '+W+' '+H+'"><line class="ax" x1="40" y1="180" x2="'+W+'" y2="180"/>';
  labels.forEach((l,i)=>{o+='<text x="'+(40+g*i+g/2)+'" y="198" text-anchor="middle">'+l+'</text>';
    series.forEach((s,j)=>{const h=s.v[i]/mx*160,x=40+g*i+g/2-series.length*bw/2+j*bw;o+='<rect class="'+s.c+'" x="'+x+'" y="'+(180-h)+'" width="'+(bw-2)+'" height="'+h+'"><title>'+l+' ('+s.n+'): '+fmt(s.v[i],unit)+'</title></rect><text x="'+(x+bw/2-1)+'" y="'+(176-h)+'" text-anchor="middle">'+fmt(s.v[i],unit)+'</text>'})});
  series.forEach((s,j)=>{o+='<rect class="'+s.c+'" x="'+(50+j*130)+'" y="6" width="10" height="10"/><text x="'+(64+j*130)+'" y="15">'+s.n+'</text>'});
  return o+'</svg>';
}
function stepSvg(ql,T,lmax){
  const W=460,H=220,my=Math.max(1,lmax),X=t=>40+t/T*(W-50),Y=v=>180-v/my*150;let d='M'+X(0)+' '+Y(0);
  ql.forEach(([t,v],i)=>{d+=' H'+X(t)+' V'+Y(v)});
  let o='<svg viewBox="0 0 '+W+' '+H+'"><line class="ax" x1="40" y1="180" x2="'+W+'" y2="180"/><line class="ax" x1="40" y1="20" x2="40" y2="180"/>';
  for(let v=0;v<=my;v++)o+='<text x="34" y="'+(Y(v)+4)+'" text-anchor="end">'+v+'</text>';
  for(let i=0;i<=4;i++)o+='<text x="'+X(T*i/4)+'" y="198" text-anchor="middle">'+Math.round(T*i/4)+'</text>';
  return o+'<path class="ln" d="'+d+'"/><text x="'+(W-4)+'" y="214" text-anchor="end">menit</text></svg>';
}

// ---------- Tema & tab ----------
const root=document.documentElement;
$('th').onclick=()=>{const t=root.dataset.theme==='dark'?'light':'dark';root.dataset.theme=t;try{localStorage.setItem('th',t)}catch(e){}};
const TABS=['simulasi','animasi','grafik','manual'];
function tab(n){if(!TABS.includes(n))n='simulasi';TABS.forEach(t=>{$('p-'+t).hidden=t!==n});document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('on',b.dataset.tab===n))}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{location.hash=b.dataset.tab});
addEventListener('hashchange',()=>tab(location.hash.slice(1)));

// ---------- Animasi ----------
const ctx=$('cv').getContext('2d');
const A={mv:[],i:0,clock:0,play:true,T:480,done:0,speed:60,cars:{},L:{qd:[],daf:[],qt:[],m1:[],m2:[],qb:[],bay:[]},logs:[],dirty:true};
const ST={src:[50,180],qd:[185,180],daf:[262,180],qt:[410,180],m1:[535,95],m2:[535,265],qb:[705,180],bay:[780,180],out:[858,180]};
const QS={qd:1,qt:1,qb:1},COL={qd:'--yel',daf:'--yel',qt:'--red',m1:'--blue',m2:'--blue',qb:'--grn',bay:'--grn'};
const TXT={qd:'tiba, antri pendaftaran',daf:'mulai mendaftar',qt:'menunggu di ruang tunggu',m1:'mulai diperbaiki Montir 1',m2:'mulai diperbaiki Montir 2',qb:'antri pembayaran',bay:'mulai membayar',out:'keluar bengkel'};
function aReset(){A.i=0;A.clock=0;A.done=0;A.cars={};A.logs=[];A.dirty=true;for(const k in A.L)A.L[k]=[]}
function aStep(dt){
  A.clock=Math.min(A.T,A.clock+dt*A.speed);
  while(A.i<A.mv.length&&A.mv[A.i][0]<=A.clock){
    const[t,car,to,d]=A.mv[A.i++];for(const k in A.L){const x=A.L[k].indexOf(car);if(x>=0)A.L[k].splice(x,1)}
    if(to==='out'){A.done++;delete A.cars[car]}else{A.L[to].push(car);const o=A.cars[car]||(A.cars[car]={x:ST.src[0],y:ST.src[1]});o.s=t;o.d=d}
    A.logs.push(fmt(t,0)+' mnt · Mobil '+car+' '+TXT[to]);A.dirty=true}
}
const rr=(x,y,w,h,r)=>{ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):ctx.rect(x,y,w,h)};
function drawCar(x,y,c,n){ctx.fillStyle=c;rr(x-14,y-7,28,13,4);ctx.fill();ctx.fillStyle='rgba(255,255,255,.4)';rr(x-7,y-11,14,6,3);ctx.fill();
  ctx.fillStyle='#111';ctx.beginPath();ctx.arc(x-8,y+7,3.2,0,7);ctx.fill();ctx.beginPath();ctx.arc(x+8,y+7,3.2,0,7);ctx.fill();
  ctx.font='bold 9px system-ui';ctx.textAlign='center';ctx.fillText(n,x,y+3)}
function aDraw(){
  const cs=getComputedStyle(root),V=n=>cs.getPropertyValue(n).trim();ctx.clearRect(0,0,900,340);ctx.textAlign='center';
  ctx.fillStyle=V('--bg2');rr(20,152,860,56,10);ctx.fill();ctx.strokeStyle=V('--line');ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(30,180);ctx.lineTo(870,180);ctx.stroke();
  ctx.setLineDash([3,4]);[['qt','m1'],['qt','m2'],['m1','qb'],['m2','qb']].forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(ST[a][0]+(QS[a]?50:35),ST[a][1]);ctx.lineTo(ST[b][0]+(QS[b]?-60:-35),ST[b][1]);ctx.stroke()});ctx.setLineDash([]);
  const bay=(k,w,h,label)=>{const[px,py]=ST[k],cx=QS[k]?px-w/2+10:px,busy=!QS[k]&&A.L[k]&&A.L[k].length;
    ctx.fillStyle=V('--card');rr(cx-w/2,py-h/2,w,h,8);ctx.fill();ctx.lineWidth=busy?2.5:1.2;ctx.strokeStyle=busy?V('--acc'):V('--line');if(QS[k])ctx.setLineDash([4,3]);ctx.stroke();ctx.setLineDash([]);ctx.lineWidth=1;
    ctx.fillStyle=V('--mut');ctx.font='11px system-ui';ctx.fillText(label,cx,py+h/2+14);
    if(busy){const o=A.cars[A.L[k][0]];if(o&&o.d){const f=Math.min(1,(A.clock-o.s)/o.d);ctx.fillStyle=V('--line');rr(cx-w/2+6,py-h/2-9,w-12,5,2);ctx.fill();ctx.fillStyle=V('--acc');rr(cx-w/2+6,py-h/2-9,(w-12)*f,5,2);ctx.fill()}}};
  bay('src',56,40,'Kedatangan');bay('qd',120,40,'Antrian Daftar');bay('daf',64,44,'Pendaftaran');bay('qt',120,40,'Ruang Tunggu');
  bay('m1',76,48,'Montir 1');bay('m2',76,48,'Montir 2');bay('qb',120,40,'Antrian Bayar');bay('bay',64,44,'Pembayaran');bay('out',46,40,'Keluar');
  for(const k in A.L)A.L[k].forEach((c,j)=>{const o=A.cars[c],tx=ST[k][0]-(QS[k]?j*20:0);o.x+=(tx-o.x)*.2;o.y+=(ST[k][1]-o.y)*.2;ctx.fillStyle=V(COL[k]);drawCar(o.x,o.y,V(COL[k]),c)});
  ctx.fillStyle=V('--fg');ctx.font='bold 13px system-ui';ctx.textAlign='left';ctx.fillText('Mobil keluar: '+A.done,740,28);
  $('clk').textContent='Clock '+fmt(A.clock,1)+' / '+A.T+' menit';
}
let lt=0;function loop(ts){const dt=Math.min(.05,(ts-lt)/1000||0);lt=ts;if(A.play&&A.clock<A.T)aStep(dt);aDraw();
  if(A.dirty){$('lg').innerHTML=A.logs.slice(-7).reverse().map(s=>'<li>'+s+'</li>').join('');A.dirty=false}requestAnimationFrame(loop)}
$('pl').onclick=()=>{A.play=!A.play;$('pl').textContent=A.play?'⏸ Jeda':'▶ Lanjut'};
$('rs').onclick=()=>{aReset();A.play=true;$('pl').textContent='⏸ Jeda'};
document.querySelectorAll('#spd button').forEach(b=>b.onclick=()=>{A.speed=+b.dataset.v;document.querySelectorAll('#spd button').forEach(x=>x.classList.toggle('on',x===b))});

// ---------- Jalankan ----------
function run(){
  const p={iat:+$('iat').value,T:+$('T').value},seed=Math.floor(+$('seed').value||0),n=+$('rep').value;
  $('oIat').textContent=p.iat;$('oT').textContent=p.T;$('oRep').textContent=n;
  let sum={},first,fin=[];
  for(let i=0;i<n;i++){const o=runRandom(p,seed+i,i===0);if(i===0)first=o;fin.push(o.res.selesai);for(const k in o.res)sum[k]=(sum[k]||0)+o.res[k]}
  const R={};for(const k in sum)R[k]=sum[k]/n;const d0=n>1?1:0;
  $('mode').textContent=n===1?'· 1 run, seed '+seed:'· rata-rata '+n+' run';
  $('kpi').innerHTML=[['Mobil selesai',fmt(R.selesai,d0),'dari '+fmt(R.datang,d0)+' mobil datang','--grn'],['Utilisasi montir',fmt((R.m1+R.m2)/2,1)+'%','rata-rata 2 montir','--acc'],
    ['Tunggu rata-rata',fmt(R.wq,1)+' mnt','di Ruang Tunggu','--red'],['Antrian maksimum',fmt(R.lmax,d0),'mobil di Ruang Tunggu','--blue']]
    .map(([k,v,s,c])=>'<div class="kpi" style="--c:var('+c+')"><span class="k">'+k+'</span><b class="v">'+v+'</b><small>'+s+'</small></div>').join('');
  $('meters').innerHTML=[['Montir 1','m1'],['Montir 2','m2'],['Pendaftaran','daftar'],['Pembayaran','bayar']].map(([l,k])=>
    '<div class="meter"><span>'+l+'</span><i><b style="width:'+Math.min(100,R[k]).toFixed(1)+'%"></b><u style="left:'+JAAM[k]+'%" title="JaamSim: '+JAAM[k]+'%"></u></i><em>'+fmt(R[k],1)+'%</em></div>').join('');
  $('cmp').innerHTML='<tr><th>Metrik</th><th class="n">Web / Python</th><th class="n">JaamSim (1 run)</th></tr>'+ROWS.map(([k,l,d])=>'<tr><td>'+l+'</td><td class="n">'+fmt(R[k],n>1&&d===0?1:d)+'</td><td class="n">'+fmt(JAAM[k],d)+'</td></tr>').join('');
  $('g1').innerHTML=barSvg(['Montir 1','Montir 2','Daftar','Bayar'],[{n:'Web',c:'b1',v:[R.m1,R.m2,R.daftar,R.bayar]},{n:'JaamSim',c:'b2',v:[JAAM.m1,JAAM.m2,JAAM.daftar,JAAM.bayar]}],1);
  $('g2').innerHTML=stepSvg(first.ql,p.T,first.lmax);
  $('g3c').hidden=n<2;if(n>1){const cnt={};fin.forEach(v=>cnt[v]=(cnt[v]||0)+1);const ks=Object.keys(cnt).map(Number).sort((a,b)=>a-b);$('g3').innerHTML=barSvg(ks.map(String),[{n:'Replikasi',c:'b1',v:ks.map(k=>cnt[k])}],0)}
  A.mv=first.mv;A.T=p.T;aReset();A.play=true;$('pl').textContent='⏸ Jeda';
}
// ---------- Hitung manual ----------
const DEF=[[0,2,30,3],[5,3,25,2],[3,2,35,3],[4,3,20,2],[6,2,28,3],[2,3,32,2]];
function buildMi(){$('mi').innerHTML='<tr><th>Mobil</th><th>Antar-kedatangan</th><th>Waktu daftar</th><th>Waktu perbaikan</th><th>Waktu bayar</th></tr>'+
  DEF.map((r,i)=>'<tr><td>'+(i+1)+'</td>'+r.map((v,j)=>'<td><input type="number" min="0" step="0.5" data-i="'+i+'" data-j="'+j+'" value="'+v+'"></td>').join('')+'</tr>').join('')}
function manual(){
  const D=DEF.map(r=>r.slice());document.querySelectorAll('#mi input').forEach(e=>{D[+e.dataset.i][+e.dataset.j]=Math.max(0,+e.value||0)});
  const o=sim({T:Infinity,first:D[0][0],n:D.length,iat:i=>D[i-1][0],daf:i=>D[i-1][1],rep:i=>D[i-1][2],pay:i=>D[i-1][3],trace:true});
  $('mt').innerHTML='<tr><th class="n">Clock</th><th>Mobil</th><th>Kejadian</th><th class="n">L(t) antrian</th><th>Montir 1</th><th>Montir 2</th><th>Event calendar</th><th>Waktu tunggu</th></tr>'+
    o.tr.map(r=>'<tr><td class="n">'+r2(r.t)+'</td><td>'+r.car+'</td><td>'+KN[r.k]+'</td><td class="n">'+r.L+'</td><td>'+r.m1+'</td><td>'+r.m2+'</td><td>'+r.cal+'</td><td>'+(r.note||'-')+'</td></tr>').join('');
  const tw=o.waits.reduce((a,b)=>a+b,0),n=D.length,TT=o.TT,b=o.busy,pc=v=>fmt(v/TT*100,2)+'%';
  $('mf').textContent='Total mobil = '+n+', waktu simulasi berakhir = '+r2(TT)+' menit\n'+
   'Rata-rata waktu tunggu Ruang-Tunggu = '+r2(tw)+' / '+n+' = '+fmt(tw/n,2)+' menit\n'+
   'Utilisasi Montir 1 = '+r2(b.m1)+' / '+r2(TT)+' = '+pc(b.m1)+'\nUtilisasi Montir 2 = '+r2(b.m2)+' / '+r2(TT)+' = '+pc(b.m2)+'\n'+
   'Utilisasi Pendaftaran = '+r2(b.daftar)+' / '+r2(TT)+' = '+pc(b.daftar)+'\nUtilisasi Pembayaran = '+r2(b.bayar)+' / '+r2(TT)+' = '+pc(b.bayar);
}
// ---------- Init ----------
let tm;const lazy=()=>{clearTimeout(tm);tm=setTimeout(run,120)};
['iat','T','rep','seed'].forEach(i=>$(i).addEventListener('input',lazy));
$('rnd').onclick=()=>{$('seed').value=Math.floor(Math.random()*9000)+1;run()};
$('mc').onclick=manual;buildMi();tab(location.hash.slice(1));run();manual();requestAnimationFrame(loop);
