import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../features/auth/useAuthStore';
import RewardService from '../features/rewards/RewardService';
import { membershipLabel, membershipBadgeClass } from '../features/rewards/membershipLabel';

const redemptionStatusLabel = {
    UNUSED: 'Chưa dùng',
    USED: 'Đã dùng',
    EXPIRED: 'Hết hạn',
};

const redemptionStatusClass = {
    UNUSED: 'bg-success-bg text-success',
    USED: 'bg-neutral-200 text-neutral-700',
    EXPIRED: 'bg-error-bg text-error',
};

const formatDateTime = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleString('vi-VN');
};

const RewardsPage = () => {
    const { user } = useAuthStore();
    const [summary, setSummary] = useState(null);
    const [rewards, setRewards] = useState([]);
    const [redemptions, setRedemptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [redeemingId, setRedeemingId] = useState(null);

    const loadAll = () => {
        Promise.all([
            RewardService.getMySummary(),
            RewardService.getActiveRewards(),
            RewardService.getMyRedemptions(),
        ])
            .then(([summaryData, rewardsData, redemptionsData]) => {
                setSummary(summaryData);
                setRewards(rewardsData);
                setRedemptions(redemptionsData);
            })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        if (!user) return;
        loadAll();
    }, [user]);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const onRedeem = (reward) => {
        setRedeemingId(reward.id);
        RewardService.redeemReward(reward.id)
            .then((redemption) => {
                setRedemptions((prev) => [redemption, ...prev]);
                setSummary((prev) => prev && { ...prev, totalPoints: prev.totalPoints - reward.pointsRequired });
                toast.success(`Đổi thành công! Mã của bạn: ${redemption.code}`);
            })
            .catch((error) => {
                const message = error.response?.data?.message || 'Không thể đổi điểm, vui lòng thử lại.';
                toast.error(message);
            })
            .finally(() => setRedeemingId(null));
    };

    const progressPercent = summary && summary.nextTierThreshold
        ? Math.min(
              100,
              Math.max(
                  0,
                  ((summary.completedBookings - summary.currentTierThreshold) /
                      (summary.nextTierThreshold - summary.currentTierThreshold)) *
                      100,
              ),
          )
        : 100;

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <h1 className="font-headline text-2xl font-semibold text-neutral-900">
                Điểm thưởng & Hạng thành viên
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
                Tích điểm mỗi lần đặt sân, đổi quà và nâng hạng để nhận ưu đãi tốt hơn.
            </p>

            {isLoading ? (
                <p className="mt-8 text-neutral-500">Đang tải...</p>
            ) : (
                <>
                    <div className="mt-6 rounded-xl border border-outline bg-neutral-50 p-5 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${membershipBadgeClass[summary.membershipTier]}`}>
                                    Hạng {membershipLabel[summary.membershipTier]}
                                </span>
                                {Number(summary.discountPercent) > 0 && (
                                    <span className="ml-2 text-sm text-neutral-500">
                                        Giảm {(Number(summary.discountPercent) * 100).toFixed(0)}% mỗi lần đặt sân
                                    </span>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-primary">{summary.totalPoints}</p>
                                <p className="text-xs text-neutral-500">điểm hiện tại</p>
                            </div>
                        </div>

                        <div className="mt-5">
                            {summary.nextTier ? (
                                <>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                                        <div
                                            className="h-full rounded-full bg-primary"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                    <p className="mt-2 text-sm text-neutral-500">
                                        Đặt thêm {Math.max(0, summary.nextTierThreshold - summary.completedBookings)} lần
                                        ({summary.completedBookings}/{summary.nextTierThreshold}) để lên hạng {membershipLabel[summary.nextTier]}.
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-neutral-500">
                                    Bạn đã đạt hạng cao nhất — {summary.completedBookings} lần đặt sân hoàn thành.
                                </p>
                            )}
                        </div>
                    </div>

                    <h2 className="mt-8 font-headline text-lg font-semibold text-neutral-900">
                        Đổi quà tặng
                    </h2>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {rewards.map((reward) => {
                            const canRedeem = summary.totalPoints >= reward.pointsRequired;
                            return (
                                <div
                                    key={reward.id}
                                    className="flex flex-col justify-between rounded-xl border border-outline bg-neutral-50 p-4 shadow-soft"
                                >
                                    <div>
                                        <p className="font-semibold text-neutral-900">{reward.name}</p>
                                        <p className="mt-1 text-sm text-neutral-500">{reward.description}</p>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="font-semibold text-primary">{reward.pointsRequired} điểm</span>
                                        <button
                                            type="button"
                                            onClick={() => onRedeem(reward)}
                                            disabled={!canRedeem || redeemingId === reward.id}
                                            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            {redeemingId === reward.id ? 'Đang đổi...' : 'Đổi quà'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        {rewards.length === 0 && (
                            <p className="text-sm text-neutral-500">Hiện chưa có phần quà nào.</p>
                        )}
                    </div>

                    <h2 className="mt-8 font-headline text-lg font-semibold text-neutral-900">
                        Lịch sử đổi điểm
                    </h2>
                    {redemptions.length === 0 ? (
                        <p className="mt-4 text-sm text-neutral-500">Bạn chưa đổi phần quà nào.</p>
                    ) : (
                        <div className="mt-4 flex flex-col gap-3">
                            {redemptions.map((redemption) => (
                                <div
                                    key={redemption.id}
                                    className="flex items-center justify-between rounded-xl border border-outline bg-neutral-50 p-4 shadow-soft"
                                >
                                    <div>
                                        <p className="font-semibold text-neutral-900">{redemption.rewardName}</p>
                                        <p className="mt-1 text-sm text-neutral-500">
                                            Mã: <span className="font-mono">{redemption.code}</span> · {formatDateTime(redemption.redeemedAt)}
                                        </p>
                                    </div>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${redemptionStatusClass[redemption.status]}`}>
                                        {redemptionStatusLabel[redemption.status]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default RewardsPage;
