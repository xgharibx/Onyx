/* Onyx PREMIUM ULTRA — interaction + dynamic visual layer.
   Loaded on homepage and every platform page. Adds: animated mesh canvas,
   grain layer, scroll progress, 3D tilt, magnetic buttons, brand marquee,
   stat ticker, signature feature band, premium loader, button cursor glow. */

(() => {
    if (window.__OnyxPremium) return;
    window.__OnyxPremium = true;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isAr = () => (window.OnyxI18n?.language || document.documentElement.lang || 'en').startsWith('ar');
    const T = (en, ar) => (isAr() ? ar : en);

    /* ---------- chrome layers ---------- */
    function ensureChrome() {
        if (!document.querySelector('.p-aurora')) {
            const aurora = document.createElement('div');
            aurora.className = 'p-aurora';
            document.body.appendChild(aurora);
        }
        if (!document.querySelector('.p-grain')) {
            const grain = document.createElement('div');
            grain.className = 'p-grain';
            document.body.appendChild(grain);
        }
        if (!document.querySelector('.p-mesh')) {
            const c = document.createElement('canvas');
            c.className = 'p-mesh';
            document.body.appendChild(c);
            startMesh(c);
        }
        if (!document.querySelector('.p-progress')) {
            const wrap = document.createElement('div');
            wrap.className = 'p-progress';
            wrap.innerHTML = '<span></span>';
            document.body.appendChild(wrap);
            const bar = wrap.firstElementChild;
            const onScroll = () => {
                const h = document.documentElement;
                const max = h.scrollHeight - h.clientHeight;
                const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
                bar.style.width = pct + '%';
            };
            document.addEventListener('scroll', onScroll, { passive: true });
            onScroll();
        }
    }

    /* ---------- premium loader ---------- */
    function ensureLoader() {
        if (document.querySelector('.p-loader') || document.body.dataset.noLoader === '1') return;
        const el = document.createElement('div');
        el.className = 'p-loader';
        el.innerHTML = `
            <div>
                <div class="p-loader__brand">${T('ONYX', 'Onyx')}</div>
                <div class="p-loader__sub">${T('Cinematic Dealership Loading', 'جاري تحميل المعرض السينمائي')}</div>
                <div class="p-loader__bar"><span></span></div>
            </div>`;
        document.body.appendChild(el);
        const bar = el.querySelector('.p-loader__bar span');
        let pct = 0;
        const tick = () => {
            pct = Math.min(100, pct + (3 + Math.random() * 7));
            bar.style.width = pct + '%';
            if (pct < 100) setTimeout(tick, 90);
            else setTimeout(() => el.classList.add('is-done'), 250);
        };
        setTimeout(tick, 50);
        // safety
        setTimeout(() => el.classList.add('is-done'), 3500);
    }

    /* ---------- animated mesh canvas (lightweight, no THREE needed) ---------- */
    function startMesh(canvas) {
        const ctx = canvas.getContext('2d');
        let w, h, raf, t = 0;
        const blobs = [
            { hue: 200, x: 0.2, y: 0.3, r: 0.45 },
            { hue: 260, x: 0.78, y: 0.22, r: 0.38 },
            { hue: 35,  x: 0.5,  y: 0.85, r: 0.5  },
            { hue: 170, x: 0.85, y: 0.7,  r: 0.32 }
        ];
        function size() {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            w = canvas.width  = Math.floor(window.innerWidth  * dpr);
            h = canvas.height = Math.floor(window.innerHeight * dpr);
            canvas.style.width  = window.innerWidth  + 'px';
            canvas.style.height = window.innerHeight + 'px';
        }
        function frame() {
            t += reduce ? 0 : 0.0035;
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = 'rgba(4,6,11,1)';
            ctx.fillRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'screen';
            blobs.forEach((b, i) => {
                const cx = (b.x + Math.sin(t + i) * 0.06) * w;
                const cy = (b.y + Math.cos(t * 0.9 + i) * 0.05) * h;
                const r  = b.r * Math.min(w, h);
                const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
                grd.addColorStop(0,   `hsla(${b.hue}, 90%, 60%, 0.55)`);
                grd.addColorStop(0.4, `hsla(${b.hue}, 90%, 50%, 0.18)`);
                grd.addColorStop(1,   'hsla(0, 0%, 0%, 0)');
                ctx.fillStyle = grd;
                ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
            });
            raf = requestAnimationFrame(frame);
        }
        size();
        window.addEventListener('resize', () => { cancelAnimationFrame(raf); size(); frame(); });
        frame();
    }

    /* ---------- 3D tilt cards ---------- */
    function bindTilt(scope = document) {
        const targets = scope.querySelectorAll('.platform-gateway__card, .vehicle-card, .data-card, .branch-card, .service-card, .story-card, .p-pillar, .panel.tilt-3d, .glass.tilt-3d');
        targets.forEach((el) => {
            if (el.dataset.tiltBound) return;
            el.dataset.tiltBound = '1';
            el.classList.add('tilt-3d');
            const onMove = (e) => {
                const rect = el.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                el.style.setProperty('--ry', `${(x - 0.5) * 8}deg`);
                el.style.setProperty('--rx', `${(0.5 - y) * 8}deg`);
                el.style.setProperty('--mx', `${x * 100}%`);
                el.style.setProperty('--my', `${y * 100}%`);
                el.style.setProperty('--shine', '1');
            };
            const onLeave = () => {
                el.style.setProperty('--ry', '0deg');
                el.style.setProperty('--rx', '0deg');
                el.style.setProperty('--shine', '0');
            };
            el.addEventListener('pointermove', onMove);
            el.addEventListener('pointerleave', onLeave);
        });
    }

    /* ---------- magnetic glow buttons ---------- */
    function bindButtons(scope = document) {
        scope.querySelectorAll('.pill-button, .platform-action').forEach((b) => {
            if (b.dataset.glowBound) return;
            b.dataset.glowBound = '1';
            b.addEventListener('pointermove', (e) => {
                const r = b.getBoundingClientRect();
                b.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
                b.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
            });
        });
    }

    /* ---------- brand marquee strip ---------- */
    function ensureBrandMarquee() {
        if (document.querySelector('.p-marquee')) return;
        const inv = window.OnyxInventory || [];
        const brands = [...new Set(inv.map((c) => c.brand).filter(Boolean))];
        if (!brands.length) return;
        const items = brands.concat(brands).map((b) => `<span class="p-marquee__item">${b}</span>`).join('');
        const el = document.createElement('section');
        el.className = 'p-marquee';
        el.setAttribute('aria-label', 'Onyx authorized brands');
        el.innerHTML = `<div class="p-marquee__track">${items}</div>`;
        const anchor =
            document.querySelector('#fleet') ||
            document.querySelector('.platform-gateway') ||
            document.querySelector('main .platform-section') ||
            document.querySelector('main');
        if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(el, anchor);
        else document.body.appendChild(el);
    }

    /* ---------- stat ticker for homepage ---------- */
    function ensureTicker() {
        if (document.querySelector('.p-ticker')) return;
        const inv = window.OnyxInventory || [];
        if (!inv.length) return;
        const brands = new Set(inv.map((c) => c.brand)).size;
        const lowest = Math.min(...inv.map((c) => (c.price && (c.price.min || c.price.max)) || Infinity).filter((n) => isFinite(n)));
        const cats = new Set(inv.map((c) => c.category || 'Vehicle')).size;
        const fmt = (n) => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : String(n);
        const data = [
            [String(inv.length).padStart(2, '0'), T('Live Vehicles', 'عربيات متاحة')],
            [String(brands), T('Authorized Brands', 'علامات معتمدة')],
            [String(cats),   T('Market Segments', 'فئات السوق')],
            [isFinite(lowest) ? fmt(lowest) : '—', T('Entry Price EGP', 'أقل سعر بالجنيه')]
        ];
        const el = document.createElement('section');
        el.className = 'p-ticker';
        el.innerHTML = data.map(([n, l]) => `<div class="p-ticker__item"><div class="p-ticker__num">${n}</div><div class="p-ticker__label">${l}</div></div>`).join('');
        const anchor = document.querySelector('#hero, .platform-hero');
        if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(el, anchor.nextSibling);
    }

    /* ---------- pillars (only on homepage to avoid clutter) ---------- */
    function ensurePillars() {
        if (document.querySelector('.p-pillars')) return;
        if (document.body.dataset.page) return; // platform pages skip
        const data = isAr()
            ? [
                ['◆', 'كتالوج سينمائي', 'كل عربية في Onyx متعرضة بعمق وحركة وصور حقيقية من الكتالوج الرسمي.'],
                ['◇', 'ذكاء أسعار حي', 'أسعار مسحوبة من الموقع، شرائح أسعار، وحساب أقساط فوري على الجهاز.'],
                ['◈', 'فحص مكاني', 'معرض مبني على الصور بمقاسات وأماكن لمس وأوضاع إضاءة لقرار واثق.'],
                ['◉', 'مساعد مصري', 'تجربة ثنائية اللغة معمولة للسوق المصري بكلام عربي طبيعي على المنصة كلها.']
            ]
            : [
                ['◆', 'Cinematic Catalog', 'Every Onyx vehicle rendered with depth, motion, and real photography from the official feed.'],
                ['◇', 'Live Pricing Intelligence', 'Scraped prices, range labels, and EMI estimates calculated in real time on the device.'],
                ['◈', 'Spatial Inspection', 'Photo-driven showroom with dimensions, hotspots, and scene modes for confident decisions.'],
                ['◉', 'Egyptian Concierge', 'Bilingual flow tuned for the Egyptian market with natural Arabic copy across the platform.']
            ];
        const headEyebrow = T('Engineering Pillars', 'ركائز هندسية');
        const headTitle = T('Built On Real Data, Not Stock', 'مبني على بيانات حقيقية، مش صور جاهزة');
        const headCopy = T('Every interaction below is wired into the live Onyx inventory and the cinematic platform we built from scratch.', 'كل تفاعل تحت متصل بمخزون Onyx الحي والمنصة السينمائية اللي بنيناها من الصفر.');
        const el = document.createElement('section');
        el.className = 'section';
        el.innerHTML = `
            <div class="panel-head"><div><p class="eyebrow">${headEyebrow}</p><h2 class="display-title">${headTitle}</h2></div><p class="panel-copy">${headCopy}</p></div>
            <div class="p-pillars">
                ${data.map(([i, t, p]) => `<article class="p-pillar"><div class="p-pillar__icon">${i}</div><h3>${t}</h3><p>${p}</p></article>`).join('')}
            </div>`;
        const anchor = document.querySelector('#concierge') || document.querySelector('#fleet');
        if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(el, anchor);
    }

    /* ---------- big feature band (homepage signature) ---------- */
    function ensureFeatureBand() {
        if (document.querySelector('.p-feature-band')) return;
        if (document.body.dataset.page) return;
        const inv = window.OnyxInventory || [];
        const top = inv.filter((c) => c.heroImage || (c.gallery && c.gallery[0])).sort((a, b) => (b.price?.max || 0) - (a.price?.max || 0))[0];
        if (!top) return;
        const img = top.heroImage || top.gallery[0];
        const flagship = T('FLAGSHIP / 01', 'الاختيار الأول / 01');
        const eyebrowTxt = T('Signature Selection', 'اختيار مميز');
        const headline = T('Engineered<br>For Egypt&rsquo;s Roads', 'مهندسة<br>لطرق مصر');
        const copy = T(
            "From Cairo arteries to Delta highways, Onyx's flagship pick balances cabin presence with everyday usability — and the price stays transparent.",
            'من شوارع القاهرة لطرق الدلتا، اختيار Onyx المميز يجمع بين فخامة الكابينة وسهولة الاستخدام اليومي — والسعر يفضل واضح.'
        );
        const lblHp = T('Horsepower', 'حصان');
        const lblSeats = T('Seats', 'مقاعد');
        const lblPrice = T('Onyx Price', 'سعر Onyx');
        const ctaModel = T('Open Model', 'افتح الموديل');
        const ctaFin = T('Tune Payment', 'ظبّط القسط');
        const vehicleLabel = top.category || T('Vehicle', 'عربية');
        const el = document.createElement('section');
        el.className = 'p-feature-band';
        el.innerHTML = `
            <div class="p-showcase">
                <div class="p-showcase__media">
                    <span class="p-showcase__index">${flagship}</span>
                    <img src="${img}" alt="${top.title}">
                    <div class="p-showcase__caption"><strong>${top.title}</strong><span>${top.brand} · ${vehicleLabel}</span></div>
                </div>
                <div class="p-showcase__copy">
                    <p class="eyebrow">${eyebrowTxt}</p>
                    <h2>${headline}</h2>
                    <p class="panel-copy" style="color:rgba(247,248,251,0.72);">${copy}</p>
                    <div class="p-showcase__specs">
                        <div class="p-showcase__spec"><b>${top.specs?.horsepower || '—'}</b><span>${lblHp}</span></div>
                        <div class="p-showcase__spec"><b>${top.specs?.seats || '—'}</b><span>${lblSeats}</span></div>
                        <div class="p-showcase__spec"><b>${top.priceLabel || top.priceDisplay || '—'}</b><span>${lblPrice}</span></div>
                    </div>
                    <div class="hero-actions">
                        <a class="pill-button pill-button--primary" href="model.html?car=${encodeURIComponent(top.slug)}">${ctaModel}</a>
                        <a class="pill-button" href="finance.html?car=${encodeURIComponent(top.slug)}">${ctaFin}</a>
                    </div>
                </div>
            </div>`;
        const anchor = document.querySelector('#showroom') || document.querySelector('#concierge') || document.querySelector('#fleet');
        if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(el, anchor);
    }

    /* ---------- run ---------- */
    function init() {
        ensureChrome();
        ensureLoader();
        // wait for inventory if injected after
        const tryInject = (fn) => {
            if (window.OnyxInventory && window.OnyxInventory.length) fn();
            else setTimeout(() => tryInject(fn), 120);
        };
        function injectAll() {
            ['.p-marquee', '.p-ticker', '.p-pillars', '.p-feature-band'].forEach((sel) => {
                const node = document.querySelector(sel);
                if (sel === '.p-pillars' && node && node.parentElement?.classList.contains('section')) {
                    node.parentElement.remove();
                } else {
                    node?.remove();
                }
            });
            tryInject(ensureBrandMarquee);
            tryInject(ensureTicker);
            tryInject(ensurePillars);
            tryInject(ensureFeatureBand);
        }
        injectAll();
        // re-inject once i18n has resolved the page language (handles ?lang=ar / localStorage)
        let lastLang = isAr() ? 'ar' : 'en';
        let attempts = 0;
        const settle = setInterval(() => {
            const now = isAr() ? 'ar' : 'en';
            if (now !== lastLang) {
                lastLang = now;
                injectAll();
            }
            if (++attempts > 20) clearInterval(settle); // ~3s
        }, 150);
        bindTilt();
        bindButtons();
        // observe DOM for new cards (platform.js renders after init)
        const mo = new MutationObserver(() => {
            bindTilt();
            bindButtons();
        });
        mo.observe(document.body, { childList: true, subtree: true });

        // re-render injected sections when language changes so Arabic stays clean
        window.addEventListener('onyx:languagechange', () => {
            ['.p-marquee', '.p-ticker', '.p-pillars', '.p-feature-band'].forEach((sel) => {
                const node = document.querySelector(sel);
                // pillars wrapper is the .section we built — remove its parent if it only holds pillars
                if (sel === '.p-pillars' && node && node.parentElement?.classList.contains('section')) {
                    node.parentElement.remove();
                } else if (sel === '.p-feature-band') {
                    node?.remove();
                } else {
                    node?.remove();
                }
            });
            tryInject(ensureBrandMarquee);
            tryInject(ensureTicker);
            tryInject(ensurePillars);
            tryInject(ensureFeatureBand);
        });

        // expose
        window.OnyxPremium = { bindTilt, bindButtons };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
