import adminApi from './adminApi';
import { extractOrdersListWithFallback, normalizeAdminOrders } from '../utils/adminOrdersUtils';

/**
 * Single source for admin orders list: GET /api/Admin/Orders (via shared axios instance).
 */
export async function loadAdminOrdersFromApi() {
    const res = await adminApi.getOrders();
    const rawList = extractOrdersListWithFallback(res.data);
    return normalizeAdminOrders(rawList);
}

export { extractListFromApiData, normalizeAdminOrders } from '../utils/adminOrdersUtils';
