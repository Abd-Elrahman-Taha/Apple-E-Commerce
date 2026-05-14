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
        body.orderDtos,
        body.OrderDtos,
        body.orderList,
        body.OrderList,
        body.result,
        body.Result,
        body.content,
        body.Content,
        body.rows,
        body.Rows,
        body.records,
        body.Records,
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

function looksLikeOrderRow(obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
    const keys = new Set(Object.keys(obj).map((k) => k.toLowerCase()));
    const signals = [
        'id',
        'orderid',
        'ordernumber',
        'status',
        'total',
        'subtotal',
        'deliveryinfo',
        'items',
        'paymentmethod',
        'createdat',
        'customername',
        'customeremail',
    ];
    let hits = 0;
    for (const s of signals) {
        for (const k of keys) {
            if (k === s || k.endsWith(s) || k.includes(s)) {
                hits += 1;
                break;
            }
        }
    }
    return hits >= 2;
}

function arrayLooksLikeOrdersList(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return false;
    if (typeof arr[0] !== 'object' || arr[0] === null || Array.isArray(arr[0])) return false;
    const hits = arr.filter(looksLikeOrderRow).length;
    const idHits = arr.filter(
        (row) => pickFirstDefined(row, ['id', 'Id', 'orderId', 'OrderId']) != null
    ).length;
    return hits >= Math.max(1, Math.ceil(arr.length * 0.4)) || idHits >= Math.ceil(arr.length * 0.5);
}

/**
 * When the API wraps the list in a non-standard envelope, depth-first search
 * for the first array of plain objects that look like orders.
 */
export function deepExtractOrderLikeArray(value, depth = 0, maxDepth = 10, seen = new WeakSet()) {
    if (value == null || depth > maxDepth) return [];
    if (typeof value !== 'object') return [];

    if (seen.has(value)) return [];
    if (depth > 0) seen.add(value);

    if (Array.isArray(value)) {
        if (
            value.length > 0 &&
            typeof value[0] === 'object' &&
            value[0] !== null &&
            !Array.isArray(value[0]) &&
            value.every((row) => typeof row === 'object' && row !== null && !Array.isArray(row))
        ) {
            if (arrayLooksLikeOrdersList(value)) return value;
        }
        for (const el of value) {
            const inner = deepExtractOrderLikeArray(el, depth + 1, maxDepth, seen);
            if (inner.length) return inner;
        }
        return [];
    }

    for (const k of Object.keys(value)) {
        const inner = deepExtractOrderLikeArray(value[k], depth + 1, maxDepth, seen);
        if (inner.length) return inner;
    }
    return [];
}

/**
 * Shallow extract first; if empty, try deep search (non-standard JSON shapes).
 */
export function extractOrdersListWithFallback(data) {
    const shallow = extractListFromApiData(data);
    if (Array.isArray(shallow) && arrayLooksLikeOrdersList(shallow)) return shallow;
    let body = data;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch {
            return [];
        }
    }
    const deep = deepExtractOrderLikeArray(body);
    if (deep.length) return deep;
    return Array.isArray(shallow) && shallow.length > 0 ? shallow : [];
}

/** When the envelope is unknown, pick the longest array of objects that looks like orders. */
export function findBestOrderCandidateArray(root, maxDepth = 18) {
    const candidates = [];

    const walk = (node, depth) => {
        if (node == null || depth > maxDepth) return;
        if (typeof node !== 'object') return;

        if (Array.isArray(node)) {
            if (
                node.length > 0 &&
                typeof node[0] === 'object' &&
                node[0] !== null &&
                !Array.isArray(node[0])
            ) {
                const idLike = node.filter(
                    (row) => pickFirstDefined(row, ['id', 'Id', 'orderId', 'OrderId']) != null
                ).length;
                const score = idLike * 10000 + node.length;
                candidates.push({ arr: node, score });
            }
            for (const el of node) walk(el, depth + 1);
            return;
        }

        for (const k of Object.keys(node)) {
            walk(node[k], depth + 1);
        }
    };

    walk(root, 0);
    if (!candidates.length) return [];
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0].arr;
}


export function getOrderSortTimestamp(order) {
    const raw =
        pickFirstDefined(order, ['createdAt', 'CreatedAt', 'orderDate', 'OrderDate', 'date', 'Date']) ??
        0;
    const t = new Date(raw).getTime();
    return Number.isFinite(t) ? t : 0;
}

export function getOrderTotalNumber(order) {
    const raw =
        pickFirstDefined(order, [
            'total',
            'Total',
            'orderTotal',
            'OrderTotal',
            'subtotal',
            'Subtotal',
            'grandTotal',
            'GrandTotal',
            'amount',
            'Amount',
            'price',
            'Price',
        ]) ?? 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
}

/**
 * Normalize a single admin order to camelCase fields the UI expects.
 */
export function normalizeAdminOrder(raw) {
    if (!raw || typeof raw !== 'object') return null;

    const diRaw =
        raw.deliveryInfo ??
        raw.DeliveryInfo ??
        raw.shippingAddress ??
        raw.ShippingAddress ??
        raw.shipping ??
        raw.Shipping ??
        {};
    const user = raw.user ?? raw.User ?? raw.customer ?? raw.Customer ?? raw.applicationUser ?? raw.ApplicationUser ?? {};
    const fullName =
        pickFirstDefined(diRaw, ['fullName', 'FullName']) ??
        pickFirstDefined(user, ['fullName', 'FullName', 'name', 'Name', 'userName', 'UserName', 'displayName', 'DisplayName']) ??
        pickFirstDefined(raw, ['customerName', 'CustomerName', 'fullName', 'FullName', 'buyerName', 'BuyerName']) ??
        '';
    const phone =
        pickFirstDefined(diRaw, ['phone', 'Phone']) ??
        pickFirstDefined(user, ['phone', 'Phone', 'phoneNumber', 'PhoneNumber']) ??
        pickFirstDefined(raw, ['customerPhone', 'CustomerPhone', 'phoneNumber', 'PhoneNumber']) ??
        '';
    const email =
        pickFirstDefined(diRaw, ['email', 'Email']) ??
        pickFirstDefined(user, ['email', 'Email']) ??
        pickFirstDefined(raw, ['customerEmail', 'CustomerEmail', 'email', 'Email', 'userEmail', 'UserEmail']) ??
        '';
    const address =
        pickFirstDefined(diRaw, ['address', 'Address', 'street', 'Street', 'line1', 'Line1']) ?? '';
    const city = pickFirstDefined(diRaw, ['city', 'City']) ?? pickFirstDefined(raw, ['city', 'City']) ?? '';

    const deliveryInfo = {
        fullName,
        phone,
        address,
        city,
        email,
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
