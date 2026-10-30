import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import placeholderImg from '../assets/unnamed.png';
import courtTypeLabel from '../features/courts/courtTypeLabel';
import CourtService from '../features/courts/CourtService';
import BookingService from '../features/bookings/BookingService';
import useAuthStore from '../features/auth/useAuthStore';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

const toDateKey = (date) => date.toISOString().slice(0, 10);

const weekdayLabel = (date) =>
    ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()];

const buildNextDays = (count) => {
    const days = [];
    for (let i = 0; i < count; i += 1) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        days.push(date);
    }
    return days;
};

const CourtDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [court, setCourt] = useState(null);
    const [isLoadingCourt, setIsLoadingCourt] = useState(true);

    const days = useMemo(() => buildNextDays(14), []);
    const [selectedDate, setSelectedDate] = useState(days[0]);
    const [slots, setSlots] = useState([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        CourtService.getCourtById(id)
            .then((data) => setCourt(data))
            .finally(() => setIsLoadingCourt(false));
    }, [id]);

    useEffect(() => {
        CourtService.getTimeSlots(id, toDateKey(selectedDate))
            .then((data) => setSlots(data))
            .finally(() => setIsLoadingSlots(false));
    }, [id, selectedDate]);

    const onSelectDate = (date) => {
        setSelectedDate(date);
        setSelectedSlot(null);
        setIsLoadingSlots(true);
    };

    const onBookNow = () => {
        if (!user) {
            toast.info('Vui lòng đăng nhập để đặt sân.');
            navigate('/login');
            return;
        }

        setIsBooking(true);
        BookingService.createBooking({
            courtId: Number(id),
            bookingDate: toDateKey(selectedDate),
            startTime: selectedSlot.startTime,
            endTime: selectedSlot.endTime,
        })
            .then((booking) => {
                navigate('/checkout', { state: booking });
            })
            .catch(() => {
                toast.error('Không thể đặt sân, vui lòng thử lại.');
            })
            .finally(() => setIsBooking(false));
    };

    if (isLoadingCourt) {
        return <p className="mx-auto max-w-6xl px-4 py-12 text-neutral-500">Đang tải...</p>;
    }

    if (!court) {
        return <p className="mx-auto max-w-6xl px-4 py-12 text-neutral-500">Không tìm thấy sân.</p>;
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="overflow-hidden rounded-xl">
                <img
                    src={court.image || placeholderImg}
                    alt={court.name}
                    className="h-72 w-full object-cover"
                />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
                <div>
                    {court.rating != null && (
                        <span className="text-sm font-semibold text-tertiary">
                            ★ {court.rating.toFixed(1)}
                        </span>
                    )}
                    <h1 className="font-headline text-3xl font-semibold text-neutral-900">
                        {court.name}
                    </h1>
                    <p className="mt-1 text-neutral-500">{court.address}</p>

                    <span className="mt-3 inline-block rounded-full border border-outline px-3 py-1 text-sm text-neutral-600">
                        {courtTypeLabel[court.court_type]}
                    </span>

                    <h2 className="mt-8 font-headline text-xl font-semibold text-neutral-900">
                        Về không gian này
                    </h2>
                    <p className="mt-2 text-neutral-600">{court.description}</p>
                </div>

                <div className="h-fit rounded-xl border border-outline bg-neutral-50 p-5 shadow-soft">
                    <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Giá thuê
                    </span>
                    <p className="text-2xl font-semibold text-primary">
                        {formatPrice(court.price_per_hour)}
                        <span className="text-sm font-normal text-neutral-500">/giờ</span>
                    </p>

                    <p className="mt-5 text-sm font-medium text-neutral-700">Chọn ngày</p>
                    <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                        {days.map((date) => {
                            const isSelected = toDateKey(date) === toDateKey(selectedDate);
                            return (
                                <button
                                    key={toDateKey(date)}
                                    type="button"
                                    onClick={() => onSelectDate(date)}
                                    className={
                                        isSelected
                                            ? 'w-12 shrink-0 rounded-lg border border-primary bg-primary/10 py-2 text-center text-sm font-semibold text-primary'
                                            : 'w-12 shrink-0 rounded-lg border border-outline py-2 text-center text-sm text-neutral-600 hover:bg-neutral-100'
                                    }
                                >
                                    <div>{weekdayLabel(date)}</div>
                                    <div>{date.getDate()}</div>
                                </button>
                            );
                        })}
                    </div>

                    <p className="mt-5 text-sm font-medium text-neutral-700">Chọn giờ</p>
                    {isLoadingSlots ? (
                        <p className="mt-2 text-sm text-neutral-500">Đang tải khung giờ...</p>
                    ) : (
                        <div className="mt-2 grid grid-cols-3 gap-2">
                            {slots.map((slot) => {
                                const isSelected = selectedSlot?.startTime === slot.startTime;
                                return (
                                    <button
                                        key={slot.startTime}
                                        type="button"
                                        disabled={!slot.available}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={
                                            !slot.available
                                                ? 'cursor-not-allowed rounded-lg bg-neutral-200 py-2 text-sm text-neutral-400'
                                                : isSelected
                                                ? 'rounded-lg bg-primary py-2 text-sm font-semibold text-white'
                                                : 'rounded-lg border border-outline py-2 text-sm text-neutral-700 hover:bg-neutral-100'
                                        }
                                    >
                                        {slot.startTime.slice(0, 5)}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {selectedSlot && (
                        <div className="mt-5 flex items-center justify-between border-t border-outline pt-4 text-sm">
                            <span className="text-neutral-500">Tổng cộng</span>
                            <span className="font-semibold text-primary">
                                {formatPrice(court.price_per_hour)}
                            </span>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={onBookNow}
                        disabled={!selectedSlot || isBooking}
                        className="mt-4 w-full rounded-xl bg-primary py-3 font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isBooking ? 'Đang xử lý...' : 'Đặt ngay →'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourtDetailPage;
