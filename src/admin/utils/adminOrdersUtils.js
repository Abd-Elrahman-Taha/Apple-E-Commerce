/**
 * Shared helpers for GET /api/Admin/Orders — used by the admin store so
 * Dashboard and Orders page always read the same normalized order shape.
 */

const STATUS_MAP = {
    pending: 'Pending',
    processing: 'Processing',
    ondelivery: 'OnDelivery',
    'on delivery': 'OnDelivery',
    on_delivery: 'OnDelivery',
    delivered: 'Delivered',
};

const KNOWN_STATUSES = new Set(['Pending', 'Processing', 'OnDelivery', 'Delivered']);

function normalizeStatus(raw) {
    if (raw == null || raw === '') return 'Pending';
    if (KNOWN_STATUSES.has(raw)) return raw;
    const key = String(raw).trim().toLowerCase();
    return STATUS_MAP[key] || raw;
}

function pickFirstDefined(obj, keys) {
    for (const k of keys) {
        if (obj && obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
    }
    return undefined;
}

/**
 * Extract a list array from various API envelope shapes (ASP.NET, OData, paginated).
 * Used for admin orders and products list responses.
 */
export function extractListFromApiData(data) {
    if (data == null) return [];

    let body = data;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch {
            return [];
        }
    }

    const tryArray = (v) => (Array.isArray(v) ? v : null);

    const direct = tryArray(body);
    if (direct) return direct;

    const nestedPaths = [
        body.data,
        body.Data,
        body.items,
        body.Items,
        body.results,
        body.Results,
        body.value,
        body.Value,
        body.orders,
        body.Orders,
        body.products,
        body.Products,
        body.payload,
        body.Payload,
        body.list,
        body.List,
        body.data?.data,
        body.Data?.Data,
        body.data?.items,
        body.data?.Items,
        body.Data?.items,
        body.Data?.Items,
    ];

    for (const chunk of nestedPaths) {
        const arr = tryArray(chunk);
        if (arr) return arr;
        if (chunk && typeof chunk === 'object' && Array.isArray(chunk.$values)) return chunk.$values;
        if (chunk && typeof chunk === 'object' && Array.isArray(chunk.$Values)) return chunk.$Values;
    }

    for (const key of Object.keys(body)) {
        const v = body[key];
        if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object') return v;
    }

    return [];
}

/** @deprecated use extractListFromApiData — same implementation */
export const extractOrdersListFromApiData = extractListFromApiData;

export function getOrderSortTimestamp(order) {
    const raw =
        pickFirstDefined(order, ['createdAt', 'CreatedAt', 'orderDate', 'OrderDate', 'date', 'Date']) ??
        0;
    const t = new Date(raw).getTime();
    return Number.isFinite(t) ? t : 0;
}

export function getOrderTotalNumber(order) {
    const raw = pickFirstDefined(order, ['total', 'Total', 'subtotal', 'Subtotal', 'grandTotal', 'GrandTotal']) ?? 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
}

/**
 * Normalize a single admin order to camelCase fields the UI expects.
 */
export function normalizeAdminOrder(raw) {
    if (!raw || typeof raw !== 'object') return null;

    const diRaw = raw.deliveryInfo ?? raw.DeliveryInfo ?? {};
    const deliveryInfo = {
        fullName: pickFirstDefined(diRaw, ['fullName', 'FullName']) ?? '',
        phone: pickFirstDefined(diRaw, ['phone', 'Phone']) ?? '',
        address: pickFirstDefined(diRaw, ['address', 'Address']) ?? '',
        city: pickFirstDefined(diRaw, ['city', 'City']) ?? '',
        email: pickFirstDefined(diRaw, ['email', 'Email']) ?? '',
    };

    const id = pickFirstDefined(raw, ['id', 'Id', 'orderId', 'OrderId']);
    const orderNumber = pickFirstDefined(raw, ['orderNumber', 'OrderNumber']) ?? id;
    const resolvedId = id ?? orderNumber;
    const createdAt =
        pickFirstDefined(raw, ['createdAt', 'CreatedAt', 'orderDate', 'OrderDate', 'date', 'Date']) ??
        null;
    const status = normalizeStatus(pickFirstDefined(raw, ['status', 'Status']));
    const paymentMethod = pickFirstDefined(raw, ['paymentMethod', 'PaymentMethod']) ?? '';
    const total = getOrderTotalNumber(raw);
    const subtotal = Number(
        pickFirstDefined(raw, ['subtotal', 'Subtotal', 'total', 'Total']) ?? total
    );
    const items = raw.items ?? raw.Items ?? raw.orderItems ?? raw.OrderItems ?? [];

    return {
        ...raw,
        id: resolvedId,
        orderNumber,
        createdAt,
        status,
        paymentMethod,
        total,
        subtotal: Number.isFinite(subtotal) ? subtotal : total,
        deliveryInfo,
        items: Array.isArray(items) ? items : [],
    };
}

export function normalizeAdminOrders(list) {
    if (!Array.isArray(list)) return [];
    return list.map(normalizeAdminOrder).filter(Boolean);
}
