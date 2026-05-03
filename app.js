(() => {
    const inventorySource = Array.isArray(window.OnyxInventory) ? window.OnyxInventory : [];
    const validInventory = inventorySource.filter((car) => car && car.title && car.heroImage && car.details);

    if (!validInventory.length) {
        return;
    }

    if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const supportsFinePointer = window.matchMedia('(pointer: fine)').matches;
    const priceFormatter = new Intl.NumberFormat('en-US');
    const uiState = {
        soundOn: false,
        audioContext: null,
        audioNodes: null
    };

    const dedupe = (items) => [...new Set(items.filter(Boolean))];
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const lerp = (start, end, alpha) => start + (end - start) * alpha;
    const wrapAngle = (angle) => Math.atan2(Math.sin(angle), Math.cos(angle));
    const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const frameListeners = new Set();
    let frameClockStarted = false;

    const addFrameListener = (listener) => {
        frameListeners.add(listener);
        return () => frameListeners.delete(listener);
    };

    const broadcastFrame = (time) => {
        frameListeners.forEach((listener) => listener(time));
    };

    const startFrameClock = () => {
        if (frameClockStarted) {
            return;
        }

        frameClockStarted = true;
        let rafFrames = 0;
        let fallbackStarted = false;

        const startFallback = () => {
            if (fallbackStarted) {
                return;
            }

            fallbackStarted = true;
            const fallbackId = window.setInterval(() => {
                if (rafFrames > 0) {
                    window.clearInterval(fallbackId);
                    return;
                }
                const time = performance.now() / 1000;
                if (window.gsap && typeof window.gsap.updateRoot === 'function') {
                    window.gsap.updateRoot(time);
                }
                broadcastFrame(time);
            }, 16);
        };

        if (typeof window.requestAnimationFrame === 'function') {
            const tick = (now) => {
                rafFrames += 1;
                broadcastFrame(now / 1000);
                window.requestAnimationFrame(tick);
            };

            window.requestAnimationFrame(tick);
            window.setTimeout(() => {
                if (rafFrames === 0) {
                    startFallback();
                }
            }, 320);
        } else {
            startFallback();
        }
    };

    startFrameClock();

    const formatEGP = (value) => `${priceFormatter.format(Math.round(value))} EGP`;
    const formatPriceLabel = (car) => {
        if (car.price?.display) {
            return car.price.display;
        }

        if (car.priceLabel) {
            return car.priceLabel;
        }

        return 'Contact Onyx';
    };

    const extractValue = (source, label, nextLabels) => {
        if (!source) {
            return '';
        }

        const trailing = nextLabels.length
            ? `(?=${nextLabels.map((item) => escapeRegExp(item)).join('|')})`
            : '$';
        const pattern = new RegExp(`${escapeRegExp(label)}\\s*([\\s\\S]*?)\\s*${trailing}`, 'i');
        const match = source.match(pattern);
        return match ? match[1].replace(/\s+/g, ' ').trim() : '';
    };

    const parseSpecs = (details) => {
        const source = (details || '').replace(/\s+/g, ' ').trim();
        const seats = Number(source.match(/(\d+)\s*Seat/i)?.[1] || 0);
        const power = Number(source.match(/(\d+)\s*Horse Power/i)?.[1] || 0);
        const engineRaw = extractValue(source, 'Engine capacity', ['Horse Power']);
        const length = Number(source.match(/Length \(mm\)\s*(\d+)/i)?.[1] || 0);
        const width = Number(source.match(/Width \(mm\)\s*(\d+)/i)?.[1] || 0);
        const height = Number(source.match(/Height \(mm\)\s*(\d+)/i)?.[1] || 0);
        const wheelBase = Number(source.match(/Wheel Base\s*(\d+)/i)?.[1] || 0);

        return {
            warranty: extractValue(source, 'Warranty -', ['Engine capacity']),
            engine: engineRaw.replace(new RegExp(`\\b${power}\\b$`), '').replace(/\s+/g, ' ').trim(),
            power,
            speeds: (source.match(/Speeds\s+([\s\S]*?)\s+\d+\s*Seat/i)?.[1] || '').replace(/\s+/g, ' ').trim(),
            seats,
            transmission: extractValue(source, 'Transmission Type', ['Fuel']),
            fuel: extractValue(source, 'Fuel', ['Full AC', 'AC', 'Length (mm)']),
            ac: extractValue(source, 'Full AC', ['Length (mm)']) || extractValue(source, 'AC', ['Length (mm)']),
            length,
            width,
            height,
            wheelBase
        };
    };

    const inferCategory = (car, specs) => {
        const title = car.title.toLowerCase();
        if (/navara|super carry|van/.test(title)) {
            return 'Commercial';
        }

        if (/land cruiser|jimny|bj30|t1|t2/.test(title)) {
            return '4x4';
        }

        if (/x-trail|qashqai|duster|kardian|vitara|fronx|cool ray|starray|tiggo|x55|x7|h6|cs35|cs55|uni-t|js2|js4|hs|austral|c4x|dashing|x70|x90/.test(title)) {
            return 'SUV';
        }

        if (/swift|baleno/.test(title)) {
            return 'Hatchback';
        }

        if (specs.seats >= 7 || specs.height >= 1650) {
            return 'SUV';
        }

        return 'Sedan';
    };

    const summarizeCar = (car, specs) => {
        const pieces = [];
        if (specs.power) {
            pieces.push(`${specs.power} HP`);
        }
        if (specs.engine) {
            pieces.push(specs.engine);
        }
        if (specs.transmission) {
            pieces.push(specs.transmission);
        }
        if (specs.seats) {
            pieces.push(`${specs.seats}-seat architecture`);
        }

        const base = pieces.length ? pieces.join(', ') : car.brand;
        return `${car.title} is one of the strongest live Onyx selections right now, pairing ${base} with a catalog-backed configuration pulled directly from the current dealership inventory.`;
    };

    const inventory = validInventory.map((car) => {
        const gallery = dedupe([...(car.gallery || []), car.heroImage]);
        const specs = parseSpecs(car.details);
        return {
            ...car,
            gallery,
            specs,
            category: inferCategory(car, specs),
            summary: summarizeCar(car, specs)
        };
    });

    const pricedCars = inventory.filter((car) => car.price?.min || car.price?.max);
    const brands = dedupe(inventory.map((car) => car.brand));
    const highestPower = Math.max(...inventory.map((car) => car.specs.power || 0));
    const priceMin = Math.min(...pricedCars.map((car) => car.price.min || car.price.max));
    const priceMax = Math.max(...pricedCars.map((car) => car.price.max || car.price.min));
    const premiumCars = [...inventory].sort((left, right) => (right.price?.max || 0) - (left.price?.max || 0));
    const heroCar = premiumCars.find((car) => car.slug === 'jetour-t2') || premiumCars[0] || inventory[0];
    const fleetCars = premiumCars.filter((car) => car.gallery.length >= 2).slice(0, 12);
    const conciergeCars = premiumCars.filter((car) => car.price?.max).slice(0, 5);
    const showroomCars = premiumCars.slice(0, 6);
    const financeCars = pricedCars.slice(0, 8);

    renderHero();
    renderFleet();
    renderConcierge();
    renderShowroom();
    renderFinance();
    renderLegacy();
    renderFooter();

    const lenis = initLenis();
    const cursorController = supportsFinePointer ? initCursor() : null;
    initSoundToggle();
    initHeroScene(heroCar);
    initHeroReveal();
    initFleetCarousel();
    initConcierge();
    initShowroom();
    initFinance();
    initLegacy();
    initSectionReveals();
    initShutter();

    if (cursorController) {
        cursorController.refresh();
    }

    window.ScrollTrigger?.refresh();
    loadI18n();

    // Re-render hero copy whose dynamic numbers can't fit i18n's exact map
    window.addEventListener('onyx:languagechange', () => {
        renderHero();
        window.OnyxI18n?.refresh?.();
    });
    // Initial-load case: if i18n resolves to Arabic from URL/localStorage, re-render hero
    let __heroLangAttempts = 0;
    const __heroLangPoll = setInterval(() => {
        const lang = window.OnyxI18n?.language || document.documentElement.lang || 'en';
        if (lang.startsWith('ar')) {
            renderHero();
            window.OnyxI18n?.refresh?.();
            clearInterval(__heroLangPoll);
        }
        if (++__heroLangAttempts > 30) clearInterval(__heroLangPoll);
    }, 150);

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

    function refreshI18n() {
        window.OnyxI18n?.refresh?.();
    }

    function createChip(content, className = 'detail-chip') {
        return `<span class="${className}">${content}</span>`;
    }

    function renderHero() {
        const heroDescription = document.getElementById('hero-description');
        const heroMetrics = document.getElementById('hero-metrics');
        const heroPhotoPrimary = document.getElementById('hero-photo-primary');
        const heroPhotoSecondary = document.getElementById('hero-photo-secondary');
        const heroOfferStrip = document.getElementById('hero-offer-strip');
        const heroRailImage = document.getElementById('hero-rail-image');
        const heroRailTitle = document.getElementById('hero-rail-title');
        const heroRailCopy = document.getElementById('hero-rail-copy');
        const heroRailChips = document.getElementById('hero-rail-chips');
        const heroRailLink = document.getElementById('hero-rail-link');

        const heroLangAr = (window.OnyxI18n?.language || document.documentElement.lang || 'en').startsWith('ar');
        heroDescription.textContent = heroLangAr
            ? `مركز قيادة حي لـ Onyx فيه ${inventory.length} عربية حقيقية و${brands.length} علامة معتمدة، بصور رسمية وأسعار محدثة وأدوات تمويل وكونسيرج بيوصلك بالعربية المناسبة وصفحات موديل مبنية من مخزون التوكيل.`
            : `A live Onyx command center with ${inventory.length} real vehicles, ${brands.length} authorized brands, official catalog photos, current price labels, finance tools, concierge matching, and model pages built from the dealership inventory.`;

        if (heroPhotoPrimary) {
            heroPhotoPrimary.src = heroCar.gallery[0] || heroCar.heroImage;
            heroPhotoPrimary.alt = '';
        }

        if (heroPhotoSecondary) {
            heroPhotoSecondary.src = heroCar.gallery[2] || heroCar.gallery[1] || heroCar.heroImage;
            heroPhotoSecondary.alt = '';
        }

        if (heroOfferStrip) {
            heroOfferStrip.innerHTML = pricedCars.slice(0, 3).map((car, index) => `
                <a class="hero-offer hover-target magnetic-target" href="model.html?car=${car.slug}" data-cursor-label="Open" data-cursor-size="102">
                    <span>0${index + 1}</span>
                    <strong>${car.title}</strong>
                    <small>${formatPriceLabel(car)}</small>
                </a>
            `).join('');
        }

        heroMetrics.innerHTML = [
            {
                label: heroLangAr ? 'المخزون المباشر' : 'Live Inventory',
                value: String(inventory.length).padStart(2, '0'),
                caption: heroLangAr
                    ? 'صفحات عربيات Onyx الحالية مأخوذة مباشرة من كتالوج التوكيل.'
                    : 'Current Onyx vehicle pages ingested directly from the dealership catalog.'
            },
            {
                label: heroLangAr ? 'شبكة العلامات' : 'Brand Network',
                value: String(brands.length).padStart(2, '0'),
                caption: heroLangAr
                    ? 'تحالفات شغالة تشمل جيتور ورينو وتويوتا وبايك وشانجان ونيسان وسوزوكي وأكتر.'
                    : 'Active alliances spanning Jetour, Renault, Toyota, BAIC, Changan, Nissan, Suzuki and more.'
            },
            {
                label: heroLangAr ? 'سقف القوة' : 'Power Ceiling',
                value: heroLangAr ? `${highestPower} حصان` : `${highestPower} HP`,
                caption: heroLangAr
                    ? `أسعار الكتالوج الحية حالياً تبدأ من ${formatEGP(priceMin)} وتوصل لـ ${formatEGP(priceMax)}.`
                    : `Live catalog pricing currently ranges from ${formatEGP(priceMin)} to ${formatEGP(priceMax)}.`
            }
        ].map((metric) => `
            <article class="metric-card glass reveal-item">
                <div class="metric-card__label">${metric.label}</div>
                <div class="metric-card__value">${metric.value}</div>
                <div class="metric-card__caption">${metric.caption}</div>
            </article>
        `).join('');

        heroRailImage.src = heroCar.gallery[1] || heroCar.heroImage;
        heroRailImage.alt = heroCar.title;
        heroRailTitle.textContent = heroCar.title;
        heroRailCopy.textContent = heroCar.summary;
        heroRailChips.innerHTML = [
            createChip(heroCar.brand, 'hero-rail__chip'),
            createChip(heroCar.category, 'hero-rail__chip'),
            createChip(formatPriceLabel(heroCar), 'hero-rail__chip'),
            createChip(`${heroCar.specs.power || '---'} HP`, 'hero-rail__chip'),
            createChip(heroCar.specs.transmission || 'Transmission on request', 'hero-rail__chip')
        ].join('');
        heroRailLink.href = heroCar.url;
    }

    function renderFleet() {
        const fleetStage = document.getElementById('fleet-stage');
        fleetStage.innerHTML = fleetCars.map((car, index) => `
            <article
                class="fleet-card hover-target cursor-target"
                data-index="${index}"
                data-cursor-label="Explore"
                data-cursor-size="118"
                data-primary-image="${car.gallery[0]}"
                data-secondary-image="${car.gallery[1] || car.gallery[0]}"
            >
                <div class="fleet-card__media">
                    <img src="${car.gallery[0]}" alt="${car.title}">
                    <div class="fleet-webgl-host"></div>
                </div>
                <div class="fleet-card__body">
                    <span class="fleet-card__brand">${car.brand} / ${car.category}</span>
                    <h3 class="fleet-card__title">${car.title}</h3>
                    <div class="fleet-card__meta">
                        <span>${formatPriceLabel(car)}</span>
                        <span>${car.specs.power || '---'} HP</span>
                    </div>
                </div>
            </article>
        `).join('');

        updateFleetDetail(0);
    }

    function updateFleetDetail(index) {
        const car = fleetCars[index];
        if (!car) {
            return;
        }

        document.getElementById('fleet-active-brand').textContent = `${car.brand} / ${car.category}`;
        document.getElementById('fleet-active-title').textContent = car.title;
        document.getElementById('fleet-active-price').textContent = formatPriceLabel(car);
        document.getElementById('fleet-active-copy').textContent = car.summary;
        document.getElementById('fleet-counter').textContent = `${String(index + 1).padStart(2, '0')} / ${String(fleetCars.length).padStart(2, '0')}`;
        document.getElementById('fleet-active-link').href = car.url;

        document.getElementById('fleet-active-chips').innerHTML = [
            createChip(car.brand),
            createChip(car.category),
            createChip(car.specs.transmission || 'Transmission on request'),
            createChip(car.specs.fuel || 'Fuel on request'),
            createChip(car.specs.warranty || 'Warranty on request')
        ].join('');

        document.getElementById('fleet-active-stats').innerHTML = [
            ['Engine', car.specs.engine || 'TBC'],
            ['Power', car.specs.power ? `${car.specs.power} HP` : 'TBC'],
            ['Seats', car.specs.seats ? `${car.specs.seats}` : 'TBC'],
            ['Length', car.specs.length ? `${priceFormatter.format(car.specs.length)} mm` : 'TBC'],
            ['Wheelbase', car.specs.wheelBase ? `${priceFormatter.format(car.specs.wheelBase)} mm` : 'TBC'],
            ['Fuel', car.specs.fuel || 'TBC']
        ].map(([label, value]) => `
            <div class="detail-stats__item">
                <span>${label}</span>
                <span class="detail-stats__value">${value}</span>
            </div>
        `).join('');

        document.getElementById('fleet-active-note').textContent = `Live Onyx imagery: ${car.gallery.length} real gallery frames available for ${car.title}. Drag the cylinder to shift through the wider inventory stream.`;
        refreshI18n();
    }

    function renderConcierge() {
        const chips = document.getElementById('concierge-chips');
        chips.innerHTML = conciergeCars.map((car, index) => `
            <button class="concierge-chip hover-target magnetic-target ${index === 0 ? 'is-active' : ''}" data-index="${index}" data-cursor-label="Focus" data-cursor-size="104">
                ${car.title}
            </button>
        `).join('');

        updateConcierge(0);
    }

    function updateConcierge(index) {
        const car = conciergeCars[index];
        if (!car) {
            return;
        }

        document.getElementById('concierge-image').src = car.gallery[1] || car.heroImage;
        document.getElementById('concierge-image').alt = car.title;
        document.getElementById('concierge-title').textContent = car.title;
        document.getElementById('concierge-copy').textContent = `Onyx Intelligence isolates ${car.title} as a high-confidence match for clients who want ${car.specs.transmission || 'advanced transmission'}, ${car.specs.power || 'strong'} horsepower, and a clean premium silhouette without losing day-to-day usability.`;
        document.getElementById('concierge-link').href = car.url;
        document.getElementById('concierge-specs').innerHTML = [
            createChip(formatPriceLabel(car)),
            createChip(`${car.specs.power || '---'} HP`),
            createChip(car.specs.transmission || 'Transmission TBC'),
            createChip(car.specs.fuel || 'Fuel TBC')
        ].join('');

        document.getElementById('concierge-thread').innerHTML = `
            <div class="chat-bubble chat-bubble--ai">Speak to the Onyx Intelligence to find your perfect drive. Right now the engine is prioritizing ${car.brand} performance data, live pricing and physical dimensions from the Onyx catalog.</div>
            <div class="chat-bubble chat-bubble--user">Need something with ${car.specs.power || 'strong'} horsepower, ${car.specs.seats || '5'} seats, and a presence that still feels future-facing.</div>
            <div class="chat-bubble chat-bubble--ai">${car.title} fits that brief. ${formatPriceLabel(car)}. ${car.specs.engine || 'Engine details on request'}. ${car.specs.warranty || 'Warranty details on request'}.</div>
        `;
        refreshI18n();
    }

    function initConcierge() {
        document.getElementById('concierge-chips').addEventListener('click', (event) => {
            const button = event.target.closest('.concierge-chip');
            if (!button) {
                return;
            }

            const buttons = [...document.querySelectorAll('.concierge-chip')];
            buttons.forEach((chip) => chip.classList.remove('is-active'));
            button.classList.add('is-active');
            updateConcierge(Number(button.dataset.index));
        });
    }

    function renderShowroom() {
        const selector = document.getElementById('showroom-selector');
        selector.innerHTML = showroomCars.map((car, index) => `
            <button class="showroom-pill hover-target magnetic-target ${index === 0 ? 'is-active' : ''}" data-index="${index}" data-cursor-label="Project" data-cursor-size="118">
                ${car.title}
            </button>
        `).join('');

        updateShowroom(0);
    }

    function updateShowroom(index) {
        const car = showroomCars[index];
        if (!car) {
            return;
        }

        const showroomImage = document.getElementById('showroom-image');
        showroomImage.src = car.gallery[2] || car.gallery[1] || car.heroImage;
        showroomImage.alt = car.title;
        document.getElementById('showroom-title').textContent = car.title;
        document.getElementById('showroom-copy').textContent = `Project ${car.title} into your driveway using an AR-ready spatial preview tuned around its ${car.specs.wheelBase || 'live'} mm wheelbase, ${car.specs.width || 'full-width'} mm stance and live Onyx exterior imagery.`;
        document.getElementById('showroom-link').href = car.url;
        document.getElementById('showroom-badge').textContent = `Project ${car.title} in AR`;
        document.getElementById('showroom-stats').innerHTML = [
            createChip(`${car.specs.length || '---'} mm length`, 'showroom-stat'),
            createChip(`${car.specs.width || '---'} mm width`, 'showroom-stat'),
            createChip(`${car.specs.wheelBase || '---'} mm wheelbase`, 'showroom-stat'),
            createChip(car.specs.transmission || 'Transmission TBC', 'showroom-stat')
        ].join('');
        refreshI18n();
    }

    function initShowroom() {
        document.getElementById('showroom-selector').addEventListener('click', (event) => {
            const button = event.target.closest('.showroom-pill');
            if (!button) {
                return;
            }

            [...document.querySelectorAll('.showroom-pill')].forEach((pill) => pill.classList.remove('is-active'));
            button.classList.add('is-active');
            updateShowroom(Number(button.dataset.index));
        });
    }

    function renderFinance() {
        const models = document.getElementById('finance-models');
        models.innerHTML = financeCars.map((car, index) => `
            <button class="model-pill hover-target magnetic-target ${index === 0 ? 'is-active' : ''}" data-index="${index}" data-cursor-label="Tune" data-cursor-size="104">
                ${car.title}
            </button>
        `).join('');
    }

    function initFinance() {
        const financeState = {
            selectedIndex: 0,
            downPayment: 35,
            months: 60,
            display: {
                monthly: 0,
                financed: 0,
                down: 0,
                total: 0
            }
        };

        const financeModels = document.getElementById('finance-models');
        const financeImage = document.getElementById('finance-image');
        const financeTitle = document.getElementById('finance-title');
        const financeSummary = document.getElementById('finance-summary');
        const financeFacts = document.getElementById('finance-facts');
        const financeLink = document.getElementById('finance-link');
        const monthlyOdometer = document.getElementById('finance-monthly');
        const downOdometer = document.getElementById('finance-down-total');
        const financedOdometer = document.getElementById('finance-financed-total');
        const dialElements = [...document.querySelectorAll('.dial')];

        const describeArc = (startAngle, endAngle) => {
            const polar = (angle) => {
                const radians = (angle - 90) * (Math.PI / 180);
                return {
                    x: 80 + 54 * Math.cos(radians),
                    y: 80 + 54 * Math.sin(radians)
                };
            };

            const start = polar(endAngle);
            const end = polar(startAngle);
            const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
            return `M ${start.x} ${start.y} A 54 54 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
        };

        const updateDial = (dial, value) => {
            const min = Number(dial.dataset.min);
            const max = Number(dial.dataset.max);
            const progress = clamp((value - min) / (max - min), 0, 1);
            const startAngle = -135;
            const endAngle = -135 + 270 * progress;
            const trackPath = dial.querySelector('.dial-track');
            const progressPath = dial.querySelector('.dial-progress');
            const knob = dial.querySelector('.dial-knob');
            const valueLabel = dial.querySelector('[data-role="value"]');
            const subLabel = dial.querySelector('[data-role="subvalue"]');
            const angle = endAngle;
            const radians = angle * (Math.PI / 180);
            const x = 80 + 54 * Math.cos((angle - 90) * Math.PI / 180);
            const y = 80 + 54 * Math.sin((angle - 90) * Math.PI / 180);

            trackPath.setAttribute('d', describeArc(-135, 135));
            progressPath.setAttribute('d', describeArc(-135, progress > 0 ? endAngle : -134.5));
            knob.style.left = `${x}px`;
            knob.style.top = `${y}px`;

            if (dial.dataset.type === 'downPayment') {
                valueLabel.textContent = `${Math.round(value)}%`;
                subLabel.textContent = `${formatEGP((financeCars[financeState.selectedIndex].price.max || financeCars[financeState.selectedIndex].price.min) * (value / 100))} upfront`;
            } else {
                valueLabel.textContent = `${Math.round(value)}`;
                subLabel.textContent = `${Math.round(value / 12)} year horizon`;
            }
        };

        const estimateFinance = () => {
            const selected = financeCars[financeState.selectedIndex];
            const sticker = selected.price.max || selected.price.min;
            const apr = clamp(13.4 - financeState.downPayment * 0.03 + financeState.months * 0.015, 9.8, 14.6);
            const down = sticker * (financeState.downPayment / 100);
            const financed = Math.max(sticker - down, 0);
            const monthlyRate = apr / 1200;
            const months = financeState.months;
            const monthly = monthlyRate > 0
                ? financed * monthlyRate * ((1 + monthlyRate) ** months) / (((1 + monthlyRate) ** months) - 1)
                : financed / months;
            const total = monthly * months;
            return { sticker, apr, down, financed, monthly, total };
        };

        const renderFinanceOutput = () => {
            const selected = financeCars[financeState.selectedIndex];
            const summary = estimateFinance();

            financeImage.src = selected.gallery[1] || selected.heroImage;
            financeImage.alt = selected.title;
            financeTitle.textContent = selected.title;
            financeSummary.textContent = `Dynamic finance projection for ${selected.title} using the current Onyx list price and a cinematic dial-driven EMI model. Adjust the deposit and horizon to tune the monthly output in real time.`;
            financeLink.href = selected.url;
            financeFacts.innerHTML = [
                createChip(formatPriceLabel(selected), 'finance-fact'),
                createChip(`${summary.apr.toFixed(1)}% APR`, 'finance-fact'),
                createChip(`${financeState.months} months`, 'finance-fact'),
                createChip(`${financeState.downPayment}% down`, 'finance-fact')
            ].join('');

            gsap.to(financeState.display, {
                monthly: summary.monthly,
                financed: summary.financed,
                down: summary.down,
                total: summary.total,
                duration: prefersReducedMotion ? 0 : 0.8,
                ease: 'power3.out',
                overwrite: true,
                onUpdate: () => {
                    monthlyOdometer.textContent = formatEGP(financeState.display.monthly);
                    downOdometer.textContent = formatEGP(financeState.display.down);
                    financedOdometer.textContent = formatEGP(financeState.display.financed);
                }
            });

            dialElements.forEach((dial) => {
                if (dial.dataset.type === 'downPayment') {
                    updateDial(dial, financeState.downPayment);
                }
                if (dial.dataset.type === 'months') {
                    updateDial(dial, financeState.months);
                }
            });
            refreshI18n();
        };

        const updateFromPointer = (dial, event) => {
            const rect = dial.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180 / Math.PI + 90;
            let normalized = angle;
            if (normalized < -180) {
                normalized += 360;
            }
            normalized = clamp(normalized, -135, 135);
            const progress = (normalized + 135) / 270;
            const min = Number(dial.dataset.min);
            const max = Number(dial.dataset.max);
            const step = Number(dial.dataset.step);
            const next = Math.round((min + (max - min) * progress) / step) * step;
            if (dial.dataset.type === 'downPayment') {
                financeState.downPayment = clamp(next, min, max);
            } else {
                financeState.months = clamp(next, min, max);
            }
            renderFinanceOutput();
        };

        dialElements.forEach((dial) => {
            let dragging = false;
            const handleMove = (event) => {
                if (!dragging) {
                    return;
                }
                updateFromPointer(dial, event);
            };
            const stopDrag = () => {
                dragging = false;
                window.removeEventListener('pointermove', handleMove);
                window.removeEventListener('pointerup', stopDrag);
            };
            dial.addEventListener('pointerdown', (event) => {
                dragging = true;
                updateFromPointer(dial, event);
                window.addEventListener('pointermove', handleMove);
                window.addEventListener('pointerup', stopDrag);
            });
        });

        financeModels.addEventListener('click', (event) => {
            const button = event.target.closest('.model-pill');
            if (!button) {
                return;
            }

            financeState.selectedIndex = Number(button.dataset.index);
            [...document.querySelectorAll('.model-pill')].forEach((pill) => pill.classList.remove('is-active'));
            button.classList.add('is-active');
            renderFinanceOutput();
        });

        renderFinanceOutput();
    }

    function renderLegacy() {
        const events = [
            {
                year: '1993',
                title: 'A Three-Car Beginning',
                copy: 'Onyx starts with a compact showroom in Al-Sharqia, built on highly personal client guidance and a belief that automotive retail in Egypt could feel more intelligent, more curated and more exacting.',
                meta: ['3 vehicles on floor', 'Zagazig roots', 'Client-first sales culture']
            },
            {
                year: '2005',
                title: 'Regional Scale Ignites',
                copy: 'The business expands beyond boutique retail into a regional dealership force, increasing brand partnerships, service depth and annual throughput across the Delta market.',
                meta: ['New branches', 'Broader alliances', 'Retail operations scaling']
            },
            {
                year: '2015',
                title: 'Luxury Through Trust',
                copy: 'Onyx becomes a trusted destination for premium sedans, family SUVs and executive fleets, pairing inventory breadth with a more design-led, experience-led view of what a dealership can be.',
                meta: ['Fleet growth', 'Experience-led sales', 'Trust compounding']
            },
            {
                year: '2026',
                title: 'The Catalog Becomes Spatial',
                copy: `Today Onyx carries ${inventory.length} live models across ${brands.length} brands. The showroom no longer stops at the branch. It extends into cinematic digital space, immersive finance and AR projection.` ,
                meta: [`${inventory.length} live model pages`, `${brands.length} active brands`, 'WebXR-ready presentation']
            }
        ];

        document.getElementById('legacy-right').innerHTML = events.map((event) => `
            <article class="legacy-event glass reveal-item" data-year="${event.year}" data-title="${event.title}" data-copy="${event.copy}">
                <div class="legacy-event__year">${event.year}</div>
                <h3 class="legacy-event__title">${event.title}</h3>
                <p class="legacy-event__copy">${event.copy}</p>
                <div class="detail-chips">${event.meta.map((item) => createChip(item)).join('')}</div>
            </article>
        `).join('');

        document.getElementById('legacy-active-year').textContent = events[0].year;
        document.getElementById('legacy-active-title').textContent = events[0].title;
        document.getElementById('legacy-active-copy').textContent = events[0].copy;
        document.getElementById('legacy-active-meta').innerHTML = events[0].meta.map((item) => createChip(item)).join('');
    }

    function initLegacy() {
        const events = [...document.querySelectorAll('.legacy-event')];
        const activeYear = document.getElementById('legacy-active-year');
        const activeTitle = document.getElementById('legacy-active-title');
        const activeCopy = document.getElementById('legacy-active-copy');
        const activeMeta = document.getElementById('legacy-active-meta');
        const shell = document.querySelector('.legacy-shell');
        const left = document.querySelector('.legacy-left');
        let currentYear = activeYear.textContent;

        if (!events.length || !window.ScrollTrigger) {
            syncLegacyFromScroll();
            return;
        }

        ScrollTrigger.create({
            trigger: shell,
            start: 'top top+=120',
            end: () => `bottom bottom-=${Math.max(left.offsetHeight - window.innerHeight * 0.3, 0)}`,
            pin: left,
            pinSpacing: false,
            invalidateOnRefresh: true
        });

        events.forEach((event) => {
            const chips = [...event.querySelectorAll('.detail-chip')].map((chip) => chip.outerHTML).join('');
            ScrollTrigger.create({
                trigger: event,
                start: 'top center',
                end: 'bottom center',
                onEnter: () => setLegacyActive(event.dataset.year, event.dataset.title, event.dataset.copy, chips),
                onEnterBack: () => setLegacyActive(event.dataset.year, event.dataset.title, event.dataset.copy, chips)
            });

            gsap.from(event, {
                scrollTrigger: {
                    trigger: event,
                    start: 'top 85%'
                },
                y: 60,
                opacity: 0,
                duration: 1,
                ease: 'power3.out'
            });
        });

        window.addEventListener('scroll', syncLegacyFromScroll, { passive: true });
        window.addEventListener('resize', syncLegacyFromScroll);
        syncLegacyFromScroll();

        function setLegacyActive(year, title, copy, chipsMarkup) {
            if (currentYear === year) {
                return;
            }
            currentYear = year;
            activeYear.textContent = year;
            activeTitle.textContent = title;
            activeCopy.textContent = copy;
            activeMeta.innerHTML = chipsMarkup;
            gsap.fromTo(activeYear, { opacity: 0.28, y: 18 }, { opacity: 1, y: 0, duration: 0.5, overwrite: true, ease: 'power2.out' });
            gsap.fromTo(activeTitle, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.5, overwrite: true, ease: 'power2.out' });
            gsap.fromTo(activeCopy, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, overwrite: true, ease: 'power2.out' });
        }

        function syncLegacyFromScroll() {
            const focusY = window.innerHeight * 0.42;
            let candidate = null;
            let smallestDistance = Number.POSITIVE_INFINITY;

            events.forEach((event) => {
                const rect = event.getBoundingClientRect();
                const center = rect.top + rect.height / 2;
                const distance = Math.abs(center - focusY);
                if (distance < smallestDistance) {
                    smallestDistance = distance;
                    candidate = event;
                }
            });

            if (!candidate) {
                return;
            }

            const chipsMarkup = [...candidate.querySelectorAll('.detail-chip')].map((chip) => chip.outerHTML).join('');
            setLegacyActive(candidate.dataset.year, candidate.dataset.title, candidate.dataset.copy, chipsMarkup);
        }
    }

    function renderFooter() {
        document.getElementById('footer-brands').innerHTML = brands.map((brand) => createChip(brand, 'footer-brand')).join('');
        document.getElementById('footer-copy').textContent = `Onyx merges ${inventory.length} live vehicle entries, ${brands.length} brand alliances and a premium dealership legacy that started in 1993 and now reaches Cairo, Al-Sharqia and the wider Delta region.`;
    }

    function initLenis() {
        if (!window.Lenis || prefersReducedMotion) {
            return null;
        }

        const lenis = new Lenis({
            lerp: 0.085,
            smoothWheel: true,
            wheelMultiplier: 0.82,
            touchMultiplier: 1.1
        });

        lenis.on('scroll', () => window.ScrollTrigger?.update());
        addFrameListener((time) => lenis.raf(time * 1000));

        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', (event) => {
                const href = anchor.getAttribute('href');
                if (!href || href === '#') {
                    return;
                }
                const target = document.querySelector(href);
                if (!target) {
                    return;
                }
                event.preventDefault();
                lenis.scrollTo(target, {
                    duration: 1.35,
                    easing: (value) => 1 - Math.pow(1 - value, 4)
                });
            });
        });

        return lenis;
    }

    function initCursor() {
        const cursor = document.querySelector('.cursor-orb');
        const cursorRing = cursor.querySelector('.cursor-ring');
        const cursorCore = cursor.querySelector('.cursor-core');
        const cursorLabel = cursor.querySelector('.cursor-label');
        const state = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            targetX: window.innerWidth / 2,
            targetY: window.innerHeight / 2,
            visible: false
        };

        gsap.set(cursor, { xPercent: -50, yPercent: -50, opacity: 0, width: 30, height: 30 });

        const setMode = ({ label = '', size = 72 } = {}) => {
            cursor.classList.toggle('is-labelled', Boolean(label));
            cursorLabel.textContent = label;
            gsap.to(cursor, { width: size, height: size, duration: 0.32, ease: 'power3.out', overwrite: true });
            gsap.to(cursorRing, {
                backgroundColor: label ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.05)',
                borderColor: label ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.42)',
                duration: 0.28,
                ease: 'power2.out',
                overwrite: true
            });
            gsap.to(cursorCore, { scale: label ? 0.3 : 1, opacity: label ? 0 : 1, duration: 0.24, overwrite: true });
        };

        const resetMode = () => setMode({ label: '', size: 30 });

        window.addEventListener('mousemove', (event) => {
            state.targetX = event.clientX;
            state.targetY = event.clientY;
            if (!state.visible) {
                state.visible = true;
                state.x = event.clientX;
                state.y = event.clientY;
                gsap.to(cursor, { opacity: 1, duration: 0.24, overwrite: true });
            }
        });

        document.addEventListener('mouseleave', () => gsap.to(cursor, { opacity: 0, duration: 0.2, overwrite: true }));
        document.addEventListener('mouseenter', () => state.visible && gsap.to(cursor, { opacity: 1, duration: 0.2, overwrite: true }));

        addFrameListener(() => {
            state.x = lerp(state.x, state.targetX, 0.18);
            state.y = lerp(state.y, state.targetY, 0.18);
            gsap.set(cursor, { x: state.x, y: state.y });
        });

        const bindTargets = () => {
            document.querySelectorAll('a, button, .hover-target, .cursor-target').forEach((target) => {
                if (target.dataset.cursorBound === 'true') {
                    return;
                }
                target.dataset.cursorBound = 'true';
                const label = target.dataset.cursorLabel || '';
                const size = Number(target.dataset.cursorSize || (label ? 112 : 72));
                const magnetic = target.classList.contains('magnetic-target');

                target.addEventListener('mouseenter', () => setMode({ label, size }));
                target.addEventListener('mouseleave', () => {
                    if (magnetic) {
                        gsap.to(target, {
                            x: 0,
                            y: 0,
                            duration: 0.7,
                            ease: 'elastic.out(1, 0.45)',
                            overwrite: true
                        });
                    }
                    resetMode();
                });
                target.addEventListener('mousemove', (event) => {
                    if (!magnetic) {
                        return;
                    }
                    const rect = target.getBoundingClientRect();
                    const dx = event.clientX - (rect.left + rect.width / 2);
                    const dy = event.clientY - (rect.top + rect.height / 2);
                    gsap.to(target, {
                        x: dx * 0.14,
                        y: dy * 0.14,
                        duration: 0.42,
                        ease: 'power3.out',
                        overwrite: true
                    });
                    state.targetX = rect.left + rect.width / 2 + dx * 0.16;
                    state.targetY = rect.top + rect.height / 2 + dy * 0.16;
                });
            });
        };

        window.addEventListener('mousedown', () => gsap.to(cursor, { scale: 0.86, duration: 0.14, overwrite: true }));
        window.addEventListener('mouseup', () => gsap.to(cursor, { scale: 1, duration: 0.22, overwrite: true }));

        bindTargets();

        return {
            refresh: bindTargets
        };
    }

    function initSoundToggle() {
        const soundToggle = document.getElementById('sound-toggle');
        soundToggle.addEventListener('click', async () => {
            uiState.soundOn = !uiState.soundOn;
            soundToggle.classList.toggle('is-on', uiState.soundOn);
            soundToggle.setAttribute('aria-pressed', String(uiState.soundOn));
            document.getElementById('sound-state').textContent = uiState.soundOn ? 'Sound On' : 'Sound Off';

            if (!uiState.soundOn) {
                if (uiState.audioContext && uiState.audioNodes) {
                    uiState.audioNodes.master.gain.cancelScheduledValues(uiState.audioContext.currentTime);
                    uiState.audioNodes.master.gain.linearRampToValueAtTime(0, uiState.audioContext.currentTime + 0.25);
                }
                return;
            }

            if (!uiState.audioContext) {
                const context = new (window.AudioContext || window.webkitAudioContext)();
                const master = context.createGain();
                master.gain.value = 0;
                master.connect(context.destination);

                const low = context.createOscillator();
                low.type = 'sine';
                low.frequency.value = 54;
                const lowGain = context.createGain();
                lowGain.gain.value = 0.02;
                low.connect(lowGain).connect(master);
                low.start();

                const high = context.createOscillator();
                high.type = 'triangle';
                high.frequency.value = 108;
                const highGain = context.createGain();
                highGain.gain.value = 0.008;
                high.connect(highGain).connect(master);
                high.start();

                uiState.audioContext = context;
                uiState.audioNodes = { master };
            }

            if (uiState.audioContext.state === 'suspended') {
                await uiState.audioContext.resume();
            }

            uiState.audioNodes.master.gain.cancelScheduledValues(uiState.audioContext.currentTime);
            uiState.audioNodes.master.gain.linearRampToValueAtTime(0.055, uiState.audioContext.currentTime + 0.35);
        });
    }

    function initHeroScene(car) {
        if (!window.THREE) {
            return;
        }

        const canvas = document.getElementById('hero-canvas');
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
        camera.position.set(0, 0.25, 8.6);

        const group = new THREE.Group();
        scene.add(group);

        const basePositions = [];
        const animatedPositions = [];
        const colors = [];
        const seeds = [];
        const outline = [
            [-2.9, -0.15],
            [-2.55, 0.32],
            [-1.85, 0.78],
            [-1.08, 1.02],
            [-0.45, 1.14],
            [0.35, 1.12],
            [1.25, 0.98],
            [2.02, 0.64],
            [2.55, 0.26],
            [2.92, -0.08],
            [2.54, -0.14],
            [1.65, -0.15],
            [1.24, -0.6],
            [0.68, -0.62],
            [0.32, -0.16],
            [-0.98, -0.15],
            [-1.35, -0.66],
            [-1.92, -0.65],
            [-2.22, -0.16],
            [-2.9, -0.15]
        ];

        for (let index = 0; index < outline.length - 1; index += 1) {
            const [x1, y1] = outline[index];
            const [x2, y2] = outline[index + 1];
            const steps = index < 9 ? 34 : 24;
            for (let step = 0; step <= steps; step += 1) {
                const t = step / steps;
                for (let depth = 0; depth < 7; depth += 1) {
                    const x = lerp(x1, x2, t) + (Math.random() - 0.5) * 0.03;
                    const y = lerp(y1, y2, t) + (Math.random() - 0.5) * 0.03;
                    const z = (Math.random() - 0.5) * 0.32;
                    basePositions.push(x, y, z);
                    animatedPositions.push(x, y, z);
                    colors.push(0.65 + Math.random() * 0.25, 0.78 + Math.random() * 0.12, 1);
                    seeds.push(Math.random() * 10);
                }
            }
        }

        for (let index = 0; index < 1600; index += 1) {
            const x = (Math.random() - 0.5) * 12;
            const y = (Math.random() - 0.4) * 5;
            const z = (Math.random() - 0.5) * 7 - 1.5;
            basePositions.push(x, y, z);
            animatedPositions.push(x, y, z);
            colors.push(0.22, 0.3 + Math.random() * 0.18, 0.42 + Math.random() * 0.2);
            seeds.push(Math.random() * 8 + 8);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(animatedPositions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        const material = new THREE.PointsMaterial({
            size: 0.035,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const points = new THREE.Points(geometry, material);
        group.add(points);

        const lineCurve = new THREE.CatmullRomCurve3(outline.map(([x, y]) => new THREE.Vector3(x, y, 0)));
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(lineCurve.getPoints(200));
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x9fd1ff, transparent: true, opacity: 0.22 });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        group.add(line);

        const floor = new THREE.GridHelper(18, 18, 0x20304a, 0x102036);
        floor.position.y = -2.1;
        floor.material.opacity = 0.18;
        floor.material.transparent = true;
        scene.add(floor);

        const glowGeometry = new THREE.TorusGeometry(3.5, 0.05, 12, 120);
        const glowMaterial = new THREE.MeshBasicMaterial({ color: 0x6ef6dc, transparent: true, opacity: 0.07 });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.rotation.x = Math.PI / 2;
        glow.position.z = -1.2;
        glow.position.y = -0.3;
        scene.add(glow);

        const ambientLight = new THREE.PointLight(0x9fd1ff, 1.2, 18);
        ambientLight.position.set(0, 2.2, 4.2);
        scene.add(ambientLight);

        const rimLight = new THREE.PointLight(0x6ef6dc, 0.8, 16);
        rimLight.position.set(-3.8, 0.8, 2.4);
        scene.add(rimLight);

        const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
        window.addEventListener('pointermove', (event) => {
            const rect = canvas.getBoundingClientRect();
            pointer.targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
            pointer.targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        });

        const resize = () => {
            const hero = document.getElementById('hero');
            const width = hero.clientWidth;
            const height = hero.clientHeight;
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };

        resize();
        window.addEventListener('resize', resize);

        addFrameListener((time) => {
            pointer.x = lerp(pointer.x, pointer.targetX, 0.08);
            pointer.y = lerp(pointer.y, pointer.targetY, 0.08);

            const positions = geometry.attributes.position.array;
            const t = time * 0.45;
            for (let index = 0; index < positions.length; index += 3) {
                const baseX = basePositions[index];
                const baseY = basePositions[index + 1];
                const baseZ = basePositions[index + 2];
                const seed = seeds[index / 3];
                positions[index] = baseX + Math.sin(t + seed) * 0.025 + pointer.x * (Math.abs(baseY) < 1.4 ? 0.16 : 0.05);
                positions[index + 1] = baseY + Math.cos(t * 1.3 + seed) * 0.018 - pointer.y * (Math.abs(baseX) < 3 ? 0.12 : 0.04);
                positions[index + 2] = baseZ + Math.sin(t * 1.6 + seed * 0.6) * 0.04;
            }
            geometry.attributes.position.needsUpdate = true;

            group.rotation.y = lerp(group.rotation.y, pointer.x * 0.18, 0.06);
            group.rotation.x = lerp(group.rotation.x, -pointer.y * 0.09, 0.06);
            group.position.x = lerp(group.position.x, pointer.x * 0.24, 0.05);
            group.position.y = lerp(group.position.y, -pointer.y * 0.16, 0.05);
            line.material.opacity = 0.18 + (pointer.x * pointer.x + pointer.y * pointer.y) * 0.04;
            glow.rotation.z += 0.0018;
            renderer.render(scene, camera);
        });

        const heroRailImage = document.getElementById('hero-rail-image');
        heroRailImage.src = car.gallery[1] || car.heroImage;
    }

    function initHeroReveal() {
        const scrambleNodes = [...document.querySelectorAll('.js-scramble')];
        const glyphs = 'Onyx01/XYZ<>[]{}*#_+'.split('');

        scrambleNodes.forEach((node, index) => {
            const finalText = node.dataset.final || node.textContent.trim();
            node.textContent = finalText;
            gsap.fromTo(node.parentElement, {
                yPercent: 120,
                opacity: 0
            }, {
                yPercent: 0,
                opacity: 1,
                duration: prefersReducedMotion ? 0 : 1.1,
                delay: 0.8 + index * 0.12,
                ease: 'power4.out'
            });
            gsap.fromTo({ progress: 0 }, { progress: 0 }, {
                progress: 1,
                duration: prefersReducedMotion ? 0 : 1.6,
                delay: 0.86 + index * 0.12,
                ease: 'power3.out',
                onUpdate() {
                    const progress = this.targets()[0].progress;
                    const revealed = Math.floor(progress * finalText.length);
                    const output = finalText.split('').map((character, charIndex) => {
                        if (character === ' ') {
                            return ' ';
                        }
                        return charIndex < revealed ? finalText[charIndex] : glyphs[Math.floor(Math.random() * glyphs.length)];
                    }).join('');
                    node.textContent = output;
                },
                onComplete() {
                    node.textContent = finalText;
                }
            });
        });

        gsap.from('.hero-description, .hero-actions, .hero-meta, .hero-rail', {
            y: 40,
            opacity: 0,
            duration: 1.1,
            stagger: 0.08,
            delay: 1.1,
            ease: 'power3.out'
        });
    }

    function initFleetCarousel() {
        const carousel = document.getElementById('fleet-carousel');
        const stage = document.getElementById('fleet-stage');
        const cards = [...document.querySelectorAll('.fleet-card')];
        const body = document.body;
        const displacement = createFleetDisplacement();
        const state = {
            rotation: 0.1,
            targetRotation: 0.1,
            velocity: 0,
            dragging: false,
            startX: 0,
            startRotation: 0,
            activeIndex: 0,
            hoveredIndex: null
        };
        const step = (Math.PI * 2) / cards.length;

        const setActive = (index) => {
            if (state.activeIndex === index) {
                return;
            }
            state.activeIndex = index;
            updateFleetDetail(index);
        };

        const updateLayout = () => {
            const width = carousel.clientWidth;
            const height = carousel.clientHeight;
            const radiusX = clamp(width * 0.34, 240, 420);
            const radiusZ = clamp(width * 0.2, 150, 280);
            let nearest = { index: 0, depth: -Infinity };

            cards.forEach((card, index) => {
                const angle = wrapAngle(state.rotation + index * step);
                const x = Math.sin(angle) * radiusX;
                const z = Math.cos(angle) * radiusZ;
                const y = Math.sin(angle * 2.2) * 26;
                const scale = clamp(0.58 + ((z + radiusZ) / (radiusZ * 2)) * 0.52, 0.58, 1.1);
                const opacity = clamp(0.24 + ((z + radiusZ) / (radiusZ * 2)) * 0.82, 0.2, 1);
                const rotateY = -Math.sin(angle) * 42;
                card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotateY}deg) scale(${scale})`;
                card.style.opacity = opacity.toFixed(3);
                card.style.zIndex = String(Math.round(z + 500));
                card.classList.toggle('is-active', index === state.hoveredIndex || (!state.hoveredIndex && index === state.activeIndex));

                if (z > nearest.depth) {
                    nearest = { index, depth: z };
                }
            });

            if (state.hoveredIndex === null) {
                setActive(nearest.index);
            }
        };

        const tick = () => {
            if (!state.dragging) {
                state.targetRotation += state.velocity;
                state.velocity *= 0.94;
            }
            state.rotation = lerp(state.rotation, state.targetRotation, 0.08);
            updateLayout();
        };

        carousel.addEventListener('pointerdown', (event) => {
            state.dragging = true;
            state.startX = event.clientX;
            state.startRotation = state.targetRotation;
            carousel.classList.add('is-dragging');
            event.preventDefault();
        });

        window.addEventListener('pointermove', (event) => {
            if (!state.dragging) {
                return;
            }
            const delta = event.clientX - state.startX;
            state.targetRotation = state.startRotation + delta * 0.0065;
            state.velocity = delta * 0.000016;
        });

        window.addEventListener('pointerup', () => {
            state.dragging = false;
            carousel.classList.remove('is-dragging');
        });

        cards.forEach((card) => {
            card.addEventListener('mouseenter', async () => {
                state.hoveredIndex = Number(card.dataset.index);
                setActive(state.hoveredIndex);
                body.classList.add('is-fleet-focus');
                await displacement.attach(card, [card.dataset.primaryImage, card.dataset.secondaryImage]);
            });
            card.addEventListener('mousemove', (event) => displacement.updatePointer(event));
            card.addEventListener('mouseleave', () => {
                state.hoveredIndex = null;
                body.classList.remove('is-fleet-focus');
                displacement.detach(card);
            });
        });

        window.addEventListener('resize', updateLayout);
        addFrameListener(tick);
        updateLayout();
    }

    function createFleetDisplacement() {
        if (!window.THREE) {
            return {
                attach: async () => {},
                detach: () => {},
                updatePointer: () => {}
            };
        }

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.domElement.className = 'fleet-webgl-overlay';
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin('anonymous');
        const cache = new Map();
        const uniforms = {
            uTextureA: { value: null },
            uTextureB: { value: null },
            uMix: { value: 0 },
            uTime: { value: 0 },
            uPointer: { value: new THREE.Vector2(0.5, 0.5) }
        };
        const material = new THREE.ShaderMaterial({
            uniforms,
            transparent: true,
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D uTextureA;
                uniform sampler2D uTextureB;
                uniform float uMix;
                uniform float uTime;
                uniform vec2 uPointer;
                varying vec2 vUv;

                void main() {
                    vec2 pointer = vec2(uPointer.x, 1.0 - uPointer.y);
                    float dist = distance(vUv, pointer);
                    float ripple = sin(28.0 * dist - uTime * 4.5) * exp(-7.0 * dist) * 0.026;
                    vec2 direction = normalize(vUv - pointer + 0.0001);
                    vec2 uvA = vUv + direction * ripple * (1.0 - uMix);
                    vec2 uvB = vUv - direction * ripple * uMix;
                    vec4 texA = texture2D(uTextureA, uvA);
                    vec4 texB = texture2D(uTextureB, uvB);
                    vec4 color = mix(texA, texB, smoothstep(0.0, 1.0, uMix));
                    float edgeGlow = smoothstep(0.28, 0.0, dist) * 0.14;
                    gl_FragColor = vec4(color.rgb + edgeGlow, 1.0);
                }
            `
        });
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
        scene.add(plane);

        let host = null;
        let rendering = false;

        const loadTexture = (url) => {
            if (!url) {
                return Promise.resolve(null);
            }
            if (cache.has(url)) {
                return cache.get(url);
            }
            const promise = new Promise((resolve, reject) => {
                loader.load(url, (texture) => {
                    texture.minFilter = THREE.LinearFilter;
                    texture.generateMipmaps = false;
                    resolve(texture);
                }, undefined, reject);
            });
            cache.set(url, promise);
            return promise;
        };

        const resize = () => {
            if (!host) {
                return;
            }
            const bounds = host.getBoundingClientRect();
            renderer.setSize(Math.max(bounds.width, 2), Math.max(bounds.height, 2), false);
        };

        window.addEventListener('resize', resize);

        addFrameListener((time) => {
            if (!rendering || !host) {
                return;
            }
            uniforms.uTime.value = time;
            renderer.render(scene, camera);
        });

        return {
            attach: async (card, images) => {
                const nextHost = card.querySelector('.fleet-webgl-host');
                if (!nextHost) {
                    return;
                }

                host = nextHost;
                host.appendChild(renderer.domElement);
                resize();

                try {
                    const [textureA, textureB] = await Promise.all([
                        loadTexture(images[0]),
                        loadTexture(images[1] || images[0])
                    ]);
                    if (!textureA || !textureB) {
                        throw new Error('Missing texture');
                    }
                    uniforms.uTextureA.value = textureA;
                    uniforms.uTextureB.value = textureB;
                    rendering = true;
                    gsap.killTweensOf(uniforms.uMix);
                    gsap.fromTo(uniforms.uMix, { value: 0 }, { value: 1, duration: 0.85, ease: 'power2.out' });
                    gsap.to(host, { opacity: 1, duration: 0.28, ease: 'power2.out', overwrite: true });
                } catch (error) {
                    rendering = false;
                    gsap.to(host, { opacity: 0, duration: 0.18, overwrite: true });
                }
            },
            detach: (card) => {
                const currentHost = card.querySelector('.fleet-webgl-host');
                if (!currentHost) {
                    return;
                }
                gsap.to(currentHost, { opacity: 0, duration: 0.25, overwrite: true });
                gsap.to(uniforms.uMix, {
                    value: 0,
                    duration: 0.38,
                    overwrite: true,
                    onComplete: () => {
                        if (host === currentHost) {
                            rendering = false;
                        }
                    }
                });
            },
            updatePointer: (event) => {
                if (!host) {
                    return;
                }
                const bounds = host.getBoundingClientRect();
                uniforms.uPointer.value.set(
                    clamp((event.clientX - bounds.left) / bounds.width, 0, 1),
                    clamp((event.clientY - bounds.top) / bounds.height, 0, 1)
                );
            }
        };
    }

    function initSectionReveals() {
        if (!window.ScrollTrigger) {
            return;
        }

        gsap.utils.toArray('.reveal-item, .panel-head, .glass').forEach((element) => {
            if (element.dataset.revealBound === 'true') {
                return;
            }
            element.dataset.revealBound = 'true';
            gsap.from(element, {
                scrollTrigger: {
                    trigger: element,
                    start: 'top 86%'
                },
                y: 44,
                opacity: 0,
                duration: 1,
                ease: 'power3.out'
            });
        });
    }

    function initShutter() {
        const shutter = document.getElementById('page-shutter');
        const top = shutter.querySelector('.shutter-panel--top');
        const bottom = shutter.querySelector('.shutter-panel--bottom');
        const center = shutter.querySelector('.shutter-center');
        const progress = document.getElementById('shutter-progress');

        const tl = gsap.timeline({ defaults: { ease: 'power4.inOut' } });
        tl.to({ value: 0 }, {
            value: 100,
            duration: 1.25,
            onUpdate() {
                progress.textContent = `${Math.round(this.targets()[0].value)}%`;
            }
        })
        .to(center, { opacity: 0, duration: 0.28 }, '-=0.18')
        .to(top, { yPercent: -100, duration: 1.15 }, '-=0.04')
        .to(bottom, { yPercent: 100, duration: 1.15 }, '<')
        .to(shutter, {
            opacity: 0,
            duration: 0.3,
            onComplete() {
                shutter.classList.add('is-hidden');
                document.body.classList.remove('is-loading');
            }
        }, '-=0.22');
    }
})();
