const loader=document.getElementById('loader'),loaderNum=document.getElementById('loader-num'),loaderMsg=document.getElementById('loader-msg');
const msgs=['INITIALIZING SYSTEM...','LOADING ASSETS...','MOUNTING COMPONENTS...','ESTABLISHING CONNECTION...','BOOT SEQUENCE COMPLETE'];
let pct=0;
const li=setInterval(()=>{
  pct+=Math.random()*18+5;
  if(pct>=100){pct=100;clearInterval(li);setTimeout(()=>loader.classList.add('hidden'),300);}
  loaderNum.textContent=Math.floor(pct)+'%';
  loaderMsg.textContent=msgs[Math.min(Math.floor(pct/25),msgs.length-1)];
},200);

const hb=document.getElementById('hamburger'),nl=document.getElementById('nav-links');
hb.addEventListener('click',()=>{hb.classList.toggle('open');nl.classList.toggle('open');});
nl.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{hb.classList.remove('open');nl.classList.remove('open');}));

const cur=document.getElementById('cursor'),ring=document.getElementById('cursor-ring');
document.addEventListener('mousemove',e=>{
  cur.style.left=e.clientX+'px';cur.style.top=e.clientY+'px';
  ring.style.left=e.clientX+'px';ring.style.top=e.clientY+'px';
});
document.querySelectorAll('a,button,.btn,.project-card,.stat-card,.quote-btn').forEach(el=>{
  el.addEventListener('mouseenter',()=>{cur.style.transform='translate(-50%,-50%) scale(2)';ring.style.opacity='1';ring.style.width='48px';ring.style.height='48px';});
  el.addEventListener('mouseleave',()=>{cur.style.transform='translate(-50%,-50%) scale(1)';ring.style.opacity='0.5';ring.style.width='32px';ring.style.height='32px';});
});

const canvas=document.getElementById('matrix-bg'),ctx=canvas.getContext('2d');
let W,H,cols,drops,matrixColor='#00ff9f';
function initMatrix(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;cols=Math.floor(W/18);drops=Array(cols).fill(1);}
initMatrix();window.addEventListener('resize',initMatrix);
const chars='01アイウエオカキクケコサシスセソタチツテトナニヌネノ';
setInterval(()=>{
  ctx.fillStyle='rgba(2,11,6,0.05)';ctx.fillRect(0,0,W,H);
  ctx.fillStyle=matrixColor;ctx.font='13px Share Tech Mono';
  drops.forEach((y,i)=>{
    ctx.fillText(chars[Math.floor(Math.random()*chars.length)],i*18,y*18);
    if(y*18>H&&Math.random()>0.975)drops[i]=0;
    drops[i]++;
  });
},50);

function tick(){const t=new Date().toTimeString().split(' ')[0];document.getElementById('time-display').textContent=t;const t2=document.getElementById('time-display2');if(t2)t2.textContent=t;}
setInterval(tick,1000);tick();

async function loadProjects(){
  const grid=document.getElementById('projects-grid');
  try{
    const res=await fetch('projects.json?t='+Date.now());
    if(!res.ok)throw new Error();
    const projects=await res.json();
    if(!projects.length)return;
    grid.innerHTML='';
    projects.forEach(p=>{
      const card=document.createElement('div');
      card.className='project-card';
      let th;
      if(!p.thumbnail||p.thumbnail==='default'){
        th='<div class="project-thumb-default"><div class="ptd-corner tl">[ WIP ]</div><div class="ptd-icon">&#x2B21;</div><div class="ptd-label">In Development</div><div class="ptd-corner br">PREVIEW UNAVAILABLE</div></div>';
      }else{
        th='<img class="project-thumb" src="'+p.thumbnail+'" alt="'+p.title+'" loading="lazy"/>';
      }
      card.innerHTML=th+'<div class="project-overlay"></div><div class="project-info"><div class="project-title">'+p.title+'</div><div class="project-desc">'+p.description+'</div>'+(p.link?'<a href="'+p.link+'" class="project-link" target="_blank">View Project</a>':'')+'</div>';
      grid.appendChild(card);
      card.addEventListener('mouseenter',()=>cur.style.transform='translate(-50%,-50%) scale(2)');
      card.addEventListener('mouseleave',()=>cur.style.transform='translate(-50%,-50%) scale(1)');
    });
  }catch(e){}
}
loadProjects();

let quotePool=[],quoteIndex=0;
const quoteText=document.getElementById('quote-text');
const quoteAuthor=document.getElementById('quote-author');
const quoteStatus=document.getElementById('quote-status');

const fallbackQuotes=[
  {content:'The best way to predict the future is to invent it.',author:'Alan Kay'},
  {content:'Any sufficiently advanced technology is indistinguishable from magic.',author:'Arthur C. Clarke'},
  {content:'First, solve the problem. Then, write the code.',author:'John Johnson'},
  {content:'Code is like humor. When you have to explain it, it\'s bad.',author:'Cory House'},
  {content:'Programs must be written for people to read, and only incidentally for machines to execute.',author:'Harold Abelson'},
  {content:'The only way to do great work is to love what you do.',author:'Steve Jobs'},
  {content:'In the middle of difficulty lies opportunity.',author:'Albert Einstein'},
];

async function fetchQuotes(){
  try{
    const res=await fetch('https://zenquotes.io/api/quotes/');
    if(!res.ok)throw new Error();
    const data=await res.json();
    quotePool=data.map(q=>({content:q.q,author:q.a})).filter(q=>q.content&&q.author&&q.content!='...');
    if(!quotePool.length)throw new Error();
    showQuote(0);
  }catch(e){
    try{
      const res2=await fetch('https://api.quotable.io/quotes/random?limit=50');
      if(!res2.ok)throw new Error();
      const data2=await res2.json();
      const arr=data2.results||data2;
      quotePool=arr.map(q=>({content:q.content,author:q.author}));
      if(!quotePool.length)throw new Error();
      showQuote(0);
    }catch(e2){
      quotePool=fallbackQuotes;
      showQuote(0);
    }
  }
}

function showQuote(idx){
  if(!quotePool.length)return;
  quoteText.classList.add('quote-fade');
  quoteAuthor.classList.add('quote-fade');
  setTimeout(()=>{
    const q=quotePool[idx];
    quoteText.textContent=q.content;
    quoteAuthor.textContent=q.author;
    quoteText.classList.remove('quote-fade');
    quoteAuthor.classList.remove('quote-fade');
  },500);
}

function nextQuote(){quoteIndex=(quoteIndex+1)%quotePool.length;showQuote(quoteIndex);}
document.getElementById('quote-next').addEventListener('click',nextQuote);
setInterval(()=>{if(quotePool.length)nextQuote();},30000);
fetchQuotes();

const themes=[
  {green:'#00ff9f',cyan:'#00e5ff',red:'#ff2d55',bg:'#020b06',bg2:'#040f09',panel:'#071a0e',border:'#00ff9f22',bodyText:'#b0d8bc',muted:'#7aaa8a',name:'// MATRIX GREEN'},
  {green:'#00b4ff',cyan:'#bf00ff',red:'#ff6b00',bg:'#020a12',bg2:'#030d18',panel:'#051525',border:'#00b4ff22',bodyText:'#aaccdd',muted:'#5588aa',name:'// CYBER BLUE'},
  {green:'#ff00aa',cyan:'#ff6ef7',red:'#ffdd00',bg:'#120208',bg2:'#180310',panel:'#220415',border:'#ff00aa22',bodyText:'#ddb0cc',muted:'#aa5588',name:'// NEON MAGENTA'},
  {green:'#ffcc00',cyan:'#ff8800',red:'#ff2200',bg:'#100e00',bg2:'#151200',panel:'#1e1900',border:'#ffcc0022',bodyText:'#ddd0aa',muted:'#998855',name:'// AMBER ALERT'},
  {green:'#00ffcc',cyan:'#00ddff',red:'#ff3377',bg:'#021210',bg2:'#031815',panel:'#042018',border:'#00ffcc22',bodyText:'#aaddd4',muted:'#55aa99',name:'// TEAL PROTOCOL'},
  {green:'#aa00ff',cyan:'#ff00cc',red:'#00ffee',bg:'#08020f',bg2:'#0d0318',panel:'#130520',border:'#aa00ff22',bodyText:'#ccaadd',muted:'#8855aa',name:'// ULTRAVIOLET'},
];
let currentTheme=0;
const root=document.documentElement;

function applyTheme(t){
  root.style.setProperty('--green',t.green);
  root.style.setProperty('--cyan',t.cyan);
  root.style.setProperty('--red',t.red);
  root.style.setProperty('--bg',t.bg);
  root.style.setProperty('--bg2',t.bg2);
  root.style.setProperty('--panel',t.panel);
  root.style.setProperty('--border',t.border);
  root.style.setProperty('--body-text',t.bodyText);
  root.style.setProperty('--muted',t.muted);
  root.style.setProperty('--theme-green',t.green);
  matrixColor=t.green;
  const sb=document.getElementById('theme-name');
  if(sb)sb.textContent=t.name;
}

function triggerThemeGlitch(){
  currentTheme=(currentTheme+1)%themes.length;
  const body=document.body;
  let flickers=0;
  const flicker=setInterval(()=>{
    body.classList.toggle('theme-glitch-flash');
    flickers++;
    if(flickers>=6){clearInterval(flicker);body.classList.remove('theme-glitch-flash');applyTheme(themes[currentTheme]);}
  },60);
}

function scheduleThemeGlitch(){
  const delay=18000+Math.random()*10000;
  setTimeout(()=>{triggerThemeGlitch();scheduleThemeGlitch();},delay);
}
scheduleThemeGlitch();