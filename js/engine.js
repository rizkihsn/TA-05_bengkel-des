// Mesin DES (simulation clock + event calendar + antrian). Tanpa dependensi.
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const r2=x=>Math.round(x*100)/100;
const KN={A:'Kedatangan',ED:'Selesai-Daftar',ER:'Selesai-Perbaikan',EB:'Selesai-Bayar'};

// ---------- Mesin DES: c={T,first,n,iat(i),daf(i),rep(i),pay(i),trace} ----------
function sim(c){
  const T=c.T,cal=[],qd=[],qt=[],qb=[],free={daftar:1,m1:1,m2:1,bayar:1},busy={daftar:0,m1:0,m2:0,bayar:0},who={m1:0,m2:0};
  const waits=[],mv=[],ql=[[0,0]],tr=[];let seq=0,area=0,last=0,arr=0,done=0,lmax=0,note='';
  const M=(t,car,to,d)=>{if(c.trace)mv.push([t,car,to,d||0])};
  const sched=(t,k,d)=>{cal.push({t,s:seq++,k,d});cal.sort((a,b)=>a.t-b.t||a.s-b.s)}; // list selalu terurut waktu
  const serve=(n,now,d)=>{free[n]=0;busy[n]+=Math.min(d,T-now)};
  const tD=now=>{if(free.daftar&&qd.length){const car=qd.shift()[0],d=c.daf(car);M(now,car,'daf',d);serve('daftar',now,d);sched(now+d,'ED',car)}};
  const tM=now=>{for(const m of['m1','m2'])if(free[m]&&qt.length){const[car,t0]=qt.shift(),d=c.rep(car);waits.push(now-t0);note+='Mobil '+car+' menunggu '+r2(now-t0)+'; ';M(now,car,m,d);serve(m,now,d);who[m]=car;sched(now+d,'ER',[car,m])}};
  const tB=now=>{if(free.bayar&&qb.length){const car=qb.shift()[0],d=c.pay(car);M(now,car,'bay',d);serve('bayar',now,d);sched(now+d,'EB',car)}};
  sched(c.first,'A');let tl=0;
  while(cal.length){
    const e=cal.shift(),t=e.t;if(t>T)break;note='';
    area+=qt.length*(t-last);last=t;tl=t;let car;
    if(e.k==='A'){car=++arr;qd.push([car,t]);M(t,car,'qd');if(arr<(c.n||1e9))sched(t+(arr===0?0:c.iat(arr+1)),'A');tD(t)}
    else if(e.k==='ED'){car=e.d;free.daftar=1;qt.push([car,t]);M(t,car,'qt');tD(t);tM(t)}
    else if(e.k==='ER'){car=e.d[0];free[e.d[1]]=1;qb.push([car,t]);M(t,car,'qb');tM(t);tB(t)}
    else{car=e.d;free.bayar=1;done++;M(t,car,'out');tB(t)}
    lmax=Math.max(lmax,qt.length);
    if(c.trace){ql.push([t,qt.length]);tr.push({t,car,k:e.k,L:qt.length,m1:free.m1?'Idle':'Sibuk (M'+who.m1+')',m2:free.m2?'Idle':'Sibuk (M'+who.m2+')',
      cal:cal.slice(0,4).map(x=>KN[x.k]+'('+(x.k==='A'?arr+1:Array.isArray(x.d)?x.d[0]:x.d)+') @'+r2(x.t)).join(', ')||'-',note})}
  }
  const TT=isFinite(T)?T:last;area+=qt.length*(TT-last);ql.push([TT,qt.length]);
  const av=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
  return{TT,arr,done,busy,waits,tr,mv,ql,lmax,
    res:{datang:arr,selesai:done,m1:busy.m1/TT*100,m2:busy.m2/TT*100,daftar:busy.daftar/TT*100,bayar:busy.bayar/TT*100,wq:av(waits),lq:area/TT,lmax}};
}
function runRandom(p,seed,trace){
  const r=mulberry32(seed),ex=m=>-m*Math.log(1-r()),un=(a,b)=>a+(b-a)*r();
  const tri=(a,m,b)=>{const u=r(),F=(m-a)/(b-a);return u<F?a+Math.sqrt(u*(b-a)*(m-a)):b-Math.sqrt((1-u)*(b-a)*(b-m))};
  return sim({T:p.T,first:0,iat:()=>ex(p.iat),daf:()=>un(2,4),rep:()=>tri(20,30,40),pay:()=>un(2,4),trace:trace});
}
