/**
 * Product list helpers — dedupe on fetch and find duplicates for admin cleanup.
 */

function productId(product) {
    return product?.id ?? product?.Id;
}

function productNameKey(product) {
    const name = (product?.name ?? product?.Name ?? '').trim().toLowerCase();
    return name || null;
}

/** Remove duplicate rows when the same id appears more than once (e.g. pagination overlap). */
export function dedupeProductsById(products) {
    if (!Array.isArray(products)) return [];
    const seen = new Set();
    const out = [];
    for (const p of products) {
        const id = productId(p);
        if (id == null) {
            out.push(p);
            continue;
        }
        const key = String(id);
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(p);
    }
    return out;
}

/**
 * Groups products that share the same name (case-insensitive).
 * Each group with length > 1 is a duplicate set.
 */
export function findDuplicateProductGroups(products) {
    const byName = new Map();
    for (const p of products) {
        const key = productNameKey(p);
        if (!key) continue;
        if (!byName.has(key)) byName.set(key, []);
        byName.get(key).push(p);
    }
    return [...byName.values()].filter((group) => group.length > 1);
}

/**
 * For each duplicate name, keep the product with the lowest numeric id; return ids to delete.
 */
export function getDuplicateProductIdsToDelete(products) {
    const groups = findDuplicateProductGroups(products);
    const toDelete = [];

    for (const group of groups) {
        const sorted = [...group].sort((a, b) => {
            const idA = Number(productId(a)) || 0;
            const idB = Number(productId(b)) || 0;
            return idA - idB;
        });
        for (let i = 1; i < sorted.length; i++) {
            const id = productId(sorted[i]);
            if (id != null) toDelete.push(id);
        }
    }

    return toDelete;
}

export function countDuplicateProducts(products) {
    return getDuplicateProductIdsToDelete(products).length;
}
