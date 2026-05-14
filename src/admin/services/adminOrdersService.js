import adminApi from './adminApi';
import {
    extractOrdersListWithFallback,
    findBestOrderCandidateArray,
    normalizeAdminOrders,
} from '../utils/adminOrdersUtils';

/**
 * Single source for admin orders list: GET /api/Admin/Orders (same axios instance + Bearer as Orders page).
 * Handles root arrays, common ASP.NET envelopes, and a scored deep fallback when the shape is non-standard.
 */
export async function loadAdminOrdersFromApi() {
    const res = await adminApi.getOrders();
    const data = res?.data;

    let rawList = [];

    if (Array.isArray(data)) {
        rawList = data;
    } else if (data != null && typeof data === 'object') {
        rawList = extractOrdersListWithFallback(data);
        if (!rawList.length) {
            rawList = findBestOrderCandidateArray(data);
        }
    }

    return normalizeAdminOrders(Array.isArray(rawList) ? rawList : []);
}

export { extractListFromApiData, normalizeAdminOrders } from '../utils/adminOrdersUtils';
