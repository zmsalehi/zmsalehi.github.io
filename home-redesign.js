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
function companyCard(x){const a=elfunction companyCard(x) {

  const href =
    'company.html?slug=' +
    encodeURIComponent(x.slug || '');

  const card = el('a', 'company-showcase-card');
  card.href = href;

  const media = el('div', 'company-showcase-media');

  const image = imageFor(
    x.card_image_url,
    'تصویر ' + (x.name || 'شرکت')
  );

  image.classList.add('company-showcase-image');

  const sectorBadge = el(
    'span',
    'company-sector-badge',
    x.sector || 'حوزه فعالیت'
  );

  media.append(image, sectorBadge);

  const body = el('div', 'company-showcase-body');

  const heading = el('div', 'company-showcase-title-row');

  const logo = el(
    'div',
    'company-mini-logo',
    (x.name || 'آ').slice(0, 1)
  );

  const title = el(
    'h3',
    '',
    x.name || 'شرکت بدون نام'
  );

  heading.append(logo, title);

  const description = el(
    'p',
    'company-showcase-summary',
    x.short_description ||
      'اطلاعات تکمیلی این شرکت در پروفایل آن قابل مشاهده است.'
  );

  const tags = el('div', 'company-showcase-tags');

  String(x.tags || '')
    .split(/[,،]/)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 2)
    .forEach(tag => {
      tags.append(
        el('span', 'company-showcase-tag', tag)
      );
    });

  const more = el(
    'span',
    'company-showcase-link',
    'مشاهده پروفایل ←'
  );

  body.append(
    heading,
    description,
    tags,
    more
  );

  card.append(media, body);

  return card;
}function renderCompanies(){const root=$('homeCompanies'),term=$('companySearch').value.trim().toLocaleLowerCase('fa');const filtered=companies.filter(x=>[x.name,x.sector,x.short_description,x.tags].join(' ').toLocaleLowerCase('fa').includes(term)&&(sector==='all'||String(x.sector||'').includes(sector)));root.replaceChildren();filtered.slice(0,4).forEach(x=>root.append(companyCard(x)));if(!filtered.length)empty(root,companies.length?'شرکتی با این جست‌وجو یافت نشد.':'هنوز شرکتی برای نمایش عمومی منتشر نشده است.');}
async function loadCompanies(){try{companies=await query('aban_companies','slug,name,sector,short_description,tags,card_image_url','is_published=eq.true','created_at.desc',100);renderCompanies()}catch(e){empty($('homeCompanies'),'در حال حاضر دریافت فهرست شرکت‌ها امکان‌پذیر نیست. برای مشاهده شبکه کامل وارد صفحه شرکت‌ها شوید.');console.warn('companies',e)}}
async function loadMag(){const root=$('homeMagazine');try{const items=await query('aban_mag_content','slug,title,summary,cover_url,kind,category','is_published=eq.true','created_at.desc',3);root.replaceChildren();items.forEach(x=>{const article=el('article','content-card');const href='mag-content.html?slug='+encodeURIComponent(x.slug||'');const cover=link('',href,'image-link');cover.append(imageFor(x.cover_url,'تصویر شاخص '+(x.title||'')));const body=el('div','card-body');body.append(el('span','chip',({article:'مقاله',podcast:'پادکست',video:'ویدئو'})[x.kind]||'مجله آبان'),el('h3','',x.title||'مطلب آبان'),el('p','',x.summary||''),link('مطالعه مطلب ←',href));article.append(cover,body);root.append(article)});if(!items.length)empty(root,'هنوز مطلب منتشرشده‌ای در مجله وجود ندارد. این بخش پس از انتشار از پنل مدیریت تکمیل می‌شود.')}catch(e){empty(root,'دریافت مطالب مجله در حال حاضر امکان‌پذیر نیست.');console.warn('mag',e)}}
// فرصت‌ها هنوز در پنل موجود به جدول عمومی متصل نیستند؛ هرگز داده ساختگی نمایش نده.
function loadOpportunities(){const root=$('homeOpportunities');root.replaceChildren();const samples=[
 ['آب و محیط‌زیست','کاهش هدررفت در شبکه توزیع آب','راهکارهای پایش و تحلیل داده برای بهبود مدیریت شبکه‌های آب','assets/images/mag/organizational-problem-definition.png'],
 ['انرژی و صنعت','پایش هوشمند بهره‌وری انرژی','تحلیل داده‌های مصرف انرژی برای شناسایی فرصت‌های بهینه‌سازی','aban_hero.png'],
 ['کشاورزی','پایش هوشمند کشت گلخانه‌ای','بررسی راهکارهای حسگری و تصمیم‌یار برای رشد بهره‌وری','assets/images/mag/organizational-problem-definition.png']];
 samples.forEach(s=>{const card=el('article','content-card');const img=el('img','card-image');img.src=s[3];img.alt='نمونه نمایشی: '+s[1];const body=el('div','card-body');body.append(el('span','chip','نمونه نمایشی · '+s[0]),el('h3','',s[1]),el('p','',s[2]),link('مشاهده فرصت‌ها ←','opportunities.html'));card.append(img,body);root.append(card)});}
$('menuToggle').addEventListener('click',()=>{const nav=$('navLinks');const open=nav.classList.toggle('open');$('menuToggle').setAttribute('aria-expanded',String(open))});$('navLinks').addEventListener('click',e=>{if(e.target.closest('a')){$('navLinks').classList.remove('open');$('menuToggle').setAttribute('aria-expanded','false')}});
$('companySearch').addEventListener('input',renderCompanies);$('companyFilters').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;sector=b.dataset.sector;document.querySelectorAll('#companyFilters button').forEach(x=>x.classList.toggle('active',x===b));renderCompanies()});
loadCompanies();loadMag();
