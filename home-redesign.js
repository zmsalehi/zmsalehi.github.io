// صفحه اصلی آبان — فقط داده‌های عمومی منتشرشده را نمایش می‌دهد.
const API_BASE='https://yxmrflrqzpstmafkonnr.supabase.co';
const PUBLIC_KEY='sb_publishable_Fu7LRMCSJ85k7_FECupFhg_FQFqdaF8';
const $=id=>document.getElementById(id);
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
function link(text,href,cls){const a=el('a',cls,text);a.href=href;return a}
function empty(root,message){root.replaceChildren(el('p','placeholder',message))}
async function query(table,fields,condition,order,limit){const u=API_BASE+'/rest/v1/'+table+'?select='+encodeURIComponent(fields)+'&'+condition+'&order='+order+'&limit='+limit;const r=await fetch(u,{headers:{apikey:PUBLIC_KEY}});if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}
function imageFor(src,alt){if(!src)return el('div','card-image');try{const u=new URL(src,location.href);if(!['http:','https:'].includes(u.protocol))return el('div','card-image');const img=el('img','card-image');img.src=u.href;img.alt=alt||'';img.loading='lazy';return img}catch{return el('div','card-image')}}
let companies=[];let sector='all';
function companyCard(x){const a=el('article','content-card company-card');const body=el('div','card-body');const heading=el('div','heading');heading.append(el('div','card-logo',(x.name||'آ').slice(0,1)));const info=el('div');info.append(el('h3','',x.name||'شرکت بدون نام'),el('span','chip',x.sector||'حوزه مشخص نشده'));heading.append(info);body.append(heading,el('p','',x.short_description||'اطلاعات این شرکت در پروفایل آن قابل مشاهده است.'));const tags=el('div','tags');String(x.tags||'').split(/[,،]/).map(s=>s.trim()).filter(Boolean).slice(0,3).forEach(t=>tags.append(el('span','chip',t)));body.append(tags,link('مشاهده پروفایل ←','company.html?slug='+encodeURIComponent(x.slug||'')));a.append(body);return a}
function renderCompanies(){const root=$('homeCompanies'),term=$('companySearch').value.trim().toLocaleLowerCase('fa');const filtered=companies.filter(x=>[x.name,x.sector,x.short_description,x.tags].join(' ').toLocaleLowerCase('fa').includes(term)&&(sector==='all'||String(x.sector||'').includes(sector)));root.replaceChildren();filtered.slice(0,3).forEach(x=>root.append(companyCard(x)));if(!filtered.length)empty(root,companies.length?'شرکتی با این جست‌وجو یافت نشد.':'هنوز شرکتی برای نمایش عمومی منتشر نشده است.');}
async function loadCompanies(){try{companies=await query('aban_companies','slug,name,sector,short_description,tags','is_published=eq.true','created_at.desc',100);renderCompanies()}catch(e){empty($('homeCompanies'),'در حال حاضر دریافت فهرست شرکت‌ها امکان‌پذیر نیست. برای مشاهده شبکه کامل وارد صفحه شرکت‌ها شوید.');console.warn('companies',e)}}
async function loadMag(){const root=$('homeMagazine');try{const items=await query('aban_mag_content','slug,title,summary,cover_url,kind,category','is_published=eq.true','created_at.desc',3);root.replaceChildren();items.forEach(x=>{const article=el('article','content-card');const href='mag-content.html?slug='+encodeURIComponent(x.slug||'');const cover=link('',href,'image-link');cover.append(imageFor(x.cover_url,'تصویر شاخص '+(x.title||'')));const body=el('div','card-body');body.append(el('span','chip',({article:'مقاله',podcast:'پادکست',video:'ویدئو'})[x.kind]||'مجله آبان'),el('h3','',x.title||'مطلب آبان'),el('p','',x.summary||''),link('مطالعه مطلب ←',href));article.append(cover,body);root.append(article)});if(!items.length)empty(root,'هنوز مطلب منتشرشده‌ای در مجله وجود ندارد. این بخش پس از انتشار از پنل مدیریت تکمیل می‌شود.')}catch(e){empty(root,'دریافت مطالب مجله در حال حاضر امکان‌پذیر نیست.');console.warn('mag',e)}}
// تا پیش از اتصال پنل فرصت‌ها، سه کارت نمونه در صفحه اصلی نمایش داده می‌شود.
function loadOpportunities(){
  const root=$('homeOpportunities');
  const demo=[
    {title:'چالش کاهش مصرف انرژی در یک واحد صنعتی',chip:'انرژی',text:'سازمان متقاضی به‌دنبال شناسایی راهکارهای پایش و بهینه‌سازی مصرف انرژی در فرایندهای عملیاتی است.',link:'opportunities.html'},
    {title:'نیاز به تحلیل داده و پیش‌بینی برای تصمیم‌گیری',chip:'هوش مصنوعی',text:'فرصتی برای بررسی راهکارهای تحلیل داده، پیش‌بینی و داشبوردهای تصمیم‌یار متناسب با نیازهای سازمانی.',link:'opportunities.html'},
    {title:'جست‌وجوی راهکار نوآورانه برای بهبود خدمات',chip:'خدمات و فرایند',text:'این کارت به‌صورت نمونه در صفحه اصلی قرار گرفته است و بعداً می‌توانید آن را از پنل مدیریت با فرصت واقعی جایگزین کنید.',link:'opportunities.html'}
  ];
  root.replaceChildren();
  demo.forEach(item=>{
    const card=el('article','content-card');
    const top=el('div','card-image');
    top.style.background='linear-gradient(135deg,#dff1f5,#eef6fb)';
    card.append(top);
    const body=el('div','card-body');
    body.append(el('span','chip',item.chip),el('h3','',item.title),el('p','',item.text),link('مشاهده جزئیات و سایر فرصت‌ها ←',item.link));
    card.append(body);
    root.append(card);
  });
}
$('menuToggle').addEventListener('click',()=>{const nav=$('navLinks');const open=nav.classList.toggle('open');$('menuToggle').setAttribute('aria-expanded',String(open))});$('navLinks').addEventListener('click',e=>{if(e.target.closest('a')){$('navLinks').classList.remove('open');$('menuToggle').setAttribute('aria-expanded','false')}});
$('companySearch').addEventListener('input',renderCompanies);$('companyFilters').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;sector=b.dataset.sector;document.querySelectorAll('#companyFilters button').forEach(x=>x.classList.toggle('active',x===b));renderCompanies()});
loadCompanies();loadMag();loadOpportunities();