import { Link } from 'react-router-dom';
import placeholderImg from '../assets/unnamed.png';
import courtTypeLabel from '../features/courts/courtTypeLabel';

const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN').format(price) + 'đ';

export default function CourtCard({ court }) {
    return (
        <div className="overflow-hidden rounded-xl border border-outline bg-neutral-50 shadow-soft">
            <div className="relative h-60 w-full bg-neutral-200">
                <img
                    src={court.image || placeholderImg}
                    alt={court.name}
                    className="h-full w-full object-cover"
                />
                {court.rating != null && (
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background px-2 py-1 text-xs font-semibold text-neutral-900 shadow-soft">
                        ★ {court.rating.toFixed(1)}
                    </span>
                )}
            </div>

            <div className="p-4">
                <h3 className="font-headline text-lg font-semibold text-neutral-900">
                    {court.name}
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                    {courtTypeLabel[court.court_type]} • {court.address}
                </p>

                <div className="mt-4 flex items-center justify-between">
                    <span className="font-semibold text-primary">
                        {formatPrice(court.price_per_hour)}/giờ
                    </span>
                    <Link
                        to={`/courts/${court.id}`}
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
                    >
                        Đặt ngay
                    </Link>
                </div>
            </div>
        </div>
    );
}
