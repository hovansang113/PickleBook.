import { useEffect, useState } from 'react';
import CourtCard from '../components/CourtCard';
import CourtService from '../features/courts/CourtService';

const filters = [
    { label: 'Tất cả', value: 'ALL' },
    { label: 'Trong nhà', value: 'INSIDE' },
    { label: 'Ngoài trời', value: 'OUTSIDE' },
];

const CourtsPage = () => {
    const [courts, setCourts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('ALL');

    useEffect(() => {
        CourtService.getAllCourts()
            .then((data) => setCourts(data))
            .finally(() => setIsLoading(false));
    }, []);

    const filteredCourts =
        activeFilter === 'ALL'
            ? courts
            : courts.filter((court) => court.court_type === activeFilter);

    return (
        <div className="mx-auto max-w-6xl px-4 py-12">
            <h1 className="font-headline text-3xl font-semibold text-neutral-900">
                Danh Sách Sân
            </h1>
            <p className="mt-1 text-neutral-500">
                Chọn sân phù hợp với nhu cầu của bạn.
            </p>

            <div className="mt-6 flex items-center gap-2">
                <span className="text-sm text-neutral-500">Lọc theo:</span>
                {filters.map((filter) => (
                    <button
                        key={filter.value}
                        type="button"
                        onClick={() => setActiveFilter(filter.value)}
                        className={
                            activeFilter === filter.value
                                ? 'rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white'
                                : 'rounded-full border border-outline px-4 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100'
                        }
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <p className="mt-8 text-neutral-500">Đang tải danh sách sân...</p>
            ) : filteredCourts.length === 0 ? (
                <p className="mt-8 text-neutral-500">Không có sân nào phù hợp.</p>
            ) : (
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredCourts.map((court) => (
                        <CourtCard key={court.id} court={court} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CourtsPage;
