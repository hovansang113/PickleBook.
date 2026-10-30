import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../features/auth/useAuthStore';
import AdminService from '../features/admin/AdminService';
import courtTypeLabel from '../features/courts/courtTypeLabel';
import AdminSidebar from '../components/AdminSidebar';

const PAGE_SIZE = 5;

const statusLabel = {
    ACTIVE: 'Hoạt động',
    INACTIVE: 'Ngừng hoạt động',
    MAINTENANCE: 'Bảo trì',
};

const statusClass = {
    ACTIVE: 'bg-success-bg text-success',
    INACTIVE: 'bg-neutral-200 text-neutral-700',
    MAINTENANCE: 'bg-warning-bg text-warning',
};

const emptyForm = {
    name: '',
    description: '',
    address: '',
    image: '',
    price_per_hour: '',
    open_time: '06:00',
    close_time: '22:00',
    slot_duration_minutes: 60,
    status: 'ACTIVE',
    court_type: 'INSIDE',
};

const AdminCourtsPage = () => {
    const { user } = useAuthStore();
    const [courts, setCourts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [isSaving, setIsSaving] = useState(false);

    const loadCourts = () => {
        AdminService.getAllCourts()
            .then((data) => setCourts(data))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        if (user?.role !== 'ADMIN') return;
        loadCourts();
    }, [user]);

    if (!user || user.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    const filteredCourts = courts.filter((court) => {
        const matchesSearch = court.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || court.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filteredCourts.length / PAGE_SIZE));
    const pagedCourts = filteredCourts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const openCreateModal = () => {
        setEditingId(null);
        setForm(emptyForm);
        setIsModalOpen(true);
    };

    const openEditModal = (court) => {
        setEditingId(court.id);
        setForm({
            name: court.name,
            description: court.description,
            address: court.address,
            image: court.image || '',
            price_per_hour: court.price_per_hour,
            open_time: court.open_time,
            close_time: court.close_time,
            slot_duration_minutes: court.slot_duration_minutes,
            status: court.status,
            court_type: court.court_type,
        });
        setIsModalOpen(true);
    };

    const onFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);

        const payload = {
            ...form,
            price_per_hour: Number(form.price_per_hour),
            slot_duration_minutes: Number(form.slot_duration_minutes),
        };

        const request = editingId
            ? AdminService.updateCourt(editingId, payload)
            : AdminService.createCourt(payload);

        request
            .then(() => {
                toast.success(editingId ? 'Đã cập nhật sân.' : 'Đã thêm sân mới.');
                setIsModalOpen(false);
                loadCourts();
            })
            .catch(() => toast.error('Không thể lưu sân, vui lòng kiểm tra lại thông tin.'))
            .finally(() => setIsSaving(false));
    };

    const onDelete = (court) => {
        if (!window.confirm(`Xoá sân "${court.name}"? Hành động này không thể hoàn tác.`)) {
            return;
        }

        AdminService.deleteCourt(court.id)
            .then(() => {
                toast.success('Đã xoá sân.');
                loadCourts();
            })
            .catch((err) => {
                const message = err.response?.data?.message || 'Không thể xoá sân.';
                toast.error(message);
            });
    };

    return (
        <div className="flex h-svh bg-background">
            <AdminSidebar />

            <main className="min-h-0 flex-1 overflow-y-auto p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">
                            Tổng quan
                        </span>
                        <h1 className="font-headline text-2xl font-semibold text-neutral-900">
                            Quản lý Sân
                        </h1>
                    </div>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
                    >
                        + Thêm sân mới
                    </button>
                </div>

                <div className="mt-6 flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Tìm kiếm tên sân..."
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
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="MAINTENANCE">Bảo trì</option>
                        <option value="INACTIVE">Ngừng hoạt động</option>
                    </select>
                </div>

                <div className="mt-6 rounded-xl border border-outline bg-neutral-50">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="text-xs uppercase tracking-wide text-neutral-500">
                                <th className="p-4 font-medium">Sân Pickleball</th>
                                <th className="p-4 font-medium">Trạng Thái</th>
                                <th className="p-4 font-medium">Giá Thuê (VND/giờ)</th>
                                <th className="p-4 text-right font-medium">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center text-neutral-500">
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : pagedCourts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center text-neutral-500">
                                        Không tìm thấy sân nào.
                                    </td>
                                </tr>
                            ) : (
                                pagedCourts.map((court) => (
                                    <tr key={court.id} className="border-t border-outline">
                                        <td className="flex items-center gap-3 p-4">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-lg">
                                                🎾
                                            </span>
                                            <div>
                                                <p className="font-medium text-neutral-900">{court.name}</p>
                                                <p className="text-xs text-neutral-500">
                                                    {courtTypeLabel[court.court_type]}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass[court.status]}`}>
                                                {statusLabel[court.status]}
                                            </span>
                                        </td>
                                        <td className="p-4 text-neutral-900">
                                            {new Intl.NumberFormat('vi-VN').format(court.price_per_hour)}đ
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(court)}
                                                className="mr-2 rounded-lg px-2 py-1 text-neutral-500 hover:bg-neutral-100 hover:text-primary"
                                                aria-label="Sửa"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onDelete(court)}
                                                className="rounded-lg px-2 py-1 text-neutral-500 hover:bg-error-bg hover:text-error"
                                                aria-label="Xoá"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredCourts.length > 0 && (
                    <div className="mt-4 flex items-center justify-between text-sm text-neutral-500">
                        <span>
                            Hiển thị {pagedCourts.length} trên tổng số {filteredCourts.length} sân
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

            {isModalOpen && (
                <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-background p-6 shadow-soft">
                        <h2 className="font-headline text-xl font-semibold text-neutral-900">
                            {editingId ? 'Sửa sân' : 'Thêm sân mới'}
                        </h2>

                        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3">
                            <input
                                name="name"
                                value={form.name}
                                onChange={onFormChange}
                                placeholder="Tên sân"
                                required
                                className="rounded-xl border border-outline bg-neutral-50 px-4 py-2.5 text-sm outline-none focus:border-primary"
                            />
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={onFormChange}
                                placeholder="Mô tả"
                                required
                                rows={2}
                                className="rounded-xl border border-outline bg-neutral-50 px-4 py-2.5 text-sm outline-none focus:border-primary"
                            />
                            <input
                                name="address"
                                value={form.address}
                                onChange={onFormChange}
                                placeholder="Địa chỉ"
                                required
                                className="rounded-xl border border-outline bg-neutral-50 px-4 py-2.5 text-sm outline-none focus:border-primary"
                            />
                            <input
                                name="image"
                                value={form.image}
                                onChange={onFormChange}
                                placeholder="URL ảnh (không bắt buộc)"
                                className="rounded-xl border border-outline bg-neutral-50 px-4 py-2.5 text-sm outline-none focus:border-primary"
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="number"
                                    name="price_per_hour"
                                    value={form.price_per_hour}
                                    onChange={onFormChange}
                                    placeholder="Giá / giờ"
                                    required
                                    min="0"
                                    className="rounded-xl border border-outline bg-neutral-50 px-4 py-2.5 text-sm outline-none focus:border-primary"
                                />
                                <input
                                    type="number"
                                    name="slot_duration_minutes"
                                    value={form.slot_duration_minutes}
                                    onChange={onFormChange}
                                    placeholder="Phút / khung giờ"
                                    required
                                    min="1"
                                    className="rounded-xl border border-outline bg-neutral-50 px-4 py-2.5 text-sm outline-none focus:border-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex flex-col gap-1 text-xs text-neutral-500">
                                    Giờ mở cửa
                                    <input
                                        type="time"
                                        name="open_time"
                                        value={form.open_time.slice(0, 5)}
                                        onChange={onFormChange}
                                        required
                                        className="rounded-xl border border-outline bg-neutral-50 px-4 py-2.5 text-sm outline-none focus:border-primary"
                                    />
                                </label>
                                <label className="flex flex-col gap-1 text-xs text-neutral-500">
                                    Giờ đóng cửa
                                    <input
                                        type="time"
                                        name="close_time"
                                        value={form.close_time.slice(0, 5)}
                                        onChange={onFormChange}
                                        required
                                        className="rounded-xl border border-outline bg-neutral-50 px-4 py-2.5 text-sm outline-none focus:border-primary"
                                    />
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <select
                                    name="court_type"
                                    value={form.court_type}
                                    onChange={onFormChange}
                                    className="rounded-xl border border-outline bg-neutral-50 px-4 py-2.5 text-sm"
                                >
                                    <option value="INSIDE">Trong nhà</option>
                                    <option value="OUTSIDE">Ngoài trời</option>
                                </select>
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={onFormChange}
                                    className="rounded-xl border border-outline bg-neutral-50 px-4 py-2.5 text-sm"
                                >
                                    <option value="ACTIVE">Hoạt động</option>
                                    <option value="MAINTENANCE">Bảo trì</option>
                                    <option value="INACTIVE">Ngừng hoạt động</option>
                                </select>
                            </div>

                            <div className="mt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-xl border border-outline px-5 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                                >
                                    Huỷ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
                                >
                                    {isSaving ? 'Đang lưu...' : 'Lưu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCourtsPage;
