import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import placeholderImg from '../assets/unnamed.png';
import CourtService from '../features/courts/CourtService';
import BookingService from '../features/bookings/BookingService';

const HOLD_MINUTES = 15;

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

const weekdayLabel = (dateStr) => {
    const date = new Date(dateStr);
    return ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][date.getDay()];
};

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${weekdayLabel(dateStr)}, ${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
};

const formatCountdown = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
};

const CheckoutPage = () => {
    const { state: booking } = useLocation();
    const navigate = useNavigate();
    const [court, setCourt] = useState(null);
    const [secondsLeft, setSecondsLeft] = useState(HOLD_MINUTES * 60);
    const [isPaying, setIsPaying] = useState(false);

    useEffect(() => {
        if (!booking) return;
        CourtService.getCourtById(booking.courtId).then((data) => setCourt(data));
    }, [booking]);

    useEffect(() => {
        if (!booking) return;
        const timer = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [booking]);

    const onConfirmPayment = () => {
        setIsPaying(true);
        BookingService.createVNPayPayment(booking.id)
            .then((data) => {
                window.location.href = data.paymentUrl;
            })
            .catch(() => {
                toast.error('Không thể tạo thanh toán, vui lòng thử lại.');
                setIsPaying(false);
            });
    };

    if (!booking) {
        return (
            <div className="mx-auto max-w-md px-4 py-16 text-center">
                <p className="text-neutral-500">Không tìm thấy thông tin đặt sân.</p>
                <button
                    type="button"
                    onClick={() => navigate('/courts')}
                    className="mt-4 rounded-xl bg-primary px-6 py-2 font-semibold text-white hover:bg-primary-hover"
                >
                    Chọn sân
                </button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <div className="mb-6 flex items-center justify-center gap-2 rounded-full bg-neutral-100 py-2 text-sm text-neutral-700">
                <span>⏱ Thời gian giữ sân còn lại:</span>
                <span className="font-semibold">{formatCountdown(secondsLeft)}</span>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
                <div>
                    <h1 className="font-headline text-2xl font-semibold text-neutral-900">
                        Thanh toán
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Vui lòng xác nhận thanh toán qua VNPay để hoàn tất việc đặt sân của bạn.
                        Chúng tôi bảo mật mọi thông tin giao dịch.
                    </p>

                    <div className="mt-6 flex items-center gap-3 rounded-xl border border-primary bg-primary/10 p-4">
                        <input type="radio" checked readOnly className="accent-primary" />
                        <div>
                            <p className="font-semibold text-neutral-900">Thanh toán qua VNPay</p>
                            <p className="text-sm text-neutral-500">
                                Thẻ ATM/Visa/Mastercard/JCB, ví điện tử, QR Pay
                            </p>
                        </div>
                    </div>
                </div>

                <div className="h-fit rounded-xl border border-outline bg-neutral-50 p-5 shadow-soft">
                    <p className="mb-4 font-semibold text-neutral-900">🧾 Tóm tắt đơn hàng</p>

                    <div className="flex gap-3">
                        <img
                            src={court?.image || placeholderImg}
                            alt={booking.courtName}
                            className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div>
                            <p className="font-medium text-neutral-900">{booking.courtName}</p>
                            {court && <p className="text-sm text-neutral-500">{court.address}</p>}
                        </div>
                    </div>

                    <div className="mt-4 space-y-2 border-t border-outline pt-4 text-sm">
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Ngày đặt</span>
                            <span className="font-medium text-neutral-900">
                                {formatDate(booking.bookingDate)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Giờ chơi</span>
                            <span className="font-medium text-neutral-900">
                                {booking.startTime.slice(0, 5)} - {booking.endTime.slice(0, 5)}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 space-y-2 border-t border-outline pt-4 text-sm">
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Giá thuê sân</span>
                            <span className="text-neutral-900">{formatPrice(booking.totalPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Đặt cọc (thanh toán ngay)</span>
                            <span className="text-neutral-900">{formatPrice(booking.depositAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Còn lại (thanh toán tại sân)</span>
                            <span className="text-neutral-900">{formatPrice(booking.remainingAmount)}</span>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-outline pt-4">
                        <span className="font-medium text-neutral-700">Tổng cộng cần thanh toán</span>
                        <span className="text-xl font-semibold text-primary">
                            {formatPrice(booking.depositAmount)}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onConfirmPayment}
                        disabled={isPaying}
                        className="mt-5 w-full rounded-xl bg-primary py-3 font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isPaying ? 'Đang chuyển tới VNPay...' : '🔒 Xác nhận thanh toán'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
