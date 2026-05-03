(() => {
    const navItems = [
        ['home', 'index.html', 'Home'],
        ['cars', 'cars.html', 'Cars'],
        ['offers', 'offers.html', 'Offers'],
        ['brands', 'brands.html', 'Brands'],
        ['compare', 'compare.html', 'Compare'],
        ['finance', 'finance.html', 'Finance'],
        ['concierge', 'concierge.html', 'Concierge'],
        ['showroom', 'showroom.html', 'Showroom'],
        ['services', 'services.html', 'Services'],
        ['trade', 'trade-in.html', 'Trade In'],
        ['branches', 'branches.html', 'Branches'],
        ['about', 'about.html', 'About'],
        ['stories', 'stories.html', 'Stories'],
        ['book', 'book.html', 'Book'],
        ['contact', 'contact.html', 'Contact']
    ];

    const services = [
        ['Trade In', 'Upgrade from your current car into a new Onyx model with a guided valuation path, required documents, and handover checklist.'],
        ['Used Cars', 'Certified used-car discovery for customers who want lower entry cost with dealership guidance.'],
        ['Installment', 'Monthly payment planning for private customers, with deposit, term, and car selection aligned in one journey.'],
        ['Direct Installment', 'Fleet and company installment support for business customers who need predictable procurement.']
    ];

    const branches = [
        ['Head Branch', 'Shinzo Abe Axis, Cairo', 'Main Onyx customer contact point', '15052'],
        ['Hihya Headquarters', 'Hihya City, Al Sharqia', 'Historic operations base with 2,100 m2 expansion milestone', '15052'],
        ['10th of Ramadan City', 'Al-Osool Mall, banks area', 'Large showroom branch planned from the 2021 expansion milestone', '15052'],
        ['Cairo Chery Showroom', 'Cairo', 'Authorized Chery distribution expansion from the 2024 milestone', '15052'],
        ['Carrefour Ismailia', 'Ismailia Governorate', 'Renault and Proton access point listed in Onyx expansion milestones', '15052']
    ];

    const timeline = [
        ['1993', 'Abo Galal began as a sole proprietorship with a small showroom for up to three microbuses and four staff members.'],
        ['1996', 'The company expanded beyond microbuses and started selling a limited number of private cars.'],
        ['2006', 'The founders acquired a 2,100 m2 area in Hihya City and moved headquarters to support demand.'],
        ['2010', 'Abo Galal became a distributor of Golden Dragon microbuses, Foton microbuses, and Brilliance vehicles.'],
        ['2015', 'Onyx was established as an Egyptian joint stock company to grow the private-car business.'],
        ['2018', 'Onyx ranked as the biggest dealership in Al-Sharqia and one of the biggest in the Delta.'],
        ['2020', 'Onyx Used was established and the brand expanded with Haval, Changan, Jetour, Forthing, GMC, and Zemex distribution.'],
        ['2021', 'A new 10th of Ramadan City branch was acquired in Al-Osool Mall with capacity for around 60 cars.'],
        ['2022', 'Onyx Scooters launched, Onyx Motors aligned with new legal structure, and Khalaf Bus distribution expanded.'],
        ['2024', 'Onyx moved into eco-friendly vehicles and expanded through Cairo Chery and Carrefour Ismailia Renault showrooms.'],
        ['2025', 'Onyx added Proton, JAC, and Citroen distribution to widen brand coverage and customer access.']
    ];

    const values = ['Diverse', 'Drive and Lead', 'Act with integrity', 'Adapt and Evolve', 'Strive to simplicity', 'Think big, bold and broad'];
    const rawCars = Array.isArray(window.OnyxInventory) ? window.OnyxInventory : [];

    const state = {
        inventory: {
            search: '',
            brand: 'all',
            category: 'all',
            sort: 'featured',
            view: 'grid'
        },
        compare: getCompareSlugs(),
        finance: {
            slug: '',
            down: 25,
            months: 60,
            rate: 18,
            insurance: 2.2
        },
        concierge: {
            budget: 'any',
            usage: 'family',
            pace: 'balanced',
            seats: 'any',
            brand: 'any'
        },
        showroom: {
            slug: '',
            frame: 0,
            scene: 'gallery'
        }
    };

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatEGP(value) {
        if (!Number.isFinite(value) || value <= 0) return 'Price on request';
        return `${Math.round(value).toLocaleString('en-US')} EGP`;
    }

    function compactEGP(value) {
        if (!Number.isFinite(value) || value <= 0) return 'POA';
        if (value >= 1000000) return `${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)}M EGP`;
        return `${Math.round(value / 1000)}K EGP`;
    }

    function estimateMonthly(price, downPercent, months, annualRate) {
        if (!Number.isFinite(price) || price <= 0) return 0;
        const principal = Math.max(price - price * downPercent / 100, 0);
        const monthlyRate = annualRate / 100 / 12;
        if (!monthlyRate) return principal / months;
        return principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
    }

    function parseDetails(details) {
        const text = String(details || '').replace(/\s+/g, ' ').trim();
        const pick = (regex, fallback = '') => {
            const match = text.match(regex);
            return match ? match[1].trim() : fallback;
        };
        const numberPick = (regex) => {
            const value = Number(pick(regex, '0').replace(/,/g, ''));
            return Number.isFinite(value) ? value : 0;
        };
        return {
            warranty: pick(/Warranty\s*-\s*(.*?)(?=\s+Engine capacity|$)/i, 'Ask Onyx'),
            engine: pick(/Engine capacity\s*([0-9.]+\s*CC(?:\s*-\s*Turbo)?)/i, 'Ask Onyx'),
            turbo: /Turbo/i.test(text),
            horsepower: numberPick(/([0-9]{2,4})\s*Horse Power/i),
            speeds: pick(/Speeds\s*([^\s]+(?:\s*\+\s*[^\s]+)?)/i, 'Ask Onyx'),
            seats: numberPick(/([0-9]{1,2})\s*Seat/i) || 5,
            transmission: pick(/Transmission Type\s*(.*?)(?=\s+Fuel|\s+Length|$)/i, 'Ask Onyx').replace(/Atomatic/gi, 'Automatic').replace(/Manul/gi, 'Manual'),
            fuel: pick(/Fuel\s*([^\s]+)(?:\s+Full AC|\s+Length|$)/i, 'Ask Onyx'),
            length: numberPick(/Length\s*\(mm\)\s*([0-9]+)/i),
            width: numberPick(/Width\s*\(mm\)\s*([0-9]+)/i),
            height: numberPick(/Height\s*\(mm\)\s*([0-9]+)/i),
            wheelbase: numberPick(/Wheel Base\s*([0-9]+)/i)
        };
    }

    function inferCategory(car, specs) {
        const text = `${car.title} ${car.details}`.toLowerCase();
        if (/microbus|bus|khalaf|kyc|van/.test(text) || specs.seats >= 8) return 'Commercial';
        if (/scooter/.test(text)) return 'Scooters';
        if (/electric|ev|byd|eco/.test(text)) return 'Eco';
        if (/pickup|truck/.test(text)) return 'Pickup';
        if (specs.height >= 1660 || /x7|x55|bj30|h6|jolion|tiggo|jetour|suv|coolray|okavango/.test(text)) return 'SUV';
        if (specs.horsepower >= 170 || /turbo|sport|premium|luxury/.test(text)) return 'Performance';
        return 'Sedan';
    }

    function normalizeCar(car, index) {
        const specs = parseDetails(car.details);
        const priceMin = Number(car.price?.min || 0);
        const priceMax = Number(car.price?.max || priceMin || 0);
        const averagePrice = priceMin && priceMax ? (priceMin + priceMax) / 2 : priceMin || priceMax || 0;
        const gallery = [...new Set([car.heroImage, ...(car.gallery || [])].filter(Boolean))];
        const category = inferCategory(car, specs);
        return {
            ...car,
            index,
            specs,
            category,
            priceMin,
            priceMax,
            averagePrice,
            gallery,
            image: gallery[0] || '',
            imageAlt: `${car.title} official Onyx image`,
            priceDisplay: car.priceLabel || car.price?.display || formatEGP(averagePrice),
            summary: buildSummary(car, specs, category),
            search: `${car.title} ${car.brand} ${category} ${car.details}`.toLowerCase()
        };
    }

    function buildSummary(car, specs, category) {
        const power = specs.horsepower ? `${specs.horsepower} HP` : specs.engine;
        const seatText = specs.seats ? `${specs.seats} seats` : 'customer-matched cabin';
        return `${car.brand} ${category.toLowerCase()} with ${power}, ${specs.transmission}, and ${seatText}.`;
    }

    const cars = rawCars.map(normalizeCar).filter((car) => car.title && car.slug);
    const pricedCars = cars.filter((car) => car.averagePrice > 0).sort((a, b) => a.averagePrice - b.averagePrice);
    const brands = [...new Set(cars.map((car) => car.brand).filter(Boolean))].sort();
    const categories = [...new Set(cars.map((car) => car.category).filter(Boolean))].sort();

    if (!state.finance.slug && pricedCars[0]) state.finance.slug = pricedCars[Math.min(6, pricedCars.length - 1)].slug;
    if (!state.showroom.slug && cars[0]) state.showroom.slug = cars[0].slug;
    if (!state.compare.length) state.compare = pricedCars.slice(0, 3).map((car) => car.slug);

    document.addEventListener('DOMContentLoaded', () => {
        const page = document.body.dataset.page || 'home';
        initShell(page);
        initCinematicChrome(page);
        renderPage(page);
        initMotion();
        initHeroCanvas();
        initInteractiveDepth();
        loadI18n();
        loadPremium();
    });

    function loadI18n() {
        if (document.querySelector('script[src="i18n.js"]')) {
            window.OnyxI18n?.refresh?.();
            return;
        }
        const script = document.createElement('script');
        script.src = 'i18n.js';
        script.defer = true;
        document.head.append(script);
    }

    function loadPremium() {
        if (!document.querySelector('link[href="premium.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'premium.css';
            document.head.append(link);
        }
        if (!document.querySelector('script[src="premium.js"]')) {
            const s = document.createElement('script');
            s.src = 'premium.js';
            s.defer = true;
            document.head.append(s);
        } else {
            window.OnyxPremium?.bindTilt?.();
            window.OnyxPremium?.bindButtons?.();
        }
    }

    function refreshI18n() {
        window.OnyxI18n?.refresh?.();
    }

    function initShell(page) {
        const shell = document.getElementById('platform-shell') || document.body;
        const nav = document.createElement('nav');
        nav.className = 'platform-nav';
        nav.innerHTML = `
            <a class="platform-logo" href="index.html" aria-label="Onyx home">Onyx</a>
            <div class="platform-nav__links" aria-label="Main pages">
                ${navItems.slice(1, 13).map(([key, href, label]) => `<a class="platform-link ${key === page ? 'is-active' : ''}" href="${href}">${label}</a>`).join('')}
            </div>
            <div class="platform-nav__actions">
                <a class="platform-action" href="tel:15052">15052</a>
                <a class="platform-action platform-action--primary" href="book.html">Book</a>
            </div>`;
        shell.prepend(nav);
    }

    function renderPage(page) {
        const root = document.getElementById('platform-root');
        if (!root) return;
        const renderers = {
            cars: renderInventoryPage,
            model: renderModelPage,
            offers: renderOffersPage,
            brands: renderBrandsPage,
            compare: renderComparePage,
            finance: renderFinancePage,
            concierge: renderConciergePage,
            showroom: renderShowroomPage,
            services: renderServicesPage,
            trade: renderTradeInPage,
            branches: renderBranchesPage,
            about: renderAboutPage,
            stories: renderStoriesPage,
            book: renderBookPage,
            contact: renderContactPage
        };
        const renderer = renderers[page] || renderInventoryPage;
        renderer(root);
        renderFooter();
    }

    function heroMarkup(kicker, title, copy, image, stats = []) {
        return `
            <section class="platform-hero platform-hero--compact reveal-up" style="--hero-image: url('${escapeHtml(image || '')}')">
                <div class="platform-hero__photo" aria-hidden="true">${image ? `<img src="${escapeHtml(image)}" alt="">` : ''}</div>
                <canvas class="platform-hero__canvas" aria-hidden="true"></canvas>
                <div class="platform-hero__copy">
                    <p class="platform-kicker">${escapeHtml(kicker)}</p>
                    <h1 class="platform-title">${title}</h1>
                    <p class="platform-copy">${escapeHtml(copy)}</p>
                    <div class="action-row">
                        <a class="platform-action platform-action--primary" href="cars.html">Explore cars</a>
                        <a class="platform-action" href="concierge.html">Find my car</a>
                        <a class="platform-action" href="compare.html">Compare</a>
                    </div>
                </div>
                <div class="platform-hero__visual">
                    ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(kicker)}">` : ''}
                    <div class="platform-hero__hud"><span>Onyx Live Feed</span><span>${escapeHtml(kicker)}</span></div>
                    <div class="hero-stat-strip">
                        ${stats.map(([value, label]) => `<div class="hero-stat"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`).join('')}
                    </div>
                </div>
            </section>`;
    }

    function renderInventoryPage(root) {
        const brandParam = new URLSearchParams(location.search).get('brand');
        if (brandParam && brands.includes(brandParam)) state.inventory.brand = brandParam;
        root.className = 'platform-page';
        const heroCar = cars.find((car) => car.image) || cars[0];
        root.innerHTML = `
            ${heroMarkup('Onyx Live Inventory', 'Every <span>Car</span>', 'A full live showroom from Onyx data: search, filters, price intelligence, compare tray, and real model pages generated from the scraped official catalog.', heroCar?.image, [[cars.length, 'official catalog vehicles'], [brands.length, 'authorized brands'], [categories.length, 'market categories']])}
            <section class="platform-section reveal-up">
                <div class="section-head">
                    <div>
                        <p class="section-kicker">Inventory OS</p>
                        <h2 class="section-title">Search the whole showroom.</h2>
                    </div>
                    <p class="panel-copy">This is not a flat listing. It behaves like a digital sales desk: filter by intent, sort by price or performance, open any model, and carry cars into comparison.</p>
                </div>
                <div class="command-panel">
                    <div class="command-bar">
                        <input class="command-input" id="inventory-search" type="search" placeholder="Search brand, model, engine, seats, price..." value="${escapeHtml(state.inventory.search)}">
                        <select class="command-select" id="inventory-brand">
                            <option value="all">All brands</option>
                            ${brands.map((brand) => `<option value="${escapeHtml(brand)}" ${state.inventory.brand === brand ? 'selected' : ''}>${escapeHtml(brand)}</option>`).join('')}
                        </select>
                        <select class="command-select" id="inventory-sort">
                            ${[['featured', 'Featured'], ['price-asc', 'Price low to high'], ['price-desc', 'Price high to low'], ['power-desc', 'Power'], ['newest', 'Newest scraped']].map(([value, label]) => `<option value="${value}" ${state.inventory.sort === value ? 'selected' : ''}>${label}</option>`).join('')}
                        </select>
                    </div>
                    <div class="filter-row" id="category-filters">
                        <button class="filter-chip ${state.inventory.category === 'all' ? 'is-active' : ''}" data-category="all">All categories</button>
                        ${categories.map((category) => `<button class="filter-chip ${state.inventory.category === category ? 'is-active' : ''}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('')}
                    </div>
                </div>
                <div class="compare-tray panel" id="compare-tray"></div>
                <div class="vehicle-grid" id="inventory-grid"></div>
            </section>`;
        bindInventory();
        updateInventoryGrid();
    }

    function bindInventory() {
        const search = document.getElementById('inventory-search');
        const brand = document.getElementById('inventory-brand');
        const sort = document.getElementById('inventory-sort');
        search?.addEventListener('input', () => {
            state.inventory.search = search.value.trim().toLowerCase();
            updateInventoryGrid();
        });
        brand?.addEventListener('change', () => {
            state.inventory.brand = brand.value;
            updateInventoryGrid();
        });
        sort?.addEventListener('change', () => {
            state.inventory.sort = sort.value;
            updateInventoryGrid();
        });
        document.getElementById('category-filters')?.addEventListener('click', (event) => {
            const button = event.target.closest('[data-category]');
            if (!button) return;
            state.inventory.category = button.dataset.category;
            document.querySelectorAll('[data-category]').forEach((item) => item.classList.toggle('is-active', item === button));
            updateInventoryGrid();
        });
    }

    function filteredCars() {
        let output = [...cars];
        const { search, brand, category, sort } = state.inventory;
        if (search) output = output.filter((car) => car.search.includes(search));
        if (brand !== 'all') output = output.filter((car) => car.brand === brand);
        if (category !== 'all') output = output.filter((car) => car.category === category);
        const sorters = {
            'price-asc': (a, b) => (a.averagePrice || Infinity) - (b.averagePrice || Infinity),
            'price-desc': (a, b) => (b.averagePrice || 0) - (a.averagePrice || 0),
            'power-desc': (a, b) => (b.specs.horsepower || 0) - (a.specs.horsepower || 0),
            newest: (a, b) => b.index - a.index,
            featured: (a, b) => scoreCar(b) - scoreCar(a)
        };
        return output.sort(sorters[sort] || sorters.featured);
    }

    function scoreCar(car) {
        return (car.gallery.length * 4) + (car.specs.horsepower || 0) / 10 + (car.priceMin ? 20 : 0) + (car.category === 'Eco' ? 10 : 0);
    }

    function updateInventoryGrid() {
        const grid = document.getElementById('inventory-grid');
        const tray = document.getElementById('compare-tray');
        if (!grid) return;
        const output = filteredCars();
        grid.innerHTML = output.map(vehicleCard).join('') || `<div class="panel"><h3 class="card-title">No exact match.</h3><p class="panel-copy">Try a wider budget, brand, or category.</p></div>`;
        grid.querySelectorAll('[data-compare]').forEach((button) => button.addEventListener('click', toggleCompareFromButton));
        if (tray) {
            tray.innerHTML = compareTrayMarkup();
            document.getElementById('clear-compare')?.addEventListener('click', clearCompare);
        }
        refreshI18n();
    }

    function vehicleCard(car) {
        const selected = state.compare.includes(car.slug);
        return `
            <article class="vehicle-card">
                <a class="vehicle-card__image" href="model.html?car=${encodeURIComponent(car.slug)}" aria-label="Open ${escapeHtml(car.title)}">
                    ${car.image ? `<img src="${escapeHtml(car.image)}" alt="${escapeHtml(car.imageAlt)}" loading="lazy">` : ''}
                </a>
                <div class="vehicle-card__body">
                    <div>
                        <p class="micro-label">${escapeHtml(car.brand)} / ${escapeHtml(car.category)}</p>
                        <h3 class="vehicle-name">${escapeHtml(car.title)}</h3>
                    </div>
                    <div class="price-line">${escapeHtml(car.priceDisplay)}</div>
                    <div class="spec-pills">
                        <span class="spec-pill">${escapeHtml(car.specs.engine)}</span>
                        <span class="spec-pill">${car.specs.horsepower || 'Ask'} HP</span>
                        <span class="spec-pill">${car.specs.seats} seats</span>
                    </div>
                    <p class="card-copy">${escapeHtml(car.summary)}</p>
                    <div class="card-actions">
                        <a class="platform-action platform-action--primary" href="model.html?car=${encodeURIComponent(car.slug)}">View</a>
                        <button class="platform-action ${selected ? 'is-active' : ''}" data-compare="${escapeHtml(car.slug)}">${selected ? 'Added' : 'Compare'}</button>
                    </div>
                </div>
            </article>`;
    }

    function compareTrayMarkup() {
        const selected = state.compare.map(findCar).filter(Boolean);
        return `
            <div>
                <p class="micro-label">Comparison tray</p>
                <div class="filter-row">
                    ${selected.map((car) => `<span class="model-token is-active">${escapeHtml(car.title)}</span>`).join('') || '<span class="panel-copy">Pick up to four cars from the grid.</span>'}
                </div>
            </div>
            <div class="action-row">
                <a class="platform-action platform-action--primary" href="compare.html?cars=${encodeURIComponent(state.compare.join(','))}">Open compare</a>
                <button class="platform-action" id="clear-compare">Clear</button>
            </div>`;
    }

    function toggleCompareFromButton(event) {
        const slug = event.currentTarget.dataset.compare;
        toggleCompare(slug);
        updateInventoryGrid();
        document.getElementById('clear-compare')?.addEventListener('click', clearCompare);
    }

    function toggleCompare(slug) {
        if (!slug) return;
        const exists = state.compare.includes(slug);
        state.compare = exists ? state.compare.filter((item) => item !== slug) : [...state.compare, slug].slice(-4);
        saveCompareSlugs(state.compare);
    }

    function clearCompare() {
        state.compare = [];
        saveCompareSlugs(state.compare);
        updateInventoryGrid();
    }

    function renderModelPage(root) {
        const slug = new URLSearchParams(location.search).get('car') || cars[0]?.slug;
        const car = findCar(slug) || cars[0];
        if (!car) {
            root.innerHTML = '<section class="platform-page"><h1>No inventory loaded.</h1></section>';
            return;
        }
        const related = cars.filter((item) => item.slug !== car.slug && (item.brand === car.brand || item.category === car.category)).slice(0, 3);
        root.className = 'platform-page';
        root.innerHTML = `
            <section class="model-hero reveal-up">
                <div class="model-gallery">
                    <div class="model-gallery__main"><img id="model-main-image" src="${escapeHtml(car.image)}" alt="${escapeHtml(car.imageAlt)}"></div>
                    <div class="gallery-thumbs">
                        ${car.gallery.slice(0, 5).map((image, index) => `<button class="gallery-thumb ${index === 0 ? 'is-active' : ''}" data-image="${escapeHtml(image)}"><img src="${escapeHtml(image)}" alt="${escapeHtml(car.title)} angle ${index + 1}"></button>`).join('')}
                    </div>
                </div>
                <aside class="model-data panel">
                    <p class="micro-label">${escapeHtml(car.brand)} / ${escapeHtml(car.category)}</p>
                    <h1>${escapeHtml(car.title)}</h1>
                    <p class="price-line">${escapeHtml(car.priceDisplay)}</p>
                    <p class="panel-copy">${escapeHtml(car.summary)} The page is generated from Onyx catalog data, including official photos, pricing labels, and specification text.</p>
                    <div class="metric-grid">
                        ${metricCard(compactEGP(car.priceMin), 'starting price', 'Onyx listed range')}
                        ${metricCard(car.specs.horsepower || 'Ask', 'horsepower', car.specs.engine)}
                        ${metricCard(car.specs.seats, 'seats', car.specs.transmission)}
                    </div>
                    <div class="action-row">
                        <a class="platform-action platform-action--primary" href="book.html?car=${encodeURIComponent(car.slug)}">Book test drive</a>
                        <a class="platform-action" href="finance.html?car=${encodeURIComponent(car.slug)}">Finance it</a>
                        <a class="platform-action" href="${escapeHtml(car.url)}" target="_blank" rel="noreferrer">Onyx source</a>
                    </div>
                </aside>
            </section>
            <section class="platform-section reveal-up">
                <div class="section-head"><div><p class="section-kicker">Specification intelligence</p><h2 class="section-title">What matters at sale time.</h2></div><p class="panel-copy">A dealership-grade detail page should turn raw text into useful decisions: dimensions, power, warranty, payment entry, and comparable alternatives.</p></div>
                <div class="grid-2">
                    <div class="panel">${specTable(car)}</div>
                    <div class="panel"><h3 class="card-title">Decision read</h3><p class="panel-copy">${escapeHtml(decisionRead(car))}</p><div class="spec-pills">${[car.category, car.brand, car.specs.fuel, car.specs.transmission, car.specs.warranty].map((item) => `<span class="spec-pill">${escapeHtml(item)}</span>`).join('')}</div></div>
                </div>
            </section>
            <section class="platform-section reveal-up"><div class="section-head"><div><p class="section-kicker">Similar picks</p><h2 class="section-title">Keep the customer moving.</h2></div><p class="panel-copy">Related models stay on the page so a customer never hits a dead end.</p></div><div class="vehicle-grid">${related.map(vehicleCard).join('')}</div></section>`;
        root.querySelectorAll('.gallery-thumb').forEach((button) => button.addEventListener('click', () => {
            document.getElementById('model-main-image').src = button.dataset.image;
            root.querySelectorAll('.gallery-thumb').forEach((item) => item.classList.toggle('is-active', item === button));
        }));
        root.querySelectorAll('[data-compare]').forEach((button) => button.addEventListener('click', toggleCompareFromButton));
    }

    function metricCard(value, label, note) {
        return `<div class="data-card metric-card"><span class="metric-label">${escapeHtml(label)}</span><div class="metric-value">${escapeHtml(value)}</div><p class="metric-note">${escapeHtml(note)}</p></div>`;
    }

    function specTable(car) {
        const rows = [
            ['Price', car.priceDisplay],
            ['Warranty', car.specs.warranty],
            ['Engine', car.specs.engine],
            ['Horsepower', car.specs.horsepower ? `${car.specs.horsepower} HP` : 'Ask Onyx'],
            ['Transmission', car.specs.transmission],
            ['Fuel', car.specs.fuel],
            ['Seats', car.specs.seats],
            ['Length', car.specs.length ? `${car.specs.length} mm` : 'Ask Onyx'],
            ['Width', car.specs.width ? `${car.specs.width} mm` : 'Ask Onyx'],
            ['Height', car.specs.height ? `${car.specs.height} mm` : 'Ask Onyx'],
            ['Wheelbase', car.specs.wheelbase ? `${car.specs.wheelbase} mm` : 'Ask Onyx']
        ];
        return `<table class="spec-table"><tbody>${rows.map(([key, value]) => `<tr><td>${escapeHtml(key)}</td><td>${escapeHtml(value)}</td></tr>`).join('')}</tbody></table>`;
    }

    function decisionRead(car) {
        const price = car.averagePrice ? `sits around ${compactEGP(car.averagePrice)}` : 'requires Onyx pricing confirmation';
        const size = car.specs.length ? `with a ${car.specs.length} mm body and ${car.specs.wheelbase || 'listed'} mm wheelbase` : 'with dimensions to confirm at showroom';
        const power = car.specs.horsepower ? `${car.specs.horsepower} HP` : car.specs.engine;
        return `${car.title} ${price}, offers ${power}, and lands in the ${car.category.toLowerCase()} lane ${size}. It should be positioned against customers who care about ${car.category === 'SUV' ? 'presence, ride height, and family flexibility' : car.category === 'Eco' ? 'lower-running-cost ownership and future-facing mobility' : 'daily comfort, value, and availability'}.`;
    }

    function renderOffersPage(root) {
        const offers = pricedCars.slice(0, 12).map((car, index) => ({
            car,
            tag: index < 4 ? 'Entry move' : index < 8 ? 'Smart middle' : 'Premium step',
            deposit: Math.round((car.averagePrice * 0.25) / 1000) * 1000,
            monthly: estimateMonthly(car.averagePrice, 25, 60, 18)
        }));
        const heroCar = offers[0]?.car || cars[0];
        root.className = 'platform-page';
        root.innerHTML = `
            ${heroMarkup('Offer Board', 'Live <span>Deals</span>', 'A serious offers page does not invent discounts. It turns Onyx listed prices into clear entry points, payment starts, and action paths.', heroCar?.image, [[offers.length, 'priced offers'], [compactEGP(offers[0]?.car.averagePrice || 0), 'lowest entry'], ['60 mo', 'sample term']])}
            <section class="platform-section reveal-up">
                <div class="section-head"><div><p class="section-kicker">Commercial clarity</p><h2 class="section-title">Offers customers can understand.</h2></div><p class="panel-copy">Each offer uses the scraped Onyx price range and a transparent sample payment. Final financing must be confirmed by Onyx.</p></div>
                <div class="story-grid">${offers.map(({ car, tag, deposit, monthly }) => `<article class="story-card"><p class="micro-label">${escapeHtml(tag)}</p><h3 class="card-title">${escapeHtml(car.title)}</h3><p class="price-line">${escapeHtml(car.priceDisplay)}</p><p class="card-copy">Sample: ${formatEGP(deposit)} down, estimated ${formatEGP(monthly)} monthly for 60 months at 18% annual rate.</p><div class="action-row"><a class="platform-action platform-action--primary" href="finance.html?car=${encodeURIComponent(car.slug)}">Tune payment</a><a class="platform-action" href="model.html?car=${encodeURIComponent(car.slug)}">View car</a></div></article>`).join('')}</div>
            </section>`;
    }

    function renderBrandsPage(root) {
        const brandCards = brands.map((brand) => {
            const brandCars = cars.filter((car) => car.brand === brand);
            const min = Math.min(...brandCars.map((car) => car.averagePrice || Infinity));
            const categoriesForBrand = [...new Set(brandCars.map((car) => car.category))].join(', ');
            return { brand, brandCars, min: Number.isFinite(min) ? min : 0, categoriesForBrand };
        });
        const heroCar = brandCards.find((item) => item.brandCars[0]?.image)?.brandCars[0] || cars[0];
        root.className = 'platform-page';
        root.innerHTML = `
            ${heroMarkup('Brand Universe', 'Choose <span>Worlds</span>', 'Onyx is a multi-brand destination. This page makes the range legible by brand, price entry, category spread, and direct catalog access.', heroCar?.image, [[brands.length, 'brands'], [cars.length, 'cars'], [categories.length, 'segments']])}
            <section class="platform-section reveal-up">
                <div class="section-head"><div><p class="section-kicker">Authorized brand map</p><h2 class="section-title">Every marque has a door.</h2></div><p class="panel-copy">Instead of burying brands inside a grid, the brand page gives each marque a launch point and commercial role.</p></div>
                <div class="branch-grid">${brandCards.map(({ brand, brandCars, min, categoriesForBrand }) => `<article class="branch-card"><p class="micro-label">${brandCars.length} models</p><h3 class="card-title">${escapeHtml(brand)}</h3><p class="card-copy">Categories: ${escapeHtml(categoriesForBrand || 'Catalog')}. Entry from ${escapeHtml(compactEGP(min))} where pricing is available.</p><div class="spec-pills">${brandCars.slice(0, 4).map((car) => `<span class="spec-pill">${escapeHtml(car.title)}</span>`).join('')}</div><a class="platform-action platform-action--primary" href="cars.html?brand=${encodeURIComponent(brand)}">Open brand inventory</a></article>`).join('')}</div>
            </section>`;
    }

    function renderComparePage(root) {
        root.className = 'platform-page';
        const params = new URLSearchParams(location.search).get('cars');
        if (params) state.compare = params.split(',').map((item) => item.trim()).filter(Boolean).slice(0, 4);
        if (!state.compare.length) state.compare = pricedCars.slice(0, 3).map((car) => car.slug);
        const selected = state.compare.map(findCar).filter(Boolean);
        root.innerHTML = `
            ${heroMarkup('Compare Studio', 'Make <span>Choices</span>', 'A clear comparison floor for Onyx shoppers: select up to four vehicles and see price, size, power, warranty, and category tradeoffs in one place.', selected[0]?.image || cars[0]?.image, [[selected.length, 'cars compared'], [brands.length, 'brands available'], [cars.length, 'catalog records']])}
            <section class="platform-section reveal-up">
                <div class="section-head"><div><p class="section-kicker">Comparison matrix</p><h2 class="section-title">Every tradeoff, visible.</h2></div><p class="panel-copy">Premium automotive sites win when they reduce anxiety. This page turns Onyx data into a focused decision surface.</p></div>
                <div class="command-panel"><div class="form-grid" id="compare-selectors">${[0,1,2,3].map((slot) => compareSelect(slot, selected[slot])).join('')}</div></div>
                <div class="grid-2">
                    <div class="panel compare-canvas-wrap"><canvas id="compare-radar" width="760" height="520" aria-label="Comparison radar chart"></canvas></div>
                    <div class="panel" id="compare-table-wrap">${compareTable(selected)}</div>
                </div>
            </section>`;
        bindCompare();
        drawCompareRadar(selected);
    }

    function compareSelect(slot, selectedCar) {
        return `<div class="form-field"><label>Slot ${slot + 1}</label><select class="command-select" data-compare-slot="${slot}"><option value="">Empty slot</option>${cars.map((car) => `<option value="${escapeHtml(car.slug)}" ${selectedCar?.slug === car.slug ? 'selected' : ''}>${escapeHtml(car.title)}</option>`).join('')}</select></div>`;
    }

    function bindCompare() {
        document.querySelectorAll('[data-compare-slot]').forEach((select) => {
            select.addEventListener('change', () => {
                const values = [...document.querySelectorAll('[data-compare-slot]')].map((item) => item.value).filter(Boolean);
                state.compare = [...new Set(values)].slice(0, 4);
                saveCompareSlugs(state.compare);
                const selected = state.compare.map(findCar).filter(Boolean);
                document.getElementById('compare-table-wrap').innerHTML = compareTable(selected);
                drawCompareRadar(selected);
                history.replaceState(null, '', `compare.html?cars=${encodeURIComponent(state.compare.join(','))}`);
                refreshI18n();
            });
        });
    }

    function compareTable(selected) {
        if (!selected.length) return '<p class="panel-copy">Choose vehicles to compare.</p>';
        const rows = [
            ['Brand', (car) => car.brand],
            ['Category', (car) => car.category],
            ['Price', (car) => car.priceDisplay],
            ['Engine', (car) => car.specs.engine],
            ['Horsepower', (car) => car.specs.horsepower ? `${car.specs.horsepower} HP` : 'Ask'],
            ['Transmission', (car) => car.specs.transmission],
            ['Fuel', (car) => car.specs.fuel],
            ['Seats', (car) => car.specs.seats],
            ['Warranty', (car) => car.specs.warranty],
            ['Dimensions', (car) => `${car.specs.length || '-'} x ${car.specs.width || '-'} x ${car.specs.height || '-'} mm`]
        ];
        return `<table class="compare-table"><thead><tr><th>Metric</th>${selected.map((car) => `<th>${escapeHtml(car.title)}</th>`).join('')}</tr></thead><tbody>${rows.map(([label, getter]) => `<tr><td>${escapeHtml(label)}</td>${selected.map((car) => `<td>${escapeHtml(getter(car))}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    }

    function drawCompareRadar(selected) {
        const canvas = document.getElementById('compare-radar');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#08111d';
        ctx.fillRect(0, 0, width, height);
        const labels = ['Value', 'Power', 'Cabin', 'Size', 'Photos'];
        const centerX = width / 2;
        const centerY = height / 2 + 14;
        const radius = Math.min(width, height) * 0.34;
        ctx.strokeStyle = 'rgba(255,255,255,0.13)';
        ctx.fillStyle = 'rgba(247,247,242,0.72)';
        ctx.font = '14px Satoshi, sans-serif';
        for (let ring = 1; ring <= 5; ring += 1) {
            ctx.beginPath();
            labels.forEach((_, index) => {
                const point = radarPoint(centerX, centerY, radius * ring / 5, labels.length, index);
                if (index === 0) ctx.moveTo(point.x, point.y); else ctx.lineTo(point.x, point.y);
            });
            ctx.closePath();
            ctx.stroke();
        }
        labels.forEach((label, index) => {
            const point = radarPoint(centerX, centerY, radius + 30, labels.length, index);
            ctx.fillText(label, point.x - 20, point.y + 4);
        });
        const colors = ['#9fc8ff', '#79f2d5', '#f4b26d', '#f082ac'];
        const maxPrice = Math.max(...pricedCars.map((car) => car.averagePrice || 0), 1);
        const maxPower = Math.max(...cars.map((car) => car.specs.horsepower || 0), 1);
        selected.forEach((car, carIndex) => {
            const values = [
                car.averagePrice ? 1 - (car.averagePrice / maxPrice) * 0.7 : 0.45,
                (car.specs.horsepower || 90) / maxPower,
                Math.min((car.specs.seats || 5) / 8, 1),
                Math.min(((car.specs.length || 4300) - 3600) / 1600, 1),
                Math.min(car.gallery.length / 8, 1)
            ].map((value) => Math.max(0.15, Math.min(1, value)));
            ctx.beginPath();
            values.forEach((value, index) => {
                const point = radarPoint(centerX, centerY, radius * value, values.length, index);
                if (index === 0) ctx.moveTo(point.x, point.y); else ctx.lineTo(point.x, point.y);
            });
            ctx.closePath();
            ctx.fillStyle = hexToRgba(colors[carIndex], 0.14);
            ctx.strokeStyle = colors[carIndex];
            ctx.lineWidth = 3;
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = colors[carIndex];
            ctx.fillText(car.title, 28, 34 + carIndex * 26);
        });
    }

    function radarPoint(centerX, centerY, radius, total, index) {
        const angle = -Math.PI / 2 + index * Math.PI * 2 / total;
        return { x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius };
    }

    function hexToRgba(hex, alpha) {
        const value = hex.replace('#', '');
        const int = parseInt(value, 16);
        const r = (int >> 16) & 255;
        const g = (int >> 8) & 255;
        const b = int & 255;
        return `rgba(${r},${g},${b},${alpha})`;
    }

    function renderFinancePage(root) {
        const paramsSlug = new URLSearchParams(location.search).get('car');
        if (paramsSlug && findCar(paramsSlug)) state.finance.slug = paramsSlug;
        const car = findCar(state.finance.slug) || pricedCars[0];
        root.className = 'platform-page';
        root.innerHTML = `
            ${heroMarkup('Dynamic Finance Engine', 'Payment <span>Lab</span>', 'A realistic finance playground for Onyx customers: select a car, tune deposit, term, rate, insurance, and get a transparent estimated monthly payment.', car?.image || cars[0]?.image, [[compactEGP(car?.averagePrice || 0), 'selected price'], [`${state.finance.months} mo`, 'payment term'], [`${state.finance.down}%`, 'deposit']])}
            <section class="platform-section reveal-up">
                <div class="finance-lab">
                    <div class="command-panel">
                        <div class="form-field"><label>Vehicle</label><select class="command-select" id="finance-car">${pricedCars.map((item) => `<option value="${escapeHtml(item.slug)}" ${item.slug === car.slug ? 'selected' : ''}>${escapeHtml(item.title)} - ${compactEGP(item.averagePrice)}</option>`).join('')}</select></div>
                        ${rangeControl('down', 'Down payment', state.finance.down, 5, 70, '%')}
                        ${rangeControl('months', 'Months', state.finance.months, 12, 84, '')}
                        ${rangeControl('rate', 'Annual rate estimate', state.finance.rate, 6, 30, '%')}
                        ${rangeControl('insurance', 'Insurance estimate', state.finance.insurance, 0, 6, '%', 0.1)}
                        <p class="form-hint">Calculator output is an estimate for planning and should be confirmed with Onyx and financing partners.</p>
                    </div>
                    <div class="panel" id="finance-output"></div>
                </div>
            </section>`;
        bindFinance();
        updateFinanceOutput();
    }

    function rangeControl(key, label, value, min, max, suffix, step = 1) {
        return `<div class="range-control"><label><span>${escapeHtml(label)}</span><strong id="finance-${key}-value">${escapeHtml(value)}${suffix}</strong></label><input type="range" id="finance-${key}" min="${min}" max="${max}" step="${step}" value="${escapeHtml(value)}"></div>`;
    }

    function bindFinance() {
        document.getElementById('finance-car')?.addEventListener('change', (event) => {
            state.finance.slug = event.target.value;
            updateFinanceOutput();
        });
        ['down', 'months', 'rate', 'insurance'].forEach((key) => {
            document.getElementById(`finance-${key}`)?.addEventListener('input', (event) => {
                state.finance[key] = Number(event.target.value);
                const suffix = key === 'months' ? '' : '%';
                document.getElementById(`finance-${key}-value`).textContent = `${event.target.value}${suffix}`;
                updateFinanceOutput();
            });
        });
    }

    function updateFinanceOutput() {
        const output = document.getElementById('finance-output');
        const car = findCar(state.finance.slug) || pricedCars[0];
        if (!output || !car) return;
        const price = car.averagePrice || car.priceMin || 1000000;
        const downValue = price * state.finance.down / 100;
        const principal = Math.max(price - downValue, 0);
        const monthlyRate = state.finance.rate / 100 / 12;
        const months = state.finance.months;
        const emi = monthlyRate ? principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months)) : principal / months;
        const insuranceMonthly = price * state.finance.insurance / 100 / 12;
        const total = emi + insuranceMonthly;
        output.innerHTML = `
            <p class="micro-label">Estimated monthly</p>
            <div class="finance-number">${formatEGP(total)}</div>
            <p class="panel-copy">For ${escapeHtml(car.title)}, assuming ${formatEGP(downValue)} down and ${months} monthly payments. Insurance planning is separated so the customer sees what is loan and what is ownership cost.</p>
            <div class="metric-grid">
                ${metricCard(formatEGP(price), 'vehicle price', car.priceDisplay)}
                ${metricCard(formatEGP(principal), 'financed amount', `${state.finance.down}% down`)}
                ${metricCard(formatEGP(emi * months + downValue), 'estimated total', `${state.finance.rate}% annual rate`)}
            </div>
            <div class="action-row"><a class="platform-action platform-action--primary" href="book.html?car=${encodeURIComponent(car.slug)}">Request offer</a><a class="platform-action" href="model.html?car=${encodeURIComponent(car.slug)}">View model</a></div>`;
        refreshI18n();
    }

    function renderConciergePage(root) {
        root.className = 'platform-page';
        const heroCar = recommendCars()[0] || cars[0];
        root.innerHTML = `
            ${heroMarkup('Onyx Concierge', 'Find <span>Fit</span>', 'A practical recommendation engine. No fake magic: it uses budget, usage, seats, pace, and brand preference to rank real Onyx vehicles.', heroCar?.image, [[cars.length, 'vehicles scanned'], [brands.length, 'brand universe'], ['Local', 'rules engine']])}
            <section class="platform-section reveal-up">
                <div class="concierge-shell">
                    <div class="command-panel">
                        ${conciergeGroup('budget', 'Budget lane', [['any','Any'], ['entry','Under 1M'], ['mid','1M to 1.6M'], ['premium','1.6M plus']])}
                        ${conciergeGroup('usage', 'Primary use', [['family','Family'], ['city','City'], ['business','Business'], ['eco','Eco'], ['performance','Performance']])}
                        ${conciergeGroup('pace', 'Driving feel', [['calm','Calm'], ['balanced','Balanced'], ['quick','Quick']])}
                        ${conciergeGroup('seats', 'Seats', [['any','Any'], ['5','5 seats'], ['7','7+ seats']])}
                        ${conciergeBrandGroup()}
                    </div>
                    <div class="panel">
                        <div class="concierge-messages" id="concierge-messages"></div>
                        <div class="recommendation-grid" id="concierge-results"></div>
                    </div>
                </div>
            </section>`;
        bindConcierge();
        updateConcierge();
    }

    function conciergeGroup(key, label, options) {
        return `<div class="range-control"><label><span>${escapeHtml(label)}</span><strong>${escapeHtml(state.concierge[key])}</strong></label><div class="token-row">${options.map(([value, text]) => `<button class="control-pill ${state.concierge[key] === value ? 'is-active' : ''}" data-concierge="${key}" data-value="${value}">${escapeHtml(text)}</button>`).join('')}</div></div>`;
    }

    function conciergeBrandGroup() {
        const options = ['any', ...brands.slice(0, 10)];
        return `<div class="range-control"><label><span>Brand preference</span><strong>${escapeHtml(state.concierge.brand)}</strong></label><select class="command-select" id="concierge-brand">${options.map((brand) => `<option value="${escapeHtml(brand)}" ${state.concierge.brand === brand ? 'selected' : ''}>${escapeHtml(brand === 'any' ? 'Any brand' : brand)}</option>`).join('')}</select></div>`;
    }

    function bindConcierge() {
        document.querySelectorAll('[data-concierge]').forEach((button) => {
            button.addEventListener('click', () => {
                state.concierge[button.dataset.concierge] = button.dataset.value;
                document.querySelectorAll(`[data-concierge="${button.dataset.concierge}"]`).forEach((item) => item.classList.toggle('is-active', item === button));
                updateConcierge();
            });
        });
        document.getElementById('concierge-brand')?.addEventListener('change', (event) => {
            state.concierge.brand = event.target.value;
            updateConcierge();
        });
    }

    function recommendCars() {
        return cars.map((car) => ({ car, score: scoreRecommendation(car) })).sort((a, b) => b.score - a.score).slice(0, 6).map((item) => item.car);
    }

    function scoreRecommendation(car) {
        const answer = state.concierge;
        let score = 0;
        if (answer.brand !== 'any' && car.brand === answer.brand) score += 30;
        if (answer.usage === 'family' && (car.category === 'SUV' || car.specs.seats >= 7)) score += 26;
        if (answer.usage === 'city' && car.averagePrice && car.averagePrice < 1200000) score += 24;
        if (answer.usage === 'business' && ['Sedan', 'Commercial', 'SUV'].includes(car.category)) score += 20;
        if (answer.usage === 'eco' && car.category === 'Eco') score += 34;
        if (answer.usage === 'performance' && car.specs.horsepower >= 170) score += 32;
        if (answer.pace === 'quick' && car.specs.horsepower >= 170) score += 18;
        if (answer.pace === 'calm' && car.specs.transmission.includes('CVT')) score += 12;
        if (answer.seats === '7' && car.specs.seats >= 7) score += 26;
        if (answer.seats === '5' && car.specs.seats === 5) score += 12;
        if (answer.budget === 'entry' && car.averagePrice && car.averagePrice < 1000000) score += 28;
        if (answer.budget === 'mid' && car.averagePrice >= 1000000 && car.averagePrice <= 1600000) score += 28;
        if (answer.budget === 'premium' && car.averagePrice >= 1600000) score += 28;
        return score + scoreCar(car) / 4;
    }

    function updateConcierge() {
        const messages = document.getElementById('concierge-messages');
        const results = document.getElementById('concierge-results');
        if (!messages || !results) return;
        const recommended = recommendCars();
        messages.innerHTML = `
            <div class="message message--ai">Tell me the customer context and I will rank the Onyx catalog from actual prices and specs.</div>
            <div class="message message--user">Budget: ${escapeHtml(state.concierge.budget)}. Use: ${escapeHtml(state.concierge.usage)}. Feel: ${escapeHtml(state.concierge.pace)}. Seats: ${escapeHtml(state.concierge.seats)}.</div>
            <div class="message message--ai">Top fit: ${escapeHtml(recommended[0]?.title || 'No match yet')}. I am prioritizing ${escapeHtml(reasonForRecommendation(recommended[0]))}.</div>`;
        results.innerHTML = recommended.slice(0, 3).map(vehicleCard).join('');
        results.querySelectorAll('[data-compare]').forEach((button) => button.addEventListener('click', toggleCompareFromButton));
        refreshI18n();
    }

    function reasonForRecommendation(car) {
        if (!car) return 'a wider search';
        if (state.concierge.usage === 'family') return 'space, seats, and warranty confidence';
        if (state.concierge.usage === 'eco') return 'future-friendly brand and running-cost logic';
        if (state.concierge.usage === 'performance') return 'horsepower and turbo response';
        if (state.concierge.usage === 'business') return 'predictable price, category fit, and availability';
        return 'budget fit, brand match, and balanced specifications';
    }

    function renderShowroomPage(root) {
        const paramsSlug = new URLSearchParams(location.search).get('car');
        if (paramsSlug && findCar(paramsSlug)) state.showroom.slug = paramsSlug;
        const car = findCar(state.showroom.slug) || cars[0];
        root.className = 'platform-page';
        root.innerHTML = `
            ${heroMarkup('Spatial Showroom', 'Inspect <span>Reality</span>', 'A grounded image-based showroom: official Onyx photos, environment modes, gallery frames, dimensions, and product hotspots. Realistic, usable, and showroom-safe.', car?.image, [[car?.gallery.length || 0, 'official photos'], [car?.specs.length || '-', 'mm length'], [car?.specs.seats || '-', 'seats']])}
            <section class="platform-section reveal-up">
                <div class="showroom-stage">
                    <div class="panel showroom-media" id="showroom-media">
                        <span class="hotspot hotspot--a" title="Front design"></span>
                        <span class="hotspot hotspot--b" title="Cabin stance"></span>
                        <span class="hotspot hotspot--c" title="Wheelbase"></span>
                        <img id="showroom-image" src="${escapeHtml(car.image)}" alt="${escapeHtml(car.imageAlt)}">
                    </div>
                    <div class="command-panel">
                        <div class="form-field"><label>Vehicle</label><select class="command-select" id="showroom-car">${cars.map((item) => `<option value="${escapeHtml(item.slug)}" ${item.slug === car.slug ? 'selected' : ''}>${escapeHtml(item.title)}</option>`).join('')}</select></div>
                        <div class="range-control"><label><span>Photo frame</span><strong id="showroom-frame-value">1/${car.gallery.length}</strong></label><input type="range" id="showroom-frame" min="0" max="${Math.max(car.gallery.length - 1, 0)}" value="0"></div>
                        <div class="token-row">
                            ${[['gallery','Gallery'], ['driveway','Driveway'], ['delivery','Delivery'], ['night','Night']].map(([value, label]) => `<button class="control-pill ${state.showroom.scene === value ? 'is-active' : ''}" data-scene="${value}">${label}</button>`).join('')}
                        </div>
                        <div id="showroom-readout"></div>
                    </div>
                </div>
            </section>`;
        bindShowroom();
        updateShowroom();
    }

    function bindShowroom() {
        document.getElementById('showroom-car')?.addEventListener('change', (event) => {
            state.showroom.slug = event.target.value;
            state.showroom.frame = 0;
            renderShowroomPage(document.getElementById('platform-root'));
        });
        document.getElementById('showroom-frame')?.addEventListener('input', (event) => {
            state.showroom.frame = Number(event.target.value);
            updateShowroom();
        });
        document.querySelectorAll('[data-scene]').forEach((button) => {
            button.addEventListener('click', () => {
                state.showroom.scene = button.dataset.scene;
                document.querySelectorAll('[data-scene]').forEach((item) => item.classList.toggle('is-active', item === button));
                updateShowroom();
            });
        });
        const media = document.getElementById('showroom-media');
        media?.addEventListener('mousemove', (event) => {
            const rect = media.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            media.style.transform = `perspective(1200px) rotateY(${x * 5}deg) rotateX(${-y * 4}deg)`;
        });
        media?.addEventListener('mouseleave', () => { media.style.transform = ''; });
    }

    function updateShowroom() {
        const car = findCar(state.showroom.slug) || cars[0];
        const image = document.getElementById('showroom-image');
        const frameValue = document.getElementById('showroom-frame-value');
        const readout = document.getElementById('showroom-readout');
        if (!car || !image || !readout) return;
        const frame = Math.min(state.showroom.frame, car.gallery.length - 1);
        image.src = car.gallery[frame] || car.image;
        if (frameValue) frameValue.textContent = `${frame + 1}/${car.gallery.length}`;
        document.body.dataset.showroomScene = state.showroom.scene;
        readout.innerHTML = `
            <div class="metric-grid">
                ${metricCard(car.specs.length ? `${car.specs.length} mm` : 'Ask', 'length', 'driveway fit')}
                ${metricCard(car.specs.width ? `${car.specs.width} mm` : 'Ask', 'width', 'parking fit')}
                ${metricCard(car.specs.wheelbase ? `${car.specs.wheelbase} mm` : 'Ask', 'wheelbase', 'cabin stability')}
            </div>
            <p class="panel-copy">Scene mode: ${escapeHtml(state.showroom.scene)}. This keeps the feature realistic by inspecting official photos and specs instead of pretending to run an unavailable VR product.</p>
            <div class="action-row"><a class="platform-action platform-action--primary" href="model.html?car=${encodeURIComponent(car.slug)}">Open model page</a><a class="platform-action" href="book.html?car=${encodeURIComponent(car.slug)}">Book viewing</a></div>`;
        refreshI18n();
    }

    function renderServicesPage(root) {
        root.className = 'platform-page';
        root.innerHTML = `
            ${heroMarkup('Ownership Hub', 'After <span>Sale</span>', 'Onyx services become a proper ownership system: trade-in, used cars, installments, direct installments, document capture, and customer handoff.', cars[4]?.image || cars[0]?.image, [[services.length, 'service lanes'], ['15052', 'quick contact'], ['Onyx', 'service network']])}
            <section class="platform-section reveal-up">
                <div class="section-head"><div><p class="section-kicker">Onyx services</p><h2 class="section-title">From first lead to next car.</h2></div><p class="panel-copy">Based on Onyx official services: Trade In, Used Cars, Installment, and Direct Installment. This page turns each into a usable digital flow.</p></div>
                <div class="service-grid">${services.map(([title, copy]) => `<article class="service-card"><p class="micro-label">Service</p><h3 class="card-title">${escapeHtml(title)}</h3><p class="card-copy">${escapeHtml(copy)}</p><a class="platform-action platform-action--primary" href="contact.html?service=${encodeURIComponent(title)}">Start</a></article>`).join('')}</div>
            </section>
            <section class="platform-section reveal-up"><div class="grid-2"><div class="form-panel">${leadForm('Service request')}</div><div class="panel"><h3 class="card-title">Service command board</h3><p class="panel-copy">A real dealership experience needs visible next steps: customer information, car of interest, current vehicle, payment preference, and contact window. The form on this page models that intake.</p>${['Identify customer need', 'Collect vehicle and budget data', 'Route to sales or service desk', 'Confirm documents and appointment', 'Close with follow-up reminder'].map((item) => `<p class="spec-row"><span class="spec-pill">Step</span>${escapeHtml(item)}</p>`).join('')}</div></div></section>`;
        bindLeadForms(root);
    }

    function renderTradeInPage(root) {
        const baseCars = pricedCars.slice(0, 8);
        const target = findCar(new URLSearchParams(location.search).get('car')) || baseCars[3] || cars[0];
        root.className = 'platform-page';
        root.innerHTML = `
            ${heroMarkup('Trade-In Studio', 'Upgrade <span>Path</span>', 'A practical intake page for customers moving from an owned car into an Onyx vehicle. The estimator is transparent and keeps the next step human.', target?.image, [[compactEGP(target?.averagePrice || 0), 'target price'], ['4', 'condition bands'], ['15052', 'confirm value']])}
            <section class="platform-section reveal-up">
                <div class="finance-lab">
                    <div class="command-panel">
                        <div class="form-field"><label>Target Onyx vehicle</label><select class="command-select" id="trade-target">${baseCars.map((car) => `<option value="${escapeHtml(car.slug)}" ${target?.slug === car.slug ? 'selected' : ''}>${escapeHtml(car.title)} - ${compactEGP(car.averagePrice)}</option>`).join('')}</select></div>
                        <div class="form-field"><label>Current car value estimate</label><input class="command-input" id="trade-current" type="number" value="650000" min="0" step="10000"></div>
                        <div class="form-field"><label>Condition</label><select class="command-select" id="trade-condition"><option value="1">Excellent</option><option value="0.92">Good</option><option value="0.82">Needs cosmetic work</option><option value="0.68">Needs mechanical review</option></select></div>
                        <div class="form-field"><label>Outstanding loan</label><input class="command-input" id="trade-loan" type="number" value="0" min="0" step="10000"></div>
                    </div>
                    <div class="panel" id="trade-output"></div>
                </div>
            </section>`;
        bindTradeIn();
        updateTradeIn();
    }

    function bindTradeIn() {
        ['trade-target', 'trade-current', 'trade-condition', 'trade-loan'].forEach((id) => {
            document.getElementById(id)?.addEventListener('input', updateTradeIn);
            document.getElementById(id)?.addEventListener('change', updateTradeIn);
        });
    }

    function updateTradeIn() {
        const output = document.getElementById('trade-output');
        if (!output) return;
        const target = findCar(document.getElementById('trade-target')?.value) || pricedCars[0];
        const current = Number(document.getElementById('trade-current')?.value || 0);
        const condition = Number(document.getElementById('trade-condition')?.value || 1);
        const loan = Number(document.getElementById('trade-loan')?.value || 0);
        const adjusted = Math.max(current * condition - loan, 0);
        const gap = Math.max((target?.averagePrice || 0) - adjusted, 0);
        output.innerHTML = `<p class="micro-label">Estimated upgrade gap</p><div class="finance-number">${formatEGP(gap)}</div><p class="panel-copy">Estimated trade equity is ${formatEGP(adjusted)} after condition and loan adjustment. Final valuation requires Onyx inspection.</p><div class="metric-grid">${metricCard(formatEGP(target?.averagePrice || 0), 'target price', target?.title || 'Onyx vehicle')}${metricCard(formatEGP(adjusted), 'trade equity', 'after condition')}${metricCard(formatEGP(estimateMonthly(gap, 25, 60, 18)), 'sample monthly', 'gap financed')}</div><div class="action-row"><a class="platform-action platform-action--primary" href="contact.html?service=Trade%20In">Send trade request</a><a class="platform-action" href="model.html?car=${encodeURIComponent(target?.slug || '')}">View target</a></div>`;
        refreshI18n();
    }

    function renderBookPage(root) {
        const car = findCar(new URLSearchParams(location.search).get('car')) || cars[0];
        root.className = 'platform-page';
        root.innerHTML = `
            ${heroMarkup('Booking Desk', 'Reserve <span>Time</span>', 'A dealership-grade booking flow: choose car, purpose, branch intent, contact window, and prepare the request before calling Onyx.', car?.image, [[car?.title || 'Onyx', 'selected car'], ['15052', 'confirm booking'], ['5 min', 'request prep']])}
            <section class="platform-section reveal-up">
                <div class="grid-2">
                    <div class="form-panel">${leadForm(`Book ${car?.title || 'Onyx visit'}`, car?.title)}</div>
                    <div class="panel"><h3 class="card-title">Booking checklist</h3><p class="panel-copy">A premium booking page should reduce friction before the customer calls or submits: car of interest, branch preference, financing status, and test-drive purpose.</p>${['Pick exact model or ask the concierge', 'Choose test drive, viewing, financing, or trade-in', 'Confirm branch and contact window', 'Bring license and ID when visiting', 'Call 15052 for final appointment confirmation'].map((item) => `<p class="spec-row"><span class="spec-pill">Check</span>${escapeHtml(item)}</p>`).join('')}</div>
                </div>
            </section>`;
        bindLeadForms(root);
    }

    function renderBranchesPage(root) {
        root.className = 'platform-page';
        root.innerHTML = `
            ${heroMarkup('Branch Network', 'Reach <span>Onyx</span>', 'A cleaner branch and contact layer using Onyx official milestones and quick contact details. Customers can pick location intent, call 15052, or start a booking.', cars[8]?.image || cars[0]?.image, [[branches.length, 'network points'], ['15052', 'hotline'], ['Delta', 'origin strength']])}
            <section class="platform-section reveal-up"><div class="section-head"><div><p class="section-kicker">Locations</p><h2 class="section-title">Showrooms as a journey.</h2></div><p class="panel-copy">Branch details are drawn from Onyx's own about/contact content where available and presented as a navigable customer flow.</p></div><div class="branch-grid">${branches.map(([name, location, note, phone]) => `<article class="branch-card"><p class="micro-label">${escapeHtml(location)}</p><h3 class="card-title">${escapeHtml(name)}</h3><p class="card-copy">${escapeHtml(note)}</p><div class="action-row"><a class="platform-action platform-action--primary" href="tel:${escapeHtml(phone)}">Call ${escapeHtml(phone)}</a><a class="platform-action" href="contact.html?branch=${encodeURIComponent(name)}">Book visit</a></div></article>`).join('')}</div></section>`;
    }

    function renderAboutPage(root) {
        root.className = 'platform-page';
        root.innerHTML = `
            ${heroMarkup('Onyx Legacy', 'Built <span>Forward</span>', 'From a small three-microbus showroom in 1993 to more than 2,500 annual vehicle sales and a multi-brand authorized dealership footprint.', cars[12]?.image || cars[0]?.image, [['1993', 'founded'], ['2,500+', 'annual vehicles'], ['Eco', 'future vision']])}
            <section class="platform-section reveal-up"><div class="section-head"><div><p class="section-kicker">Vision and mission</p><h2 class="section-title">Credibility, fit, sustainability.</h2></div><p class="panel-copy">Onyx states a vision to be the most creditable dealership to customers and contribute to environmental sustainability by providing eco-friendly vehicles. The mission is direct: provide an appropriate vehicle for each client.</p></div><div class="metric-grid">${values.map((value) => metricCard(value, 'Onyx value', 'operating principle')).join('')}</div></section>
            <section class="platform-section reveal-up"><div class="section-head"><div><p class="section-kicker">Timeline</p><h2 class="section-title">The company story.</h2></div><p class="panel-copy">A dealership with history should use that history as trust infrastructure, not a buried paragraph.</p></div><div class="grid-2">${timeline.map(([year, copy]) => `<article class="data-card"><p class="micro-label">${escapeHtml(year)}</p><h3 class="card-title">${escapeHtml(year)}</h3><p class="card-copy">${escapeHtml(copy)}</p></article>`).join('')}</div></section>
            <section class="platform-section reveal-up"><div class="grid-2"><div class="panel"><p class="micro-label">Founder</p><h3 class="card-title">Mr. Saeed Otman</h3><p class="panel-copy">Founder and board member.</p></div><div class="panel"><p class="micro-label">Founder</p><h3 class="card-title">Mr. Hazem Otman</h3><p class="panel-copy">Founder and board member.</p></div></div></section>`;
    }

    function renderStoriesPage(root) {
        const topValue = pricedCars[0];
        const topPower = [...cars].sort((a, b) => (b.specs.horsepower || 0) - (a.specs.horsepower || 0))[0];
        const suvCount = cars.filter((car) => car.category === 'SUV').length;
        root.className = 'platform-page';
        root.innerHTML = `
            ${heroMarkup('Onyx Stories', 'Market <span>Signals</span>', 'Editorial pages do not have to be filler. This one turns the Onyx catalog and company milestones into useful buying intelligence.', topPower?.image || cars[0]?.image, [[suvCount, 'SUV options'], [compactEGP(topValue?.averagePrice || 0), 'lowest priced'], [topPower?.specs.horsepower || '-', 'top HP']])}
            <section class="platform-section reveal-up"><div class="section-head"><div><p class="section-kicker">Editorial system</p><h2 class="section-title">Stories that sell without shouting.</h2></div><p class="panel-copy">Premium brands use stories to create authority. Onyx can use data-backed stories to explain market options, ownership logic, and brand expansion.</p></div><div class="story-grid">
                ${storyCard('Best value in the Onyx catalog', topValue, `The most accessible listed model in the scraped Onyx catalog starts around ${compactEGP(topValue?.averagePrice || 0)}.`)}
                ${storyCard('The performance shortlist', topPower, `${topPower?.title || 'A top model'} leads the power ranking with ${topPower?.specs.horsepower || 'listed'} HP.`)}
                ${storyCard('SUV gravity in Egypt', cars.find((car) => car.category === 'SUV'), `${suvCount} Onyx catalog entries land in the SUV lane, showing where family demand is concentrated.`)}
                ${storyCard('Eco mobility direction', cars.find((car) => car.category === 'Eco'), 'Onyx states environmental sustainability as part of its vision, so eco-friendly inventory needs a dedicated editorial lane.')}
                ${storyCard('How to choose installments', pricedCars[Math.floor(pricedCars.length / 2)], 'Financing content should explain down payment, term length, insurance, and confirmation steps before a customer arrives.')}
                ${storyCard('From Delta strength to multi-branch scale', cars[6], 'The company history supports a trust story that spans Al-Sharqia, Delta, Cairo, 10th of Ramadan, and Ismailia milestones.')}
            </div></section>`;
    }

    function storyCard(title, car, copy) {
        return `<article class="story-card"><p class="micro-label">Onyx insight</p><h3 class="card-title">${escapeHtml(title)}</h3><p class="card-copy">${escapeHtml(copy)}</p>${car ? `<a class="platform-action platform-action--primary" href="model.html?car=${encodeURIComponent(car.slug)}">Open ${escapeHtml(car.title)}</a>` : '<a class="platform-action platform-action--primary" href="cars.html">Open catalog</a>'}</article>`;
    }

    function renderContactPage(root) {
        const service = new URLSearchParams(location.search).get('service') || 'General request';
        const car = findCar(new URLSearchParams(location.search).get('car'));
        root.className = 'platform-page';
        root.innerHTML = `
            ${heroMarkup('Contact Onyx', 'Start <span>Here</span>', 'Every serious dealership platform needs a clean conversion end point: call, book, request financing, request trade-in, or ask for branch help.', cars[10]?.image || cars[0]?.image, [['15052', 'hotline'], ['hello@onyx-eg.com', 'email'], ['Social', 'Facebook Instagram TikTok YouTube LinkedIn']])}
            <section class="platform-section reveal-up"><div class="grid-2"><div class="form-panel">${leadForm(service, car?.title)}</div><div class="panel"><h3 class="card-title">Quick contact</h3><p class="panel-copy">Head Branch Shinzo Abe Axis, Cairo. Official quick contact: 15052 and hello@onyx-eg.com.</p><div class="action-row"><a class="platform-action platform-action--primary" href="tel:15052">Call 15052</a><a class="platform-action" href="mailto:hello@onyx-eg.com">Email</a><a class="platform-action" href="https://www.facebook.com/Onyxegy" target="_blank" rel="noreferrer">Facebook</a><a class="platform-action" href="https://www.instagram.com/onyx.auto" target="_blank" rel="noreferrer">Instagram</a></div></div></div></section>`;
        bindLeadForms(root);
    }

    function leadForm(title, selectedVehicleTitle = '') {
        return `<form class="lead-form"><p class="micro-label">Onyx request</p><h3 class="card-title">${escapeHtml(title)}</h3><div class="form-grid"><div class="form-field"><label>Name</label><input class="command-input" name="name" required placeholder="Customer name"></div><div class="form-field"><label>Phone</label><input class="command-input" name="phone" required placeholder="01XXXXXXXXX"></div><div class="form-field"><label>Interest</label><select class="command-select" name="interest">${['New car', 'Used car', 'Trade in', 'Installment', 'Direct installment', 'Service', 'Branch visit'].map((item) => `<option>${escapeHtml(item)}</option>`).join('')}</select></div><div class="form-field"><label>Vehicle</label><select class="command-select" name="vehicle"><option ${selectedVehicleTitle ? '' : 'selected'}>Not sure yet</option>${cars.slice(0, 40).map((car) => `<option ${selectedVehicleTitle === car.title ? 'selected' : ''}>${escapeHtml(car.title)}</option>`).join('')}</select></div><div class="form-field form-field--full"><label>Message</label><textarea class="command-textarea" name="message" placeholder="Tell Onyx what you need"></textarea></div></div><button class="form-button" type="submit">Prepare request</button><p class="form-hint form-status">This demo prepares a structured request on the page.</p></form>`;
    }

    function bindLeadForms(root) {
        root.querySelectorAll('.lead-form').forEach((form) => {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                const data = new FormData(form);
                const status = form.querySelector('.form-status');
                status.textContent = `Prepared request for ${data.get('name') || 'customer'} about ${data.get('interest')}. Call 15052 to submit it to Onyx.`;
                refreshI18n();
            });
        });
    }

    function renderFooter() {
        if (document.querySelector('.page-footer')) return;
        const footer = document.createElement('footer');
        footer.className = 'page-footer';
        footer.innerHTML = `<div class="page-footer__inner panel"><div><div class="footer-title">Onyx</div><p class="panel-copy">A complete static dealership platform powered by Onyx scraped inventory, official company content, and practical buying tools.</p></div><div class="footer-links">${navItems.slice(1).map(([, href, label]) => `<a class="platform-link" href="${href}">${label}</a>`).join('')}</div></div>`;
        document.body.appendChild(footer);
    }

    function findCar(slug) {
        return cars.find((car) => car.slug === slug);
    }

    function getCompareSlugs() {
        try {
            return JSON.parse(localStorage.getItem('agcCompareSlugs') || '[]');
        } catch {
            return [];
        }
    }

    function saveCompareSlugs(slugs) {
        localStorage.setItem('agcCompareSlugs', JSON.stringify(slugs));
    }

    function initCinematicChrome(page) {
        if (!document.querySelector('.platform-loader')) {
            const loader = document.createElement('div');
            loader.className = 'platform-loader';
            loader.innerHTML = `<div><span>Onyx</span><strong>${escapeHtml(page)}</strong></div><i></i>`;
            document.body.prepend(loader);
        }

        if (!document.querySelector('.platform-cursor')) {
            const cursor = document.createElement('div');
            cursor.className = 'platform-cursor';
            cursor.innerHTML = '<span></span>';
            document.body.append(cursor);

            let cursorX = innerWidth / 2;
            let cursorY = innerHeight / 2;
            let targetX = cursorX;
            let targetY = cursorY;
            addEventListener('pointermove', (event) => {
                targetX = event.clientX;
                targetY = event.clientY;
                cursor.classList.add('is-visible');
            });

            const follow = () => {
                cursorX += (targetX - cursorX) * 0.18;
                cursorY += (targetY - cursorY) * 0.18;
                cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
                requestAnimationFrame(follow);
            };
            follow();

            document.addEventListener('mouseover', (event) => {
                const target = event.target.closest('a, button, .vehicle-card, .story-card, .branch-card, .service-card, .data-card, .platform-hero__visual');
                if (!target) return;
                cursor.classList.add('is-active');
                cursor.querySelector('span').textContent = target.matches('a, button') ? 'Open' : 'View';
            });

            document.addEventListener('mouseout', (event) => {
                const target = event.target.closest('a, button, .vehicle-card, .story-card, .branch-card, .service-card, .data-card, .platform-hero__visual');
                if (!target) return;
                cursor.classList.remove('is-active');
                cursor.querySelector('span').textContent = '';
            });
        }

        if (!document.querySelector('.platform-progress')) {
            const progress = document.createElement('div');
            progress.className = 'platform-progress';
            progress.innerHTML = '<span></span>';
            document.body.append(progress);
            const bar = progress.querySelector('span');
            const update = () => {
                const max = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
                bar.style.transform = `scaleX(${Math.min(scrollY / max, 1)})`;
            };
            update();
            addEventListener('scroll', update, { passive: true });
        }
    }

    function initInteractiveDepth() {
        const selector = '.vehicle-card, .story-card, .branch-card, .service-card, .data-card, .command-panel, .form-panel, .platform-hero__visual';
        document.addEventListener('pointermove', (event) => {
            const card = event.target.closest(selector);
            if (!card || matchMedia('(pointer: coarse)').matches) return;
            const rect = card.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
            const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
            card.style.setProperty('--tilt-x', `${(-y * 4).toFixed(2)}deg`);
            card.style.setProperty('--tilt-y', `${(x * 5).toFixed(2)}deg`);
            card.style.setProperty('--spot-x', `${((x + 1) * 50).toFixed(1)}%`);
            card.style.setProperty('--spot-y', `${((y + 1) * 50).toFixed(1)}%`);
            card.classList.add('is-tilting');
        });

        document.addEventListener('pointerout', (event) => {
            const card = event.target.closest(selector);
            if (!card) return;
            card.classList.remove('is-tilting');
            card.style.removeProperty('--tilt-x');
            card.style.removeProperty('--tilt-y');
        });
    }

    function initMotion() {
        const loader = document.querySelector('.platform-loader');
        if (loader) {
            const finish = () => loader.classList.add('is-done');
            if (window.gsap) {
                gsap.to('.platform-loader i', { scaleX: 1, duration: 0.65, ease: 'power4.inOut', onComplete: finish });
            } else {
                setTimeout(finish, 420);
            }
        }

        if (window.Lenis) {
            const lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 0.9 });
            const raf = (time) => {
                lenis.raf(time);
                requestAnimationFrame(raf);
            };
            requestAnimationFrame(raf);
        }
        if (window.gsap) {
            gsap.to('.reveal-up', { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out' });
        } else {
            document.querySelectorAll('.reveal-up').forEach((item) => {
                item.style.opacity = 1;
                item.style.transform = 'none';
            });
        }
    }

    function initHeroCanvas() {
        const canvas = document.querySelector('.platform-hero__canvas');
        if (!canvas || !window.THREE) return;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
        camera.position.set(0, 0, 6);
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
        renderer.setClearColor(0x07111f, 0.34);
        const geometry = new THREE.BufferGeometry();
        const count = 520;
        const positions = new Float32Array(count * 3);
        for (let index = 0; index < count; index += 1) {
            positions[index * 3] = (Math.random() - 0.5) * 12;
            positions[index * 3 + 1] = (Math.random() - 0.5) * 6;
            positions[index * 3 + 2] = (Math.random() - 0.5) * 7;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({ size: 0.09, color: 0x9fc8ff, transparent: true, opacity: 0.86 });
        const points = new THREE.Points(geometry, material);
        scene.add(points);
        const ringGeometry = new THREE.TorusGeometry(2.8, 0.01, 8, 128);
        const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x79f2d5, transparent: true, opacity: 0.18 });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2.8;
        scene.add(ring);
        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
            renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1), false);
            camera.aspect = Math.max(rect.width, 1) / Math.max(rect.height, 1);
            camera.updateProjectionMatrix();
        };
        resize();
        addEventListener('resize', resize);
        const tick = () => {
            points.rotation.y += 0.0015;
            points.rotation.x += 0.0006;
            ring.rotation.z -= 0.001;
            renderer.render(scene, camera);
            requestAnimationFrame(tick);
        };
        tick();
    }
})();
