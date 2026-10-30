import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import BookingService from '../features/bookings/BookingService';
import { bookingStatusLabel, bookingStatusClass } from '../features/bookings/bookingStatus';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

const weekdayLabel = (dateStr) => {
    const date = new Date(dateStr);
    return `${['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()]}, ${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
};

const canCancel = (status) => status === 'PENDING_PAYMENT' || status === 'CONFIRMED';

const MyBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        BookingService.getMyBookings()
            .then((data) => setBookings(data))
            .finally(() => setIsLoading(false));
    }, []);

    const onCancel = (bookingId) => {
        setCancellingId(bookingId);
        BookingService.cancelBooking(bookingId)
            .then((updated) => {
                setBookings((prev) =>
                    prev.map((b) => (b.id === updated.id ? updated : b)),
                );
                toast.success('Đã huỷ booking.');
            })
            .catch(() => toast.error('Không thể huỷ booking, vui lòng thử lại.'))
            .finally(() => setCancellingId(null));
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <h1 className="font-headline text-2xl font-semibold text-neutral-900">
                Lịch sử đặt sân
            </h1>

            {isLoading ? (
                <p className="mt-8 text-neutral-500">Đang tải...</p>
            ) : bookings.length === 0 ? (
                <p className="mt-8 text-neutral-500">Bạn chưa có booking nào.</p>
            ) : (
                <div className="mt-6 flex flex-col gap-4">
                    {bookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="flex flex-col gap-3 rounded-xl border border-outline bg-neutral-50 p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-neutral-900">{booking.courtName}</p>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${bookingStatusClass[booking.status]}`}>
                                        {bookingStatusLabel[booking.status]}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-neutral-500">
                                    {weekdayLabel(booking.bookingDate)} · {booking.startTime.slice(0, 5)} - {booking.endTime.slice(0, 5)}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="font-semibold text-primary">
                                    {formatPrice(booking.totalPrice)}
                                </span>
                                {canCancel(booking.status) && (
                                    <button
                                        type="button"
                                        onClick={() => onCancel(booking.id)}
                                        disabled={cancellingId === booking.id}
                                        className="rounded-xl border border-error px-4 py-2 text-sm font-medium text-error hover:bg-error-bg disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {cancellingId === booking.id ? 'Đang huỷ...' : 'Huỷ'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookingsPage;
