import { useEffect, useState } from 'react';
import CourtCard from '../components/CourtCard';
import CourtService from '../features/courts/CourtService';

const HomePage = () => {
    const [courts, setCourts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        CourtService.getAllCourts()
            .then((data) => setCourts(data))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="bg-background">
            <section className="relative flex min-h-[720px] items-center justify-center bg-gradient-to-br from-primary/40 via-tertiary/20 to-primary/30 px-4 text-center">
                <div>
                    <h1 className="font-headline text-4xl font-bold text-neutral-900">
                        Tìm Sân Chơi,{' '}
                        <span className="text-primary">Kết Nối Đam Mê.</span>
                    </h1>

                    <form className="mt-8 flex flex-wrap items-center justify-center gap-2 rounded-full bg-background p-2 shadow-soft">
                        <input
                            type="text"
                            placeholder="Thành phố"
                            className="rounded-full border-none bg-transparent px-4 py-2 text-sm text-neutral-700 outline-none placeholder:text-neutral-400"
                        />
                        <input
                            type="date"
                            className="rounded-full border-none bg-transparent px-4 py-2 text-sm text-neutral-700 outline-none"
                        />
                        <select className="rounded-full border-none bg-transparent px-4 py-2 text-sm text-neutral-700 outline-none">
                            <option>Bất kỳ lúc</option>
                        </select>
                        <button
                            type="submit"
                            className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
                        >
                            Tìm Kiếm
                        </button>
                    </form>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-12">
                <h2 className="font-headline text-2xl font-semibold text-neutral-900">
                    Sân Phổ Biến Nhất
                </h2>
                <p className="mt-1 text-neutral-500">
                    Khám phá các cụm sân được yêu thích tuần này.
                </p>

                {isLoading ? (
                    <p className="mt-8 text-neutral-500">Đang tải danh sách sân...</p>
                ) : courts.length === 0 ? (
                    <p className="mt-8 text-neutral-500">Hiện chưa có sân nào.</p>
                ) : (
                    <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {courts.map((court) => (
                            <CourtCard key={court.id} court={court} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default HomePage;
