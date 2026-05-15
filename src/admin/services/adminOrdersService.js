import adminApi from './adminApi';
import {
    extractOrdersListWithFallback,
    findBestOrderCandidateArray,
    normalizeAdminOrders,
} from '../utils/adminOrdersUtils';

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
