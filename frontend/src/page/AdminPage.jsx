import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import useAuthStore from '../features/auth/useAuthStore';
import AdminService from '../features/admin/AdminService';
import AdminSidebar from '../components/AdminSidebar';
import { bookingStatusLabel, bookingStatusClass } from '../features/bookings/bookingStatus';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

const formatCompactPrice = (price) => {
    if (price >= 1_000_000) return `đ${(price / 1_000_000).toFixed(1)}M`;
    if (price >= 1_000) return `đ${(price / 1_000).toFixed(0)}K`;
    return formatPrice(price);
};

const AdminPage = () => {
    const { user } = useAuthStore();
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.role !== 'ADMIN') return;
        AdminService.getDashboardStats()
            .then((data) => setStats(data))
            .finally(() => setIsLoading(false));
    }, [user]);

    if (!user || user.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex h-svh bg-background">
            <AdminSidebar />

            {/* Main content */}
            <main className="min-h-0 flex-1 overflow-y-auto p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-headline text-2xl font-semibold text-neutral-900">
                            Bảng Điều Khiển
                        </h1>
                        <p className="mt-1 text-neutral-500">
                            Tổng quan hoạt động kinh doanh hôm nay.
                        </p>
                    </div>
                    <span className="rounded-full border border-outline bg-neutral-50 px-4 py-2 text-sm text-neutral-500">
                        Cập nhật lần cuối: Vừa xong
                    </span>
                </div>

                {isLoading ? (
                    <p className="mt-8 text-neutral-500">Đang tải dữ liệu...</p>
                ) : (
                    <>
                        {/* Stat cards */}
                        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl border border-outline bg-neutral-50 p-5">
                                <p className="text-sm text-neutral-500">Tổng Doanh Thu</p>
                                <p className="mt-2 text-2xl font-semibold text-neutral-900">
                                    {formatCompactPrice(stats.totalRevenue)}
                                </p>
                                <p className={`mt-1 text-xs ${stats.revenueChangePercent >= 0 ? 'text-success' : 'text-error'}`}>
                                    {stats.revenueChangePercent >= 0 ? '↗' : '↘'} {Math.abs(stats.revenueChangePercent).toFixed(1)}% so với tuần trước
                                </p>
                            </div>

                            <div className="rounded-xl border border-outline bg-neutral-50 p-5">
                                <p className="text-sm text-neutral-500">Tổng Lượt Đặt</p>
                                <p className="mt-2 text-2xl font-semibold text-neutral-900">
                                    {stats.totalBookings}
                                </p>
                                <p className="mt-1 text-xs text-neutral-400">Tổng cộng từ trước tới nay</p>
                            </div>

                            <div className="rounded-xl border border-outline bg-neutral-50 p-5">
                                <p className="text-sm text-neutral-500">Người Dùng Hoạt Động</p>
                                <p className="mt-2 text-2xl font-semibold text-neutral-900">
                                    {stats.activeUsers}
                                </p>
                                <p className="mt-1 text-xs text-neutral-400">→ Ổn định</p>
                            </div>

                            <div className="rounded-xl border border-outline bg-neutral-50 p-5">
                                <p className="text-sm text-neutral-500">Tỷ Lệ Lấp Đầy (hôm nay)</p>
                                <p className="mt-2 text-2xl font-semibold text-neutral-900">
                                    {stats.fillRate.toFixed(0)}%
                                </p>
                                <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-200">
                                    <div
                                        className="h-1.5 rounded-full bg-primary"
                                        style={{ width: `${Math.min(100, stats.fillRate)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Weekly revenue chart */}
                        <div className="mt-6 rounded-xl border border-outline bg-neutral-50 p-5">
                            <p className="font-semibold text-neutral-900">Doanh Thu Hàng Tuần</p>
                            <div className="mt-4 h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.weeklyRevenue}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e6e0d2" vertical={false} />
                                        <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#7d7460' }} axisLine={false} tickLine={false} />
                                        <YAxis
                                            tick={{ fontSize: 12, fill: '#7d7460' }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(value) => formatCompactPrice(value)}
                                        />
                                        <Tooltip formatter={(value) => formatPrice(value)} />
                                        <Bar dataKey="revenue" fill="#4a7c59" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent bookings */}
                        <div className="mt-6 rounded-xl border border-outline bg-neutral-50 p-5">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold text-neutral-900">Đặt Sân Gần Đây</p>
                            </div>
                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="text-neutral-500">
                                            <th className="pb-3 font-medium">Khách Hàng</th>
                                            <th className="pb-3 font-medium">Sân</th>
                                            <th className="pb-3 font-medium">Ngày & Giờ</th>
                                            <th className="pb-3 font-medium">Trạng Thái</th>
                                            <th className="pb-3 text-right font-medium">Số Tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentBookings.map((booking) => (
                                            <tr key={booking.id} className="border-t border-outline">
                                                <td className="py-3 text-neutral-900">{booking.customerName}</td>
                                                <td className="py-3 text-neutral-600">
                                                    {booking.courtName} - {booking.courtType === 'INSIDE' ? 'Trong nhà' : 'Ngoài trời'}
                                                </td>
                                                <td className="py-3 text-neutral-600">
                                                    {booking.bookingDate}, {booking.startTime.slice(0, 5)} - {booking.endTime.slice(0, 5)}
                                                </td>
                                                <td className="py-3">
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${bookingStatusClass[booking.status]}`}>
                                                        {bookingStatusLabel[booking.status]}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right font-medium text-neutral-900">
                                                    {formatPrice(booking.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminPage;
