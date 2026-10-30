import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../features/auth/useAuthStore';
import AdminService from '../features/admin/AdminService';
import AdminSidebar from '../components/AdminSidebar';
import { bookingStatusLabel, bookingStatusClass } from '../features/bookings/bookingStatus';
import courtTypeLabel from '../features/courts/courtTypeLabel';

const PAGE_SIZE = 8;

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

const canCancel = (status) => status === 'PENDING_PAYMENT' || status === 'CONFIRMED';
const canComplete = (status) => status === 'CONFIRMED';

const AdminBookingsPage = () => {
    const { user } = useAuthStore();
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [processingId, setProcessingId] = useState(null);

    const loadBookings = () => {
        AdminService.getAllBookings()
            .then((data) => setBookings(data))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        if (user?.role !== 'ADMIN') return;
        loadBookings();
    }, [user]);

    if (!user || user.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    const filteredBookings = bookings.filter((booking) => {
        const term = search.trim().toLowerCase();
        const matchesSearch =
            term === '' ||
            booking.customerName.toLowerCase().includes(term) ||
            booking.courtName.toLowerCase().includes(term) ||
            (booking.customerPhone || '').toLowerCase().includes(term);
        const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
    const pagedBookings = filteredBookings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const onCancel = (booking) => {
        if (!window.confirm(`Huỷ booking #${booking.id} của ${booking.customerName}?`)) return;

        setProcessingId(booking.id);
        AdminService.cancelBooking(booking.id)
            .then((updated) => {
                setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
                toast.success('Đã huỷ booking.');
            })
            .catch(() => toast.error('Không thể huỷ booking.'))
            .finally(() => setProcessingId(null));
    };

    const onComplete = (booking) => {
        const remaining = formatPrice(booking.remainingAmount);
        if (!window.confirm(`Xác nhận đã thu ${remaining} tiền còn lại tại quầy và đánh dấu hoàn thành?`)) return;

        setProcessingId(booking.id);
        AdminService.completeBooking(booking.id)
            .then((updated) => {
                setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
                toast.success('Đã xác nhận thanh toán và hoàn thành booking.');
            })
            .catch(() => toast.error('Không thể hoàn thành booking.'))
            .finally(() => setProcessingId(null));
    };

    return (
        <div className="flex h-svh bg-background">
            <AdminSidebar />

            <main className="min-h-0 flex-1 overflow-y-auto p-8">
                <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">
                        Tổng quan
                    </span>
                    <h1 className="font-headline text-2xl font-semibold text-neutral-900">
                        Quản lý Booking
                    </h1>
                </div>

                <div className="mt-6 flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Tìm theo tên khách, số điện thoại hoặc tên sân..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="flex-1 rounded-xl border border-outline bg-neutral-50 px-4 py-2.5 text-sm outline-none focus:border-primary"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="rounded-xl border border-outline bg-neutral-50 px-4 py-2.5 text-sm text-neutral-600"
                    >
                        <option value="ALL">Lọc theo trạng thái</option>
                        <option value="PENDING_PAYMENT">Chờ thanh toán</option>
                        <option value="CONFIRMED">Đã xác nhận</option>
                        <option value="COMPLETED">Hoàn thành</option>
                        <option value="CANCELLED">Đã huỷ</option>
                        <option value="NO_SHOW">Không tới</option>
                    </select>
                </div>

                <div className="mt-6 rounded-xl border border-outline bg-neutral-50">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="text-xs uppercase tracking-wide text-neutral-500">
                                <th className="p-4 font-medium">Khách Hàng</th>
                                <th className="p-4 font-medium">SĐT</th>
                                <th className="p-4 font-medium">Sân</th>
                                <th className="p-4 font-medium">Ngày & Giờ</th>
                                <th className="p-4 font-medium">Trạng Thái</th>
                                <th className="p-4 font-medium">Số Tiền</th>
                                <th className="p-4 font-medium">Còn Lại</th>
                                <th className="p-4 text-right font-medium">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="p-6 text-center text-neutral-500">
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : pagedBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-6 text-center text-neutral-500">
                                        Không tìm thấy booking nào.
                                    </td>
                                </tr>
                            ) : (
                                pagedBookings.map((booking) => (
                                    <tr key={booking.id} className="border-t border-outline">
                                        <td className="p-4 text-neutral-900">{booking.customerName}</td>
                                        <td className="p-4 text-neutral-600">{booking.customerPhone || '—'}</td>
                                        <td className="p-4 text-neutral-600">
                                            {booking.courtName} - {courtTypeLabel[booking.courtType]}
                                        </td>
                                        <td className="p-4 text-neutral-600">
                                            {booking.bookingDate}, {booking.startTime.slice(0, 5)} - {booking.endTime.slice(0, 5)}
                                        </td>
                                        <td className="p-4">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${bookingStatusClass[booking.status]}`}>
                                                {bookingStatusLabel[booking.status]}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-neutral-900">
                                            {formatPrice(booking.amount)}
                                        </td>
                                        <td className="p-4 font-medium text-neutral-900">
                                            {canComplete(booking.status) ? formatPrice(booking.remainingAmount) : '—'}
                                        </td>
                                        <td className="p-4 text-right">
                                            {canComplete(booking.status) && (
                                                <button
                                                    type="button"
                                                    onClick={() => onComplete(booking)}
                                                    disabled={processingId === booking.id}
                                                    className="mr-2 rounded-lg px-2 py-1 text-xs font-medium text-success hover:bg-success-bg disabled:opacity-50"
                                                >
                                                    Hoàn thành
                                                </button>
                                            )}
                                            {canCancel(booking.status) && (
                                                <button
                                                    type="button"
                                                    onClick={() => onCancel(booking)}
                                                    disabled={processingId === booking.id}
                                                    className="rounded-lg px-2 py-1 text-xs font-medium text-error hover:bg-error-bg disabled:opacity-50"
                                                >
                                                    Huỷ
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredBookings.length > 0 && (
                    <div className="mt-4 flex items-center justify-between text-sm text-neutral-500">
                        <span>
                            Hiển thị {pagedBookings.length} trên tổng số {filteredBookings.length} booking
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="rounded-lg px-2 py-1 hover:bg-neutral-100 disabled:opacity-30"
                            >
                                ‹
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPage(p)}
                                    className={
                                        p === page
                                            ? 'flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white'
                                            : 'flex h-7 w-7 items-center justify-center rounded-full hover:bg-neutral-100'
                                    }
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                type="button"
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="rounded-lg px-2 py-1 hover:bg-neutral-100 disabled:opacity-30"
                            >
                                ›
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminBookingsPage;
