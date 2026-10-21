// صفحه اصلی آبان — فقط داده‌های عمومی منتشرشده را نمایش می‌دهد.
const API_BASE = 'https://yxmrflrqzpstmafkonnr.supabase.co';
const PUBLIC_KEY = 'sb_publishable_Fu7LRMCSJ85k7_FECupFhg_FQFqdaF8';

const $ = id => document.getElementById(id);

function el(tag, cls, txt) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (txt !== undefined) node.textContent = txt;
  return node;
}

function link(text, href, cls) {
  const a = el('a', cls, text);
  a.href = href;
  return a;
}

function empty(root, message) {
  if (!root) return;
  root.replaceChildren(el('p', 'placeholder', message));
}

async function query(table, fields, condition, order, limit) {
  const url =
    API_BASE + '/rest/v1/' + table +
    '?select=' + encodeURIComponent(fields) +
    '&' + condition +
    '&order=' + order +
    '&limit=' + limit;

  const response = await fetch(url, {
    headers: { apikey: PUBLIC_KEY }
  });

  if (!response.ok) {
    throw new Error('HTTP ' + response.status);
  }

  return response.json();
}

function imageFor(src, alt) {
  if (!src) return el('div', 'card-image');

  try {
    const url = new URL(src, location.href);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return el('div', 'card-image');
    }

    const img = el('img', 'card-image');
    img.src = url.href;
    img.alt = alt || '';
    img.loading = 'lazy';
    return img;
  } catch {
    return el('div', 'card-image');
  }
}

let companies = [];
let sector = 'all';

function makeCompanyImage(company, name) {
  const media = el('div', 'company-showcase-media');
  const src = String(company.card_image_url || '').trim();

  if (!src) {
    media.classList.add('company-showcase-media-fallback');
    return media;
  }

  try {
    const url = new URL(src, location.href);
    if (!['http:', 'https:'].includes(url.protocol)) {
      media.classList.add('company-showcase-media-fallback');
      return media;
    }

    const img = el('img', 'company-showcase-image');
    img.src = url.href;
    img.alt = 'تصویر ' + name;
    img.loading = 'lazy';
    img.addEventListener('error', () => {
      img.remove();
      media.classList.add('company-showcase-media-fallback');
    });
    media.append(img);
  } catch {
    media.classList.add('company-showcase-media-fallback');
  }

  return media;
}

function companyCard(company) {
  const name = String(company.name || 'شرکت بدون نام');
  const href = 'company.html?slug=' + encodeURIComponent(company.slug || '');

  const card = el('article', 'company-showcase-card');
  card.tabIndex = 0;
  card.setAttribute('role', 'link');

  const media = makeCompanyImage(company, name);
  media.append(
    el('span', 'company-sector-badge', company.sector || 'حوزه فعالیت')
  );

  const body = el('div', 'company-showcase-body');
  const titleRow = el('div', 'company-showcase-title-row');
  titleRow.append(el('h3', '', name));

  const description = el(
    'p',
    'company-showcase-summary',
    company.short_description ||
      'برای آشنایی بیشتر با توانمندی‌های این مجموعه، پروفایل شرکت را مشاهده کنید.'
  );

  const tags = el('div', 'company-showcase-tags');
  String(company.tags || '')
    .split(/[,،]/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 2)
    .forEach(tag => tags.append(el('span', 'company-showcase-tag', tag)));

  const profileLink = link('مشاهده پروفایل ←', href, 'company-showcase-link');

  body.append(titleRow, description, tags, profileLink);
  card.append(media, body);

  card.addEventListener('click', event => {
    if (event.target.closest('a')) return;
    window.location.href = href;
  });

  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      window.location.href = href;
    }
  });

  return card;
}

function renderCompanies() {
  const root = $('homeCompanies');
  if (!root) return;

  const search = $('companySearch');
  const term = search ? search.value.trim().toLocaleLowerCase('fa') : '';
  const filtered = companies.filter(company => {
    const searchable = [company.name, company.sector, company.short_description, company.tags]
      .map(value => String(value || '')).join(' ').toLocaleLowerCase('fa');
    const companySector = String(company.sector || '');
    return searchable.includes(term) && (sector === 'all' || companySector.includes(sector));
  });

  root.replaceChildren();
  root.classList.remove('cards', 'three', 'company-showcase-grid', 'aban-company-marquee');

  if (!filtered.length) {
    empty(root, companies.length
      ? 'شرکتی با این جست‌وجو یافت نشد.'
      : 'هنوز شرکتی برای نمایش عمومی منتشر نشده است.');
    return;
  }

  // When searching/filtering, freeze motion and show all matching results in a normal grid.
  if (term || sector !== 'all' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('company-showcase-grid', 'aban-company-results');
    filtered.forEach(company => root.append(companyCard(company)));
    return;
  }

  root.classList.add('aban-company-marquee');
  root.setAttribute('aria-label', 'ویترین متحرک همه شرکت‌های منتشرشده');
  const track = el('div', 'aban-company-track');
  const first = el('div', 'aban-company-set');
  const second = el('div', 'aban-company-set');

  // Calculate copies from actual container width so there is never a blank tail.
  // All distinct companies appear once in each base pass, without a display cap.
  const fillTrack = () => {
    if (!root.isConnected) return;
    track.style.animation = 'none';
    first.replaceChildren();
    second.replaceChildren();
    const baseCards = filtered.map(company => companyCard(company));
    first.append(...baseCards);
    const onePassWidth = Math.max(1, first.scrollWidth);
    const neededWidth = root.clientWidth + 360;
    const passes = Math.max(1, Math.ceil(neededWidth / onePassWidth));
    for (let pass = 1; pass < passes; pass++) {
      baseCards.forEach(node => {
        const clone = node.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.tabIndex = -1;
        clone.querySelectorAll('a').forEach(link => link.tabIndex = -1);
        first.append(clone);
      });
    }
    first.querySelectorAll('[aria-hidden="true"]').forEach(node => { node.inert = true; });
    // Duplicate the complete first segment for truly seamless looping.
    Array.from(first.children).forEach(node => {
      const clone = node.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.tabIndex = -1;
      clone.querySelectorAll('a').forEach(link => link.tabIndex = -1);
      second.append(clone);
    });
    second.setAttribute('aria-hidden', 'true');
    second.inert = true;
    // The shift equals exactly one segment, including its final gap.
    const distance = first.getBoundingClientRect().width;
    track.style.setProperty('--aban-marquee-shift', distance + 'px');
    track.style.setProperty('--aban-marquee-duration', Math.max(20, distance / 38) + 's');
    track.style.animation = '';
  };

  track.append(first, second);
  root.append(track);
  // Ensure layout has width before calculating the copies.
  requestAnimationFrame(fillTrack);
  if (window.abanCompanyObserver) window.abanCompanyObserver.disconnect();
  if (typeof ResizeObserver !== 'undefined') {
    window.abanCompanyObserver = new ResizeObserver(() => {
      if (root.classList.contains('aban-company-marquee')) fillTrack();
    });
    window.abanCompanyObserver.observe(root);
  }

}

async function fetchAllPublishedCompanies(fields) {
  const pageSize = 500;
  const collected = [];
  for (let offset = 0; ; offset += pageSize) {
    const url = API_BASE + '/rest/v1/aban_companies' +
      '?select=' + encodeURIComponent(fields) +
      '&is_published=eq.true&order=created_at.desc' +
      '&limit=' + pageSize + '&offset=' + offset;
    const response = await fetch(url, { headers: { apikey: PUBLIC_KEY } });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const batch = await response.json();
    if (!Array.isArray(batch)) throw new Error('Invalid company response');
    collected.push(...batch);
    if (batch.length < pageSize) break;
  }
  return collected;
}

async function loadCompanies() {
  const root = $('homeCompanies');
  if (!root) return;
  const baseFields = 'slug,name,sector,short_description,tags';
  try {
    try {
      companies = await fetchAllPublishedCompanies(baseFields + ',card_image_url');
    } catch (imageFieldError) {
      // Keep all companies visible when an older database lacks card_image_url.
      companies = await fetchAllPublishedCompanies(baseFields);
      companies = companies.map(company => ({ ...company, card_image_url: '' }));
      console.info('card_image_url unavailable; company list loaded without images.');
    }
    renderCompanies();
  } catch (error) {
    empty(root, 'در حال حاضر دریافت فهرست شرکت‌ها امکان‌پذیر نیست. برای مشاهده شبکه کامل وارد صفحه شرکت‌ها شوید.');
    console.warn('companies', error);
  }
}

async function loadMag() {
  const root = $('homeMagazine');
  if (!root) return;

  try {
    const items = await query(
      'aban_mag_content',
      'slug,title,summary,cover_url,kind,category',
      'is_published=eq.true',
      'created_at.desc',
      3
    );

    root.replaceChildren();

    items.forEach(item => {
      const article = el('article', 'content-card');
      const href = 'mag-content.html?slug=' + encodeURIComponent(item.slug || '');
      const cover = link('', href, 'image-link');
      cover.append(imageFor(item.cover_url, 'تصویر شاخص ' + (item.title || '')));

      const body = el('div', 'card-body');
      body.append(
        el(
          'span',
          'chip',
          ({ article: 'مقاله', podcast: 'پادکست', video: 'ویدئو' })[item.kind] || 'مجله آبان'
        ),
        el('h3', '', item.title || 'مطلب آبان'),
        el('p', '', item.summary || ''),
        link('مطالعه مطلب ←', href)
      );

      article.append(cover, body);
      root.append(article);
    });

    if (!items.length) {
      empty(
        root,
        'هنوز مطلب منتشرشده‌ای در مجله وجود ندارد. این بخش پس از انتشار از پنل مدیریت تکمیل می‌شود.'
      );
    }
  } catch (error) {
    empty(root, 'دریافت مطالب مجله در حال حاضر امکان‌پذیر نیست.');
    console.warn('mag', error);
  }
}

function initHomePage() {
  const menuToggle = $('menuToggle');
  const navLinks = $('navLinks');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
    });

    navLinks.addEventListener('click', event => {
      if (!event.target.closest('a')) return;
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  }

  window.addEventListener('resize', () => {
    const set = document.querySelector('#homeCompanies .aban-company-set');
    const track = document.querySelector('#homeCompanies .aban-company-track');
    // Marquee sizing is maintained by ResizeObserver in renderCompanies().
  });

  const companySearch = $('companySearch');
  if (companySearch) {
    companySearch.addEventListener('input', renderCompanies);
  }

  const companyFilters = $('companyFilters');
  if (companyFilters) {
    companyFilters.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;

      sector = button.dataset.sector || 'all';

      document.querySelectorAll('#companyFilters button').forEach(item => {
        item.classList.toggle('active', item === button);
      });

      renderCompanies();
    });
  }

  loadCompanies();
  loadMag();
  // بخش فرصت‌ها عمداً اینجا دست‌کاری نمی‌شود؛ opportunities-ui.js مسئول آن است.
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHomePage, { once: true });
} else {
  initHomePage();
}
