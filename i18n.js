(() => {
    const STORAGE_KEY = 'onyxLanguage';
    const AR = 'ar-EG';
    const EN = 'en';
    const originalText = new WeakMap();
    const originalAttributes = new WeakMap();
    const originalTitle = document.title;
    let applying = false;
    let currentLanguage = getInitialLanguage();

    const exact = new Map(Object.entries({
        'Home': 'الرئيسية',
        'Cars': 'العربيات',
        'cars': 'العربيات',
        'Inventory': 'المخزون',
        'Offers': 'العروض',
        'offers': 'العروض',
        'Brands': 'الماركات',
        'brands': 'الماركات',
        'Compare': 'قارن',
        'compare': 'قارن',
        'Finance': 'التمويل',
        'finance': 'التمويل',
        'Concierge': 'المساعد الذكي',
        'concierge': 'المساعد الذكي',
        'Showroom': 'المعرض',
        'showroom': 'المعرض',
        'Services': 'الخدمات',
        'services': 'الخدمات',
        'Trade In': 'بدل عربيتك',
        'trade': 'بدل عربيتك',
        'Branches': 'الفروع',
        'branches': 'الفروع',
        'About': 'عن Onyx',
        'about': 'عن Onyx',
        'Stories': 'قصص وأخبار',
        'stories': 'قصص وأخبار',
        'Book': 'احجز',
        'book': 'احجز',
        'Contact': 'تواصل',
        'contact': 'تواصل',
        'Onyx': 'Onyx',
        'ONYX': 'Onyx',
        'Onyx home': 'الصفحة الرئيسية لـ Onyx',
        'home': 'الرئيسية',
        'Book Onyx': 'احجز مع Onyx',
        'Open Full Inventory': 'افتح كل العربيات',
        'Find My Car': 'اختارلي عربية',
        'Current Offers': 'العروض الحالية',
        'Open Vehicle Page': 'افتح صفحة العربية',
        'Open Vehicle': 'افتح العربية',
        'Open model page': 'افتح صفحة الموديل',
        'Book viewing': 'احجز معاينة',
        'Book test drive': 'احجز تجربة قيادة',
        'Finance it': 'احسب تمويلها',
        'Onyx source': 'مصدر Onyx',
        'Explore cars': 'استكشف العربيات',
        'Find my car': 'اختارلي عربية',
        'View': 'اعرض',
        'Added': 'اتضافت',
        'Open compare': 'افتح المقارنة',
        'Clear': 'امسح',
        'Request offer': 'اطلب عرض',
        'Tune payment': 'ظبط القسط',
        'Start': 'ابدأ',
        'Call': 'اتصل',
        'Email': 'ابعت إيميل',
        'Prepare request': 'جهز الطلب',
        'Sound Off': 'الصوت مقفول',
        'Sound On': 'الصوت شغال',
        'Beyond': 'ما بعد',
        'Mobility': 'الحركة',
        'Beyond Mobility': 'ما بعد الحركة',
        'Onyx Egypt / Live Cinematic Dealership': 'Onyx مصر / معرض رقمي سينمائي مباشر',
        'Full Onyx Platform / From A To Z': 'منصة Onyx كاملة / من الألف للياء',
        'The Digital Dealership Starts Here': 'المعرض الرقمي بيبدأ من هنا',
        'Live Inventory': 'المخزون المباشر',
        'Offer Board': 'لوحة العروض',
        'Brand Universe': 'عالم الماركات',
        'Compare Studio': 'استوديو المقارنة',
        'Finance Lab': 'معمل التمويل',
        'Spatial Showroom': 'المعرض التفاعلي',
        'Ownership Hub': 'مركز الملكية',
        'Trade-In Studio': 'استوديو البدل',
        'Booking Desk': 'مكتب الحجز',
        'Legacy': 'تاريخنا',
        'Live Inventory Search and filter every scraped Onyx vehicle.': 'المخزون المباشر دور وفلتر كل عربيات Onyx المسحوبة من الكتالوج.',
        'Every Car': 'كل العربيات',
        'Every': 'كل',
        'Car': 'عربية',
        'Live Deals': 'عروض مباشرة',
        'Live': 'مباشر',
        'Deals': 'عروض',
        'Choose Worlds': 'اختار عالمك',
        'Choose': 'اختار',
        'Worlds': 'عوالم',
        'Make Choices': 'اختار صح',
        'Make': 'حدد',
        'Choices': 'اختياراتك',
        'Payment Lab': 'معمل الأقساط',
        'Payment': 'معمل',
        'Lab': 'الأقساط',
        'Find Fit': 'اختار الأنسب',
        'Find': 'اختار',
        'Fit': 'الأنسب',
        'Inspect Reality': 'عاين بواقعية',
        'Inspect': 'عاين',
        'Reality': 'الواقع',
        'After Sale': 'بعد البيع',
        'After': 'بعد',
        'Sale': 'البيع',
        'Upgrade Path': 'طريق الترقية',
        'Upgrade': 'ترقية',
        'Path': 'الطريق',
        'Reach Onyx': 'وصل لـ Onyx',
        'Reach': 'وصل لـ',
        'Built Forward': 'تاريخ بيكمل لقدام',
        'Built': 'مبني',
        'Forward': 'لقدام',
        'Market Signals': 'إشارات السوق',
        'Market': 'السوق',
        'Signals': 'إشارات',
        'Reserve Time': 'احجز معاد',
        'Reserve': 'احجز',
        'Time': 'معاد',
        'Start Here': 'ابدأ من هنا',
        'Here': 'هنا',
        'Onyx Live Inventory': 'مخزون Onyx المباشر',
        'Onyx Live Feed': 'بث Onyx المباشر',
        'Inventory OS': 'نظام المخزون',
        'Search the whole showroom.': 'دور في المعرض كله.',
        'Comparison tray': 'سلة المقارنة',
        'Comparison matrix': 'جدول المقارنة',
        'Every tradeoff, visible.': 'كل فرق واضح قدامك.',
        'Dynamic Finance Engine': 'محرك التمويل الذكي',
        'Estimated monthly': 'القسط المتوقع',
        'Vehicle': 'العربية',
        'Down payment': 'المقدم',
        'Months': 'الشهور',
        'Annual rate estimate': 'تقدير الفايدة السنوية',
        'Insurance estimate': 'تقدير التأمين',
        'vehicle price': 'سعر العربية',
        'financed amount': 'المبلغ الممول',
        'estimated total': 'الإجمالي المتوقع',
        'Onyx Concierge': 'مساعد Onyx',
        'Budget lane': 'شريحة الميزانية',
        'Primary use': 'الاستخدام الأساسي',
        'Driving feel': 'إحساس السواقة',
        'Brand preference': 'الماركة المفضلة',
        'Any': 'أي اختيار',
        'any': 'أي',
        'entry': 'اقتصادي',
        'mid': 'متوسط',
        'premium': 'فاخر',
        'Under 1M': 'أقل من مليون',
        '1M to 1.6M': 'من مليون لـ 1.6 مليون',
        '1.6M plus': 'أعلى من 1.6 مليون',
        'Any brand': 'أي ماركة',
        'Local': 'محلي',
        'Family': 'عائلي',
        'City': 'مدينة',
        'Business': 'شغل',
        'Eco': 'اقتصادي/صديق للبيئة',
        'Performance': 'أداء',
        'Calm': 'هادي',
        'Balanced': 'متوازن',
        'Quick': 'سريع',
        'Gallery': 'معرض الصور',
        'Driveway': 'قدام البيت',
        'Delivery': 'التسليم',
        'Night': 'ليل',
        'Photo frame': 'لقطة الصورة',
        'Front design': 'تصميم المقدمة',
        'Cabin stance': 'شكل الكابينة',
        'Wheelbase': 'قاعدة العجلات',
        'length': 'الطول',
        'width': 'العرض',
        'wheelbase': 'قاعدة العجلات',
        'driveway fit': 'مناسبة للجراج',
        'parking fit': 'مناسبة للركن',
        'cabin stability': 'ثبات ومساحة',
        'Onyx services': 'خدمات Onyx',
        'Service': 'خدمة',
        'Trade In': 'بدل عربيتك',
        'Used Cars': 'عربيات مستعملة',
        'Installment': 'تقسيط',
        'Direct Installment': 'تقسيط مباشر',
        'Service request': 'طلب خدمة',
        'Service command board': 'لوحة متابعة الخدمة',
        'Locations': 'المواقع',
        'Showrooms as a journey.': 'الفروع كرحلة للعميل.',
        'Vision and mission': 'الرؤية والرسالة',
        'Credibility, fit, sustainability.': 'ثقة، اختيار مناسب، واستدامة.',
        'Timeline': 'الخط الزمني',
        'The company story.': 'قصة الشركة.',
        'Founder': 'المؤسس',
        'Onyx insight': 'رؤية من Onyx',
        'Editorial system': 'نظام المحتوى',
        'Stories that sell without shouting.': 'قصص بتبيع من غير دوشة.',
        'Quick contact': 'تواصل سريع',
        'Onyx request': 'طلب Onyx',
        'Name': 'الاسم',
        'Phone': 'الموبايل',
        'Interest': 'الاهتمام',
        'Message': 'الرسالة',
        'New car': 'عربية جديدة',
        'Used car': 'عربية مستعملة',
        'Trade in': 'بدل عربيتي',
        'Direct installment': 'تقسيط مباشر',
        'Branch visit': 'زيارة فرع',
        'Not sure yet': 'لسه مش متأكد',
        'Booking checklist': 'قائمة الحجز',
        'A full live showroom from Onyx data: search, filters, price intelligence, compare tray, and real model pages generated from the scraped official catalog.': 'معرض مباشر كامل من بيانات Onyx: بحث، فلاتر، قراءة أسعار، سلة مقارنة، وصفحات موديلات حقيقية من الكتالوج الرسمي.',
        'This is not a flat listing. It behaves like a digital sales desk: filter by intent, sort by price or performance, open any model, and carry cars into comparison.': 'دي مش قايمة عادية. ده مكتب مبيعات رقمي: فلتر حسب نيتك، رتب بالسعر أو الأداء، افتح أي موديل، وخد العربيات للمقارنة.',
        'No exact match.': 'مفيش نتيجة مطابقة.',
        'Try a wider budget, brand, or category.': 'جرب ميزانية أو ماركة أو فئة أوسع.',
        'Pick up to four cars from the grid.': 'اختار لحد أربع عربيات من الشبكة.',
        'Specification intelligence': 'قراءة المواصفات',
        'What matters at sale time.': 'المهم وقت قرار الشراء.',
        'A dealership-grade detail page should turn raw text into useful decisions: dimensions, power, warranty, payment entry, and comparable alternatives.': 'صفحة تفاصيل محترفة لازم تحول الكلام الخام لقرارات واضحة: أبعاد، قوة، ضمان، بداية قسط، وبدائل للمقارنة.',
        'Decision read': 'قراءة القرار',
        'Similar picks': 'اختيارات قريبة',
        'Keep the customer moving.': 'خلي العميل يكمل اختياره.',
        'Related models stay on the page so a customer never hits a dead end.': 'الموديلات القريبة موجودة في نفس الصفحة علشان العميل يفضل قدامه اختيارات.',
        'A serious offers page does not invent discounts. It turns Onyx listed prices into clear entry points, payment starts, and action paths.': 'صفحة العروض الجادة ما بتخترعش خصومات. هي بتحول أسعار Onyx لنقط دخول واضحة وبدايات أقساط وخطوات شراء.',
        'Commercial clarity': 'وضوح تجاري',
        'Offers customers can understand.': 'عروض العميل يفهمها بسرعة.',
        'Each offer uses the scraped Onyx price range and a transparent sample payment. Final financing must be confirmed by Onyx.': 'كل عرض مبني على مدى أسعار Onyx الحقيقي وقسط تجريبي واضح. التمويل النهائي لازم يتأكد من Onyx.',
        'Onyx is a multi-brand destination. This page makes the range legible by brand, price entry, category spread, and direct catalog access.': 'Onyx وجهة متعددة الماركات. الصفحة دي بتوضح المدى حسب الماركة، بداية السعر، تنوع الفئات، والدخول المباشر للكتالوج.',
        'Authorized brand map': 'خريطة الماركات المعتمدة',
        'Every marque has a door.': 'كل ماركة ليها باب واضح.',
        'Instead of burying brands inside a grid, the brand page gives each marque a launch point and commercial role.': 'بدل ما الماركات تتدفن جوه شبكة، الصفحة بتدي كل ماركة نقطة بداية ودور تجاري واضح.',
        'A clear comparison floor for Onyx shoppers: select up to four vehicles and see price, size, power, warranty, and category tradeoffs in one place.': 'مساحة مقارنة واضحة لعملاء Onyx: اختار لحد أربع عربيات وشوف السعر، الحجم، القوة، الضمان، وفروق الفئة في مكان واحد.',
        'Premium automotive sites win when they reduce anxiety. This page turns Onyx data into a focused decision surface.': 'المواقع القوية في العربيات بتكسب لما تقلل الحيرة. الصفحة دي بتحول بيانات Onyx لمساحة قرار مركزة.',
        'Choose vehicles to compare.': 'اختار عربيات للمقارنة.',
        'A realistic finance playground for Onyx customers: select a car, tune deposit, term, rate, insurance, and get a transparent estimated monthly payment.': 'حاسبة تمويل واقعية لعملاء Onyx: اختار العربية، ظبط المقدم، المدة، الفايدة، التأمين، وشوف قسط شهري تقديري واضح.',
        'A practical recommendation engine. No fake magic: it uses budget, usage, seats, pace, and brand preference to rank real Onyx vehicles.': 'مساعد ترشيح عملي. من غير وعود وهمية: بيستخدم الميزانية، الاستخدام، المقاعد، أسلوب السواقة، والماركة لترتيب عربيات Onyx الحقيقية.',
        'Tell me the customer context and I will rank the Onyx catalog from actual prices and specs.': 'قولي سياق العميل وأنا أرتب كتالوج Onyx حسب الأسعار والمواصفات الحقيقية.',
        'A grounded image-based showroom: official Onyx photos, environment modes, gallery frames, dimensions, and product hotspots. Realistic, usable, and showroom-safe.': 'معرض واقعي مبني على الصور: صور Onyx الرسمية، أوضاع عرض، لقطات جاليري، أبعاد، ونقاط مهمة في المنتج. واقعي ومفيد ومناسب للمعرض.',
        'Onyx services become a proper ownership system: trade-in, used cars, installments, direct installments, document capture, and customer handoff.': 'خدمات Onyx بتتحول لنظام ملكية كامل: بدل، مستعمل، تقسيط، تقسيط مباشر، تجهيز بيانات، وتسليم العميل للخطوة الصح.',
        'From first lead to next car.': 'من أول طلب لحد العربية اللي بعدها.',
        'Based on Onyx official services: Trade In, Used Cars, Installment, and Direct Installment. This page turns each into a usable digital flow.': 'مبنية على خدمات Onyx الرسمية: بدل عربيتك، المستعمل، التقسيط، والتقسيط المباشر. الصفحة بتحول كل خدمة لمسار رقمي واضح.',
        'A practical intake page for customers moving from an owned car into an Onyx vehicle. The estimator is transparent and keeps the next step human.': 'صفحة استقبال عملية للعميل اللي عايز يبدل عربيته بعربية من Onyx. التقدير واضح والخطوة الجاية لسه مع فريق حقيقي.',
        'A cleaner branch and contact layer using Onyx official milestones and quick contact details. Customers can pick location intent, call 15052, or start a booking.': 'طبقة فروع وتواصل أوضح مبنية على بيانات Onyx الرسمية ووسائل التواصل السريعة. العميل يختار نية الزيارة، يتصل بـ 15052، أو يبدأ الحجز.',
        'Branch Network': 'شبكة الفروع',
        'From a small three-microbus showroom in 1993 to more than 2,500 annual vehicle sales and a multi-brand authorized dealership footprint.': 'من معرض صغير فيه تلات ميكروباصات سنة 1993 لأكتر من 2500 عربية سنويا وحضور موزع معتمد متعدد الماركات.',
        'Onyx Legacy': 'تاريخ Onyx',
        'Editorial pages do not have to be filler. This one turns the Onyx catalog and company milestones into useful buying intelligence.': 'صفحات القصص مش لازم تبقى حشو. الصفحة دي بتحول كتالوج Onyx ومحطات الشركة لمعلومات شراء مفيدة.',
        'Every serious dealership platform needs a clean conversion end point: call, book, request financing, request trade-in, or ask for branch help.': 'أي منصة معرض قوية محتاجة نقطة تواصل واضحة: اتصال، حجز، طلب تمويل، طلب بدل، أو مساعدة من الفرع.',
        'A dealership-grade booking flow: choose car, purpose, branch intent, contact window, and prepare the request before calling Onyx.': 'تجربة حجز محترمة: اختار العربية، نوع الطلب، الفرع المناسب، وقت التواصل، وجهز طلبك قبل ما تكلم Onyx.',
        'A premium booking page should reduce friction before the customer calls or submits: car of interest, branch preference, financing status, and test-drive purpose.': 'صفحة الحجز لازم تسهل على العميل: العربية المطلوبة، الفرع المفضل، حالة التمويل، وهدف تجربة القيادة كله يبقى واضح من الأول.',
        'A complete static dealership platform powered by Onyx scraped inventory, official company content, and practical buying tools.': 'منصة معرض كاملة مبنية على مخزون Onyx الحقيقي، محتوى الشركة الرسمي، وأدوات شراء عملية.',
        'Check': 'مهم',
        'Pick exact model or ask the concierge': 'اختار موديل محدد أو اسأل المساعد الذكي',
        'Choose test drive, viewing, financing, or trade-in': 'اختار تجربة قيادة، معاينة، تمويل، أو بدل',
        'Confirm branch and contact window': 'أكد الفرع والوقت المناسب للتواصل',
        'Bring license and ID when visiting': 'هات الرخصة والبطاقة وقت الزيارة',
        'Call 15052 for final appointment confirmation': 'اتصل بـ 15052 لتأكيد المعاد النهائي',
        'selected car': 'العربية المختارة',
        'confirm booking': 'تأكيد الحجز',
        'request prep': 'تجهيز الطلب',
        'official catalog vehicles': 'عربية من الكتالوج الرسمي',
        'authorized brands': 'ماركات معتمدة',
        'market categories': 'فئات في السوق',
        'cars compared': 'عربيات في المقارنة',
        'brands available': 'ماركات متاحة',
        'catalog records': 'بيانات في الكتالوج',
        'service lanes': 'مسارات خدمة',
        'quick contact': 'تواصل سريع',
        'service network': 'شبكة الخدمة',
        'network points': 'نقاط في الشبكة',
        'hotline': 'الخط الساخن',
        'origin strength': 'قوة البداية',
        'founded': 'بداية الشركة',
        'annual vehicles': 'عربية سنويا',
        'future vision': 'رؤية المستقبل',
        'SUV options': 'اختيارات SUV',
        'lowest priced': 'أقل سعر',
        'top HP': 'أعلى قوة',
        'selected price': 'السعر المختار',
        'payment term': 'مدة القسط',
        'deposit': 'المقدم',
        'vehicles scanned': 'عربيات اتفحصت',
        'brand universe': 'عالم الماركات',
        'rules engine': 'محرك قواعد',
        'priced offers': 'عروض بسعر',
        'lowest entry': 'أقل دخول',
        'sample term': 'مدة تجريبية',
        'brands': 'ماركات',
        'segments': 'فئات',
        'starting price': 'بداية السعر',
        'Onyx listed range': 'مدى أسعار Onyx',
        'horsepower': 'القوة الحصانية',
        'official photos': 'صور رسمية',
        'mm length': 'مم طول',
        'seats': 'مقاعد',
        'Warranty': 'الضمان',
        'Engine': 'الموتور',
        'Horsepower': 'القوة الحصانية',
        'Transmission': 'الفتيس',
        'Fuel': 'البنزين',
        'Seats': 'المقاعد',
        'Length': 'الطول',
        'Width': 'العرض',
        'Height': 'الارتفاع',
        'Price': 'السعر',
        'Brand': 'الماركة',
        'Category': 'الفئة',
        'Dimensions': 'الأبعاد',
        'Metric': 'البند',
        'Value': 'القيمة',
        'Power': 'القوة',
        'Cabin': 'الكابينة',
        'Size': 'الحجم',
        'Photos': 'الصور',
        'Open': 'افتح',
        'View model': 'اعرض الموديل'
    }));

    const placeholders = new Map(Object.entries({
        'Search brand, model, engine, seats, price...': 'دور بالموديل، الماركة، الموتور، المقاعد أو السعر...',
        'Customer name': 'اسم العميل',
        '01XXXXXXXXX': '01XXXXXXXXX',
        'Tell Onyx what you need': 'اكتب لـ Onyx محتاج إيه'
    }));

    const titleParts = new Map(Object.entries({
        'Live Inventory': 'المخزون المباشر',
        'Vehicle Detail': 'تفاصيل العربية',
        'Offers': 'العروض',
        'Brands': 'الماركات',
        'Compare Studio': 'استوديو المقارنة',
        'Finance Lab': 'معمل التمويل',
        'Concierge': 'المساعد الذكي',
        'Spatial Showroom': 'المعرض التفاعلي',
        'Services': 'الخدمات',
        'Trade In': 'بدل عربيتك',
        'Branches': 'الفروع',
        'About': 'عن Onyx',
        'Stories': 'قصص وأخبار',
        'Booking Desk': 'مكتب الحجز',
        'Contact': 'تواصل',
        'Beyond Mobility': 'ما بعد الحركة'
    }));

    const replacements = [
        [/\bOnyx\b/g, 'Onyx'],
        [/\bONYX\b/g, 'Onyx'],
        [/\bOnyx\b/g, 'Onyx'],
        [/\bEGP\b/g, 'جنيه'],
        [/\bHP\b/g, 'حصان'],
        [/\bCC\b/g, 'سي سي'],
        [/\bTurbo\b/g, 'تيربو'],
        [/\bmm\b/g, 'مم'],
        [/\bSUV\b/g, 'SUV'],
        [/\bsuv\b/g, 'SUV'],
        [/\bsedan\b/g, 'سيدان'],
        [/\bcommercial\b/g, 'تجارية'],
        [/\bperformance\b/g, 'أداء'],
        [/\beco\b/g, 'صديقة للبيئة'],
        [/\bpickup\b/g, 'بيك أب'],
        [/\bwith\b/g, 'بـ'],
        [/\band\b/g, 'و'],
        [/\bseats\b/g, 'مقاعد'],
        [/\bseat\b/g, 'مقعد'],
        [/\bmonths\b/g, 'شهر'],
        [/\bmonthly\b/g, 'شهريا'],
        [/\bdown\b/g, 'مقدم'],
        [/\bannual rate\b/gi, 'فايدة سنوية'],
        [/\bPrice on request\b/g, 'السعر عند التواصل'],
        [/\bAsk Onyx\b/g, 'اسأل Onyx'],
        [/\bTransmission on request\b/g, 'الفتيس عند التواصل'],
        [/\bWarranty on request\b/g, 'الضمان عند التواصل'],
        [/\bFuel on request\b/g, 'نوع البنزين عند التواصل'],
        [/\bAll brands\b/g, 'كل الماركات'],
        [/\bAll categories\b/g, 'كل الفئات'],
        [/\bFeatured\b/g, 'مختارة'],
        [/\bPrice low to high\b/g, 'السعر من الأقل للأعلى'],
        [/\bPrice high to low\b/g, 'السعر من الأعلى للأقل'],
        [/\bNewest scraped\b/g, 'الأحدث في الكتالوج'],
        [/\bEmpty slot\b/g, 'اختيار فاضي'],
        [/\bSlot\b/g, 'خانة'],
        [/\bStep\b/g, 'خطوة'],
        [/\bService\b/g, 'خدمة'],
        [/\bCall 15052\b/g, 'اتصل بـ 15052'],
        [/\b5 min\b/g, '5 دقايق'],
        [/\bHead Branch\b/g, 'الفرع الرئيسي'],
        [/\bCairo\b/g, 'القاهرة'],
        [/\bIsmailia\b/g, 'الإسماعيلية'],
        [/\bDelta\b/g, 'الدلتا']
    ];

    function getInitialLanguage() {
        const fromUrl = new URLSearchParams(location.search).get('lang');
        if (fromUrl === 'ar' || fromUrl === AR) return AR;
        if (fromUrl === 'en') return EN;
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === AR || saved === EN) return saved;
        return /^ar\b/i.test(navigator.language || '') ? AR : EN;
    }

    function normalize(value) {
        return String(value || '').replace(/\s+/g, ' ').trim();
    }

    function preserveWhitespace(original, translated) {
        const leading = String(original).match(/^\s*/)?.[0] || '';
        const trailing = String(original).match(/\s*$/)?.[0] || '';
        return `${leading}${translated}${trailing}`;
    }

    function translateText(value) {
        const normalized = normalize(value);
        if (!normalized) return value;
        if (/^[\d\s.,:/%+-]+$/.test(normalized)) return value;
        if (exact.has(normalized)) return preserveWhitespace(value, exact.get(normalized));

        let translated = normalized;
        replacements.forEach(([pattern, replacement]) => {
            translated = translated.replace(pattern, replacement);
        });

        translated = translated
            .replace(/^For (.*?), assuming (.*?) مقدم and (\d+) شهريا payments\./i, 'بالنسبة لـ $1، على أساس مقدم $2 ومدة $3 شهر.')
            .replace(/^For (.*?), assuming (.*?) مقدم و (\d+) شهريا payments\. Insurance planning is separated so the customer sees what is loan و what is ownership cost\./i, 'بالنسبة لـ $1، المقدم $2، والمدة $3 شهر. التأمين محسوب لوحده علشان العميل يشوف القسط وتكلفة الملكية بوضوح.')
            .replace(/^Insurance planning is separated so the customer sees what is loan و what is ownership cost\./i, 'التأمين محسوب لوحده علشان العميل يشوف القسط وتكلفة الملكية بوضوح.')
            .replace(/^Book (.+)$/i, 'احجز $1')
            .replace(/^Prepared request for (.*?) about (.*?)\./i, 'تم تجهيز طلب لـ $1 بخصوص $2.')
            .replace(/اتصل بـ 15052 to submit it to Onyx\./g, 'اتصل بـ 15052 علشان تبعته لـ Onyx.')
            .replace(/^Top fit: (.*?)\. I am prioritizing (.*?)\./i, 'أنسب اختيار: $1. الأولوية هنا لـ $2.')
            .replace(/^Budget: (.*?)\. Use: (.*?)\. Feel: (.*?)\. Seats: (.*?)\./i, 'الميزانية: $1. الاستخدام: $2. الإحساس: $3. المقاعد: $4.')
            .replace(/^Scene mode: (.*?)\. This keeps the feature realistic by inspecting official photos و specs instead of pretending to run an unavailable VR product\./i, 'وضع العرض: $1. التجربة واقعية لأنها بتعتمد على صور Onyx الرسمية والمواصفات بدل ادعاء VR غير متاح.')
            .replace(/^Scene mode: (.*?)\./i, 'وضع العرض: $1.')
            .replace(/وضع العرض: gallery/g, 'وضع العرض: معرض الصور')
            .replace(/وضع العرض: driveway/g, 'وضع العرض: قدام البيت')
            .replace(/وضع العرض: delivery/g, 'وضع العرض: التسليم')
            .replace(/وضع العرض: night/g, 'وضع العرض: الليل')
            .replace(/The page is generated from Onyx catalog data, including official photos, pricing labels, و specification text\./g, 'الصفحة متولدة من كتالوج Onyx، وفيها الصور الرسمية، بيانات الأسعار، ونص المواصفات.')
            .replace(/This demo prepares a structured request on the page\./g, 'هنا بنجهز طلب منظم قبل التواصل مع Onyx.')
            .replace(/Call 15052 to submit it to Onyx\./g, 'اتصل بـ 15052 علشان تبعته لـ Onyx.')
            .replace(/Official quick contact: 15052 and hello@onyx-eg\.com\./g, 'التواصل الرسمي السريع: 15052 و hello@onyx-eg.com.');

        return translated === normalized ? value : preserveWhitespace(value, translated);
    }

    function shouldSkip(node) {
        const parent = node.parentElement;
        if (!parent) return true;
        return !!parent.closest('script, style, noscript, code, pre, canvas, [data-no-translate], .no-translate');
    }

    function translateTextNode(node) {
        if (shouldSkip(node)) return;
        if (currentLanguage === EN) {
            if (originalText.has(node) && node.nodeValue !== originalText.get(node)) node.nodeValue = originalText.get(node);
            return;
        }

        const current = node.nodeValue;
        const existingOriginal = originalText.get(node);
        const expectedArabic = existingOriginal ? translateText(existingOriginal) : null;
        if (!existingOriginal || (current !== expectedArabic && normalize(current) && !/[\u0600-\u06FF]/.test(current))) {
            originalText.set(node, current);
        }
        const translated = translateText(originalText.get(node) || current);
        if (node.nodeValue !== translated) node.nodeValue = translated;
    }

    function translateAttributes(root) {
        const elements = root.querySelectorAll ? root.querySelectorAll('[placeholder], [aria-label], [title], img[alt]') : [];
        elements.forEach((element) => {
            ['placeholder', 'aria-label', 'title', 'alt'].forEach((attribute) => {
                if (!element.hasAttribute(attribute)) return;
                let stored = originalAttributes.get(element);
                if (!stored) {
                    stored = {};
                    originalAttributes.set(element, stored);
                }
                if (!stored[attribute]) stored[attribute] = element.getAttribute(attribute);
                const original = stored[attribute];
                if (currentLanguage === EN) {
                    if (element.getAttribute(attribute) !== original) element.setAttribute(attribute, original);
                } else if (attribute === 'placeholder' && placeholders.has(original)) {
                    const translated = placeholders.get(original);
                    if (element.getAttribute(attribute) !== translated) element.setAttribute(attribute, translated);
                } else {
                    const translated = translateText(original);
                    if (element.getAttribute(attribute) !== translated) element.setAttribute(attribute, translated);
                }
            });
        });
    }

    function walk(root) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                return shouldSkip(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
            }
        });
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(translateTextNode);
        translateAttributes(root.nodeType === Node.DOCUMENT_NODE ? document : root);
    }

    function translateTitle() {
        if (currentLanguage === EN) {
            document.title = originalTitle;
            return;
        }
        let translated = originalTitle.replace('Onyx', 'Onyx');
        titleParts.forEach((arabic, english) => {
            translated = translated.replace(english, arabic);
        });
        document.title = translated;
    }

    function ensureToggle() {
        let toggle = document.querySelector('.language-toggle');
        if (!toggle) {
            toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'language-toggle hover-target magnetic-target';
            toggle.dataset.cursorLabel = 'Language';
            toggle.dataset.cursorSize = '104';
            toggle.setAttribute('aria-label', 'Switch language');
            const target = document.querySelector('.site-nav__actions') || document.querySelector('.platform-nav__actions') || document.body;
            target.prepend(toggle);
            toggle.addEventListener('click', () => setLanguage(currentLanguage === AR ? EN : AR));
        }
        const label = currentLanguage === AR ? 'English' : 'عربي مصري';
        if (toggle.textContent !== label) toggle.textContent = label;
        const pressed = currentLanguage === AR ? 'true' : 'false';
        if (toggle.getAttribute('aria-pressed') !== pressed) toggle.setAttribute('aria-pressed', pressed);
    }

    function applyLanguage(root = document.body) {
        applying = true;
        document.documentElement.lang = currentLanguage;
        document.documentElement.dir = currentLanguage === AR ? 'rtl' : 'ltr';
        document.body.classList.toggle('is-arabic', currentLanguage === AR);
        ensureToggle();
        walk(root === document.body ? document : root);
        translateTitle();
        applying = false;
    }

    function setLanguage(language) {
        currentLanguage = language === AR ? AR : EN;
        localStorage.setItem(STORAGE_KEY, currentLanguage);
        applyLanguage(document.body);
        window.dispatchEvent(new CustomEvent('onyx:languagechange', { detail: { language: currentLanguage } }));
    }

    function observe() {
        const observer = new MutationObserver((mutations) => {
            if (applying || currentLanguage === EN) return;
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
                    if (node.nodeType === Node.ELEMENT_NODE) applyLanguage(node);
                });
                if (mutation.type === 'characterData') translateTextNode(mutation.target);
            });
        });
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    }

    function init() {
        ensureToggle();
        applyLanguage(document.body);
        observe();
        window.OnyxI18n = { setLanguage, refresh: () => applyLanguage(document.body), get language() { return currentLanguage; } };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
