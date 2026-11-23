
(() => {
'use strict';
const $=(x,root=document)=>root.querySelector(x), $$=(x,root=document)=>[...root.querySelectorAll(x)];

const initialArticles=[];
let state={matches:[],articles:[]};
let selectedTeam='Tutte', newsFilter='tutte';
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate=x=>{const d=new Date(x+'T12:00:00');return isNaN(d)?x:d.toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'});};
const toast=msg=>{const t=$('#toast');t.textContent=msg;t.hidden=false;clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>t.hidden=true,3600);};
function openModal(kicker,title,content){$('#modal-kicker').textContent=kicker;$('#modal-title').textContent=title;$('#modal-body').replaceChildren(); const p=document.createElement('p');p.textContent=content;$('#modal-body').append(p);$('#site-modal').hidden=false;$('#modal-close').focus();document.body.style.overflow='hidden';}
function closeModal(){$('#site-modal').hidden=true;document.body.style.overflow='';}
$('#modal-close').addEventListener('click',closeModal);
$('#site-modal').addEventListener('click',e=>{if(e.target.id==='site-modal')closeModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
const menu=$('.menu-toggle'),nav=$('.main-nav');
menu?.addEventListener('click',()=>{let on=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(on));menu.setAttribute('aria-label',on?'Chiudi menu':'Apri menu');});
$$('.main-nav a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}));
const teamInfo={
'PULCINI':'Il gruppo dei più piccoli: allenamento, gioco, amicizia e rispetto. Qui potremo inserire staff, impegni e calendario della squadra.',
'ESORDIENTI':'Tecnica, divertimento e spirito di squadra. La scheda sarà completata con i dati e le fotografie autorizzate.',
'UNDER 15':'Una fase importante di crescita sportiva. Qui potremo raccogliere convocazioni pubblicabili, calendario e risultati.',
'UNDER 17':'Il percorso verso il calcio dei grandi: formazione, impegno e passione. Qui potremo pubblicare partite e cronache.'};
$$('.team-card').forEach(c=>{const run=()=>openModal('Le nostre squadre', $('h3',c).textContent,teamInfo[$('h3',c).textContent]||'Scheda in preparazione.');c.addEventListener('click',run);c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();run();}});});
$$('.news-card').forEach(c=>{const run=()=>openModal($('.news-meta',c)?.textContent||'Notizie', $('h3',c).textContent,$('p',c)?.textContent||'Contenuto in preparazione.');c.addEventListener('click',run);c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();run();}});});
function renderMatches(){
$$('[data-team]').forEach(b=>b.classList.toggle('is-active',b.dataset.team===selectedTeam));
let items=state.matches.filter(x=>selectedTeam==='Tutte'||String(x.team||'').toLowerCase()===selectedTeam.toLowerCase()).sort((a,b)=>b.date.localeCompare(a.date));
$('#match-list').innerHTML=items.length?items.map(m=>`<div class="match-item"><div class="eyeline">${safe(m.team)} · ${safe(fmtDate(m.date))}</div><h3>${safe(m.home)} <span style="color:#ff277a">VS</span> ${safe(m.away)}</h3><div class="score">${m.homeScore!==''&&m.awayScore!==''?safe(m.homeScore)+' – '+safe(m.awayScore):'Da disputare'}</div><p>Calendario ufficiale pubblicato dalla società</p></div>`).join(''):'<div class="empty-state" style="grid-column:1/-1">Non ci sono ancora partite pubblicate in questa categoria. Puoi aggiungerne dal pannello di gestione.</div>';
}
$$('[data-team]').forEach(b=>b.addEventListener('click',()=>{selectedTeam=b.dataset.team;renderMatches();}));
function renderArticles(){
$$('[data-filter]').forEach(b=>{const on=b.dataset.filter===newsFilter;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});
$$('.news-card').forEach(c=>c.hidden=newsFilter!=='tutte'&&c.dataset.category!==newsFilter);
let target=$('#dynamic-news');if(!target){target=document.createElement('div');target.id='dynamic-news';target.className='dynamic-news';target.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;margin-top:28px';const base=$('.news-card')?.parentElement;base?.insertAdjacentElement('afterend',target);}
const found=state.articles.filter(a=>newsFilter==='tutte'||a.category===newsFilter);
target.innerHTML=found.map(a=>`<article class="news-card" style="padding:24px;border:1px solid #eee;border-radius:12px;background:#fff" tabindex="0" role="button" data-article-id="${safe(a.id)}">${a.image?`<img src="${safe(a.image)}" alt="" loading="lazy" style="width:100%;height:170px;object-fit:cover;border-radius:8px;margin-bottom:16px">`:``}<div class="news-meta">${a.category==='societa'?'SOCIETÀ':'GIOVANILI'} · ${safe(a.date||'NOTIZIA')}</div><h3>${safe(a.title)}</h3><p>${safe(String(a.body||'').slice(0,140))}${String(a.body||'').length>140?'…':''}</p><p class="click-tip">Clicca per leggere →</p></article>`).join('');
$$('[data-article-id]',target).forEach(card=>{const run=()=>{const a=state.articles.find(x=>x.id===card.dataset.articleId);if(a)openModal(a.category==='societa'?'Società':'Giovanili',a.title,a.body);};card.addEventListener('click',run);card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();run();}});});
}
$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{newsFilter=b.dataset.filter;renderArticles();}));
// Aggiorna le sezioni dinamiche usando i dati salvati da Pages CMS.
function renderAll(){
  renderMatches();
  renderArticles();
}

// Public data lives in GitHub files edited with Pages CMS.
async function loadPublishedContent(){
  const load=async path=>{const r=await fetch(path+'?v='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error(path+' HTTP '+r.status);return r.json()};
  try{
    const [articles,matches,settings]=await Promise.all([load('data/articles.json'),load('data/matches.json'),load('data/site.json')]);
    state.articles=Array.isArray(articles)?articles.filter(x=>x.published!==false):[];
    state.matches=Array.isArray(matches)?matches:[];
    if(settings.title){const t=$('#hero-title');t.textContent=settings.title;}
    if(settings.intro){const e=document.querySelector('.hero .hero-lead, .hero p');if(e)e.textContent=settings.intro;}
    if(settings.hero_image){const hero=document.querySelector('.hero');if(hero){const im=document.createElement('img');im.src=settings.hero_image;im.alt='Fotografia della squadra';im.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.25;pointer-events:none';hero.style.position='relative';hero.insertBefore(im,hero.firstChild);}}
    renderAll();
  }catch(e){console.error('Impossibile caricare i contenuti pubblicati:',e);}
}
$('#year').textContent=new Date().getFullYear();
renderAll();
loadPublishedContent();
})();
