/**
 * Product image utilities.
 *
 * LOCAL_IMAGES  — local /public/Images paths, used for fast browser display.
 * API_IMAGES    — full https:// URLs sent to the backend API (must be absolute).
 */

// ── Local paths (fast, always available) ───────────────────────────────────
export const LOCAL_IMAGES = {
    // iPhones
    iphoneWhite:      '/Images/iphone_white.jpg',
    iphoneBlue:       '/Images/iphone_blue.png',
    iphoneGraphite:   '/Images/iphone_graphite.png',
    iphonePink:       '/Images/iphone_pink.png',
    iphoneTeal:       '/Images/iphone_teal.png',
    iphoneGold:       '/Images/iphone_gold.jpg',
    iphone15:         '/Images/iphone15.jpg',
    // MacBooks / Mac
    macbookSilver:    '/Images/macbook_silver.png',
    macbookSpaceGray: '/Images/macbook_space_gray.png',
    macM3:            '/Images/Mac m3.jpg',
    mac16:            '/Images/mac16.jpg',
    // iPads
    ipadPro:          '/Images/Ipad pro.jpg',
    ipadAir:          '/Images/ipad air.jpg',
    ipadMini:         '/Images/Ipad copy.jpg',
    ipad:             '/Images/ipad.jpg',
    // Apple Watch
    watchApple:       '/Images/Apple watch.jpg',
    watch:            '/Images/watch.jpg',
    // AirPods
    airpodsPro:       '/Images/Apple Airpods Pro (2nd Generation).jpg',
    airpodsMax:       '/Images/Apple Airpods Max - Silver.jpg',
    airpods:          '/Images/airpods.jpg',
    // Other
    homepod:          '/Images/Apple HomePod mini - Space Gray.jpg',
    studioDisplay:    '/Images/Studio Display - Nano-texture glass?.jpg',
};

// ── Apple CDN URLs (used when saving to the API) ────────────────────────────
export const API_IMAGES = {
    // iPhones
    iphone_black:   'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-blacktitanium?wid=640&hei=720&fmt=p-jpg',
    iphone_white:   'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-whitetitanium?wid=640&hei=720&fmt=p-jpg',
    iphone_blue:    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-bluetitanium?wid=640&hei=720&fmt=p-jpg',
    iphone_natural: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=640&hei=720&fmt=p-jpg',
    iphone_pink:    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-pink?wid=640&hei=720&fmt=p-jpg',
    iphone_teal:    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-teal?wid=640&hei=720&fmt=p-jpg',
    // MacBooks
    macbook_dark:   'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202310?wid=904&hei=840&fmt=jpeg',
    macbook_silver: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-silver-select-202310?wid=904&hei=840&fmt=jpeg',
    macbook_air:    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba13-midnight-select-202402?wid=904&hei=840&fmt=jpeg',
    // iPad
    ipad_pro:       'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-13-select-wifi-spaceblack-202405?wid=940&hei=1112&fmt=p-jpg',
    ipad_blue:      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-air-11-select-wifi-blue-202405?wid=940&hei=1112&fmt=p-jpg',
    ipad_gray:      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-air-11-select-wifi-spacegray-202405?wid=940&hei=1112&fmt=p-jpg',
    // Watch
    watch_ultra:    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-ultra2-titanium-ocean-blue-select_VW_PF?wid=1000&hei=1000&fmt=jpeg',
    watch_midnight: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-s9-aluminum-midnight-sport-band-midnight-select_VW_PF?wid=1000&hei=1000&fmt=jpeg',
    watch_silver:   'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-s9-aluminum-silver-sport-band-starlight-select_VW_PF?wid=1000&hei=1000&fmt=jpeg',
    // AirPods
    airpods_pro:    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MTJV3?wid=1144&hei=1144&fmt=jpeg',
    airpods_max:    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-select-spacegray-202011?wid=1200&hei=1190&fmt=jpeg',
    airpods_3:      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MME73?wid=1144&hei=1144&fmt=jpeg',
};

// ── Seed catalog references (use API URLs since they're saved to the backend) ─
export const SEED_IPHONE_IMAGES = {
    black:          API_IMAGES.iphone_black,
    white:          API_IMAGES.iphone_white,
    blue:           API_IMAGES.iphone_blue,
    teal:           API_IMAGES.iphone_teal,
    pink:           API_IMAGES.iphone_pink,
    yellow:         API_IMAGES.iphone_natural,
    iphone14_black: API_IMAGES.iphone_black,
    iphone14_white: API_IMAGES.iphone_white,
    iphone14_blue:  API_IMAGES.iphone_blue,
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function parseSpecsColor(product) {
    const raw = product?.specsJson ?? product?.SpecsJson;
    if (!raw || typeof raw !== 'string') return '';
    try {
        const specs = JSON.parse(raw);
        return (specs.color ?? specs.Color ?? '').trim();
    } catch {
        return '';
    }
}

function getProductColor(product) {
    const fromSpecs = parseSpecsColor(product);
    if (fromSpecs) return fromSpecs;

    const colorField = (product?.color ?? product?.Color ?? '').trim();
    if (colorField) return colorField;

    const name = (product?.name ?? '').toLowerCase();
    const colorWords = [
        'black titanium', 'white titanium', 'natural titanium', 'blue titanium',
        'space black', 'space gray', 'graphite', 'midnight', 'starlight',
        'ultramarine', 'silver', 'teal', 'pink', 'yellow', 'purple', 'white', 'black', 'blue',
    ];
    for (const word of colorWords) {
        if (name.includes(word)) {
            return word.split(' ').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
        }
    }
    return '';
}

function getProductCategory(product) {
    return (product?.categoryName ?? product?.category ?? '').toLowerCase();
}

function isIphoneProduct(product) {
    const cat = getProductCategory(product);
    const name = (product?.name ?? '').toLowerCase();
    return cat.includes('iphone') || name.includes('iphone');
}

function isMacProduct(product) {
    const cat = getProductCategory(product);
    const name = (product?.name ?? '').toLowerCase();
    return cat.includes('mac') || name.includes('macbook') || name.includes('imac') || name.includes('mac mini');
}

function isIpadProduct(product) {
    const cat = getProductCategory(product);
    const name = (product?.name ?? '').toLowerCase();
    return cat.includes('ipad') || name.includes('ipad');
}

function isWatchProduct(product) {
    const cat = getProductCategory(product);
    const name = (product?.name ?? '').toLowerCase();
    return cat.includes('watch') || name.includes('watch');
}

function isAirpodsProduct(product) {
    const cat = getProductCategory(product);
    const name = (product?.name ?? '').toLowerCase();
    return cat.includes('airpods') || name.includes('airpods');
}

function isLocalPath(url) {
    if (!url || typeof url !== 'string') return false;
    const lower = url.trim().toLowerCase();
    return lower.startsWith('/images/') || lower.startsWith('/public/');
}

function isUntrustedImageUrl(url) {
    if (!url || typeof url !== 'string') return true;
    const lower = url.trim().toLowerCase();
    if (lower.startsWith('data:')) return false;
    if (lower.startsWith('/images/')) return false;
    const UNTRUSTED_HOSTS = ['pngimg.com', 'placeholder.com', 'placehold.co'];
    return UNTRUSTED_HOSTS.some((host) => lower.includes(host));
}

// ── Local image selector (for browser display) ───────────────────────────────
export function getIphoneLocalImage(colorRaw) {
    const c = (colorRaw || '').toLowerCase();
    if (c.includes('pink') || c.includes('rose')) return LOCAL_IMAGES.iphonePink;
    if (c.includes('teal') || c.includes('green')) return LOCAL_IMAGES.iphoneTeal;
    if (c.includes('natural') || c.includes('gold') || c.includes('yellow') || c.includes('starlight')) return LOCAL_IMAGES.iphoneGold;
    if (c.includes('blue') || c.includes('ultramarine') || c.includes('pacific')) return LOCAL_IMAGES.iphoneBlue;
    if (c.includes('white') || (c.includes('white') && c.includes('titanium'))) return LOCAL_IMAGES.iphoneWhite;
    if (c.includes('silver')) return LOCAL_IMAGES.iphoneWhite;
    if (c.includes('black') || c.includes('graphite') || c.includes('midnight') || c.includes('space')) return LOCAL_IMAGES.iphoneGraphite;
    return LOCAL_IMAGES.iphoneBlue;
}

function getMacLocalImage(product) {
    const name = (product?.name ?? '').toLowerCase();
    if (name.includes('macbook pro') || name.includes('mac pro')) return LOCAL_IMAGES.mac16;
    if (name.includes('macbook air') || name.includes('mac air')) return LOCAL_IMAGES.macM3;
    if (name.includes('imac')) return LOCAL_IMAGES.macM3;
    if (name.includes('mac mini')) return LOCAL_IMAGES.macM3;
    const c = (getProductColor(product) || '').toLowerCase();
    if (c.includes('silver') || c.includes('starlight') || c.includes('white')) return LOCAL_IMAGES.macbookSilver;
    return LOCAL_IMAGES.macbookSpaceGray;
}

/**
 * Returns the best URL for displaying in the browser.
 * Uses local /Images paths for speed & reliability.
 */
export function getProductImageUrl(product) {
    if (!product) return LOCAL_IMAGES.iphoneBlue;

    const color = getProductColor(product);
    const name = (product?.name ?? '').toLowerCase();

    // ── iPhone ──────────────────────────────────────────────────────────────
    if (isIphoneProduct(product)) {
        return getIphoneLocalImage(color);
    }

    // ── Mac ─────────────────────────────────────────────────────────────────
    if (isMacProduct(product)) {
        return getMacLocalImage(product);
    }

    // ── iPad ─────────────────────────────────────────────────────────────────
    if (isIpadProduct(product)) {
        if (name.includes('mini')) return LOCAL_IMAGES.ipadMini;
        if (name.includes('pro')) return LOCAL_IMAGES.ipadPro;
        if (name.includes('air')) return LOCAL_IMAGES.ipadAir;
        return LOCAL_IMAGES.ipad;
    }

    // ── Apple Watch ──────────────────────────────────────────────────────────
    if (isWatchProduct(product)) {
        return LOCAL_IMAGES.watchApple;
    }

    // ── AirPods ──────────────────────────────────────────────────────────────
    if (isAirpodsProduct(product)) {
        if (name.includes('max')) return LOCAL_IMAGES.airpodsMax;
        if (name.includes('pro')) return LOCAL_IMAGES.airpodsPro;
        return LOCAL_IMAGES.airpods;
    }

    // ── HomePod ──────────────────────────────────────────────────────────────
    if (name.includes('homepod')) return LOCAL_IMAGES.homepod;

    // ── Studio Display ────────────────────────────────────────────────────────
    if (name.includes('studio display') || name.includes('display')) return LOCAL_IMAGES.studioDisplay;

    // ── Fallback ──────────────────────────────────────────────────────────────
    const stored = product.pictureUrl ?? product.PictureUrl ?? product.image ?? product.Image ?? '';
    if (stored && !isUntrustedImageUrl(stored)) return stored;
    return LOCAL_IMAGES.iphoneBlue;
}

/**
 * Returns the API-safe https:// URL to SAVE to the backend for a product.
 * Never returns local paths — the API rejects those.
 */
export function getApiImageUrl(product) {
    if (!product) return API_IMAGES.iphone_blue;

    const color = getProductColor(product);
    const c = color.toLowerCase();

    if (isIphoneProduct(product)) {
        if (c.includes('pink') || c.includes('rose')) return API_IMAGES.iphone_pink;
        if (c.includes('teal') || c.includes('green')) return API_IMAGES.iphone_teal;
        if (c.includes('natural') || c.includes('gold') || c.includes('yellow') || c.includes('starlight')) return API_IMAGES.iphone_natural;
        if (c.includes('blue') || c.includes('ultramarine')) return API_IMAGES.iphone_blue;
        if (c.includes('white') || c.includes('silver')) return API_IMAGES.iphone_white;
        if (c.includes('black') || c.includes('graphite') || c.includes('midnight') || c.includes('space')) return API_IMAGES.iphone_black;
        return API_IMAGES.iphone_black;
    }

    if (isMacProduct(product)) {
        if (c.includes('silver') || c.includes('starlight') || c.includes('white')) return API_IMAGES.macbook_silver;
        return API_IMAGES.macbook_dark;
    }

    if (isIpadProduct(product)) {
        if (c.includes('blue') || c.includes('teal')) return API_IMAGES.ipad_blue;
        if (c.includes('silver') || c.includes('white') || c.includes('starlight')) return API_IMAGES.ipad_gray;
        return API_IMAGES.ipad_pro;
    }

    if (isWatchProduct(product)) {
        const name = (product?.name ?? '').toLowerCase();
        if (name.includes('ultra')) return API_IMAGES.watch_ultra;
        if (c.includes('silver') || c.includes('starlight') || c.includes('white')) return API_IMAGES.watch_silver;
        return API_IMAGES.watch_midnight;
    }

    if (isAirpodsProduct(product)) {
        const name = (product?.name ?? '').toLowerCase();
        if (name.includes('max')) return API_IMAGES.airpods_max;
        if (name.includes('pro')) return API_IMAGES.airpods_pro;
        return API_IMAGES.airpods_3;
    }

    return API_IMAGES.iphone_black;
}

/** Apply resolved display image URL on product objects (store + admin lists). */
export function withFixedProductImages(product) {
    const pictureUrl = getProductImageUrl(product);
    return { ...product, pictureUrl, image: pictureUrl };
}

export function needsProductImageFix(product) {
    const stored = product?.pictureUrl ?? product?.PictureUrl ?? product?.image ?? '';
    return isUntrustedImageUrl(stored);
}
