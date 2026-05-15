import { useMemo, useState } from 'react';
import useAdminStore from '../store/useAdminStore';
import { countDuplicateProducts } from '../utils/productUtils';

const RemoveDuplicateProducts = ({ onComplete }) => {
    const products = useAdminStore((s) => s.products);
    const removeDuplicateProducts = useAdminStore((s) => s.removeDuplicateProducts);
    const [removing, setRemoving] = useState(false);

    const duplicateCount = useMemo(() => countDuplicateProducts(products), [products]);

    const handleRemove = async () => {
        if (duplicateCount === 0) {
            onComplete?.('No duplicate products found.');
            return;
        }

        const msg =
            `Remove ${duplicateCount} duplicate product(s)?\n\n` +
            'For each product name, the oldest entry (lowest ID) is kept; extras are deleted from the database.';
        if (!window.confirm(msg)) return;

        setRemoving(true);
        try {
            const { removed, failed } = await removeDuplicateProducts();
            if (failed > 0) {
                onComplete?.(`Removed ${removed} duplicate(s). ${failed} could not be deleted.`);
            } else {
                onComplete?.(`Removed ${removed} duplicate product(s).`);
            }
        } catch (err) {
            onComplete?.('Failed to remove duplicates. Please try again.', true);
        } finally {
            setRemoving(false);
        }
    };

    return (
        <button
            type="button"
            className="admin-btn"
            style={{
                marginLeft: 12,
                background: duplicateCount > 0 ? '#ff9f0a' : 'rgba(255,255,255,0.08)',
                color: duplicateCount > 0 ? '#1c1c1e' : 'var(--admin-text-muted)',
            }}
            onClick={handleRemove}
            disabled={removing || products.length === 0}
            title={
                duplicateCount > 0
                    ? `${duplicateCount} duplicate(s) detected by product name`
                    : 'No duplicates detected'
            }
        >
            {removing ? (
                <>
                    <i className="fa-solid fa-spinner fa-spin" /> Removing…
                </>
            ) : (
                <>
                    <i className="fa-solid fa-clone" /> Remove Duplicates
                    {duplicateCount > 0 ? ` (${duplicateCount})` : ''}
                </>
            )}
        </button>
    );
};

export default RemoveDuplicateProducts;
