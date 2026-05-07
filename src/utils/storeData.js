const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');

export const resolveImageUrl = (value) => {
    if (!value) return '';

    const url = `${value}`.trim();

    if (
        url.startsWith('http://') ||
        url.startsWith('https://') ||
        url.startsWith('data:') ||
        url.startsWith('blob:')
    ) {
        return url;
    }

    if (!API_BASE_URL) {
        return url;
    }

    return `${API_BASE_URL}/${url.replace(/^\/+/, '')}`;
};

export const normalizeCategoryName = (value) => {
    const category = `${value || ''}`.trim().toLowerCase();

    if (category === 'iphone') return 'iPhone';
    if (category === 'ipad') return 'iPad';
    if (category === 'mac') return 'Mac';
    if (category === 'watch' || category === 'apple watch') return 'Apple Watch';
    if (category === 'airpods' || category === 'air pods') return 'AirPods';

    return value || '';
};

export const parsePrice = (value) => {
    if (typeof value === 'number') {
        return value;
    }

    if (typeof value === 'string') {
        const parsed = Number(value.replace(/[^0-9.]/g, ''));
        return Number.isNaN(parsed) ? 0 : parsed;
    }

    return 0;
};

export const formatPrice = (value) => `$${parsePrice(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
})}`;

export const mapProduct = (product) => {
    const priceValue = parsePrice(product.price ?? product.unitPrice ?? product.productPrice);
    const categoryName = normalizeCategoryName(product.category || product.categoryName || '');
    const imageUrl = resolveImageUrl(product.image || product.pictureUrl || '');

    return {
        ...product,
        id: product.id,
        name: product.name,
        image: imageUrl,
        pictureUrl: imageUrl,
        desc: product.desc || product.description || '',
        description: product.description || product.desc || '',
        category: categoryName,
        categoryName,
        reviews: product.reviews || product.reviewsCount || 0,
        rating: product.rating || 0,
        badge: product.badge || '',
        specs: product.specs || {},
        priceValue,
        price: typeof product.price === 'string' && product.price.startsWith('$')
            ? product.price
            : formatPrice(priceValue)
    };
};

export const mapBasketItem = (item) => {
    const mapped = mapProduct(item);

    return {
        ...mapped,
        quantity: item.quantity || 1
    };
};

export const mapOrder = (order) => {
    const items = (order.items || []).map(mapBasketItem);
    const total = order.total ?? items.reduce((sum, item) => sum + (parsePrice(item.priceValue) * item.quantity), 0);

    return {
        ...order,
        id: order.id || order.orderId,
        date: order.date || order.createdAt || order.orderDate || new Date().toISOString(),
        items,
        total,
        paymentMethod: order.paymentMethod || 'cod',
        deliveryInfo: order.deliveryInfo || {
            fullName: order.fullName || '',
            phone: order.phone || '',
            address: order.address || ''
        },
        status: order.status || 'Pending'
    };
};