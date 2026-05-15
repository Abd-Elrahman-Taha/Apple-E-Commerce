import { useMemo, useState } from 'react';
import useAdminStore from '../store/useAdminStore';
import { needsProductImageFix } from '../../utils/productImages';

const FixProductImages = ({ onComplete }) => {
    const products = useAdminStore((s) => s.products);
    const fixBrokenProductImages = useAdminStore((s) => s.fixBrokenProductImages);
    const [fixing, setFixing] = useState(false);

    const brokenCount = useMemo(
        () => products.filter(needsProductImageFix).length,
        [products]
    );

    const handleFix = async () => {
        if (brokenCount === 0) {
            onComplete?.('All product images are already using working URLs.');
            return;
        }

        if (
            !window.confirm(
                `Update ${brokenCount} product(s) with local image URLs? (Fixes black/broken iPhone images.)`
            )
        ) {
            return;
        }

        setFixing(true);
        try {
            const { updated, failed } = await fixBrokenProductImages();
            if (failed > 0) {
                onComplete?.(`Updated ${updated} product image(s). ${failed} failed.`, true);
            } else {
                onComplete?.(`Updated ${updated} product image(s).`);
            }
        } catch {
            onComplete?.('Failed to update product images.', true);
        } finally {
            setFixing(false);
        }
    };

    return (
        <button
            type="button"
            className="admin-btn"
            style={{
                marginLeft: 12,
                background: brokenCount > 0 ? '#0a84ff' : 'rgba(255,255,255,0.08)',
                color: brokenCount > 0 ? '#fff' : 'var(--admin-text-muted)',
            }}
            onClick={handleFix}
            disabled={fixing || products.length === 0}
        >
            {fixing ? (
                <>
                    <i className="fa-solid fa-spinner fa-spin" /> Fixing images…
                </>
            ) : (
                <>
                    <i className="fa-solid fa-image" /> Fix iPhone Images
                    {brokenCount > 0 ? ` (${brokenCount})` : ''}
                </>
            )}
        </button>
    );
};

export default FixProductImages;
