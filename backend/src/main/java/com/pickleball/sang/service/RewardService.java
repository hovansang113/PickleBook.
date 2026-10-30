package com.pickleball.sang.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.pickleball.sang.dto.reward.RewardRedemptionResponse;
import com.pickleball.sang.dto.reward.RewardResponse;
import com.pickleball.sang.dto.reward.RewardSummaryResponse;
import com.pickleball.sang.entity.booking.BookingStatus;
import com.pickleball.sang.entity.point.PointTransaction;
import com.pickleball.sang.entity.point.PointTransactionType;
import com.pickleball.sang.entity.reward.Reward;
import com.pickleball.sang.entity.reward.RewardRedemption;
import com.pickleball.sang.entity.reward.RewardRedemptionStatus;
import com.pickleball.sang.entity.reward.RewardStatus;
import com.pickleball.sang.entity.user.Membership;
import com.pickleball.sang.entity.user.User;
import com.pickleball.sang.exception.BookingConflictException;
import com.pickleball.sang.exception.ResourceNotFoundException;
import com.pickleball.sang.exception.UserNotFoundException;
import com.pickleball.sang.repository.BookingRespository;
import com.pickleball.sang.repository.PointTransactionRepository;
import com.pickleball.sang.repository.RewardRedemptionRepository;
import com.pickleball.sang.repository.RewardRepository;
import com.pickleball.sang.repository.UserRepository;

@Service
public class RewardService {

    private final RewardRepository rewardRepository;
    private final RewardRedemptionRepository rewardRedemptionRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final UserRepository userRepository;
    private final BookingRespository bookingRespository;

    public RewardService(RewardRepository rewardRepository, RewardRedemptionRepository rewardRedemptionRepository,
            PointTransactionRepository pointTransactionRepository, UserRepository userRepository,
            BookingRespository bookingRespository) {
        this.rewardRepository = rewardRepository;
        this.rewardRedemptionRepository = rewardRedemptionRepository;
        this.pointTransactionRepository = pointTransactionRepository;
        this.userRepository = userRepository;
        this.bookingRespository = bookingRespository;
    }

    public RewardSummaryResponse getMySummary() {
        User user = getCurrentUser();
        Membership tier = user.getMembershipTier();
        Membership nextTier = tier.next();
        long completedBookings = bookingRespository.countByUserIdAndStatus(user.getId(), BookingStatus.COMPLETED);

        return new RewardSummaryResponse(
                user.getTotalPoints(),
                tier.name(),
                tier.getDiscountPercent(),
                completedBookings,
                tier.getCompletedBookingsThreshold(),
                nextTier != null ? nextTier.name() : null,
                nextTier != null ? nextTier.getCompletedBookingsThreshold() : null);
    }

    public List<RewardResponse> getActiveRewards() {
        return rewardRepository.findByStatus(RewardStatus.ACTIVE)
                .stream()
                .map(this::toRewardResponse)
                .toList();
    }

    public RewardRedemptionResponse redeemReward(Long rewardId) {
        User user = getCurrentUser();

        Reward reward = rewardRepository.findById(rewardId)
                .orElseThrow(() -> new ResourceNotFoundException("Reward not found"));

        if (reward.getStatus() != RewardStatus.ACTIVE) {
            throw new BookingConflictException("This reward is no longer available");
        }

        if (user.getTotalPoints() < reward.getPointsRequired()) {
            throw new BookingConflictException("Not enough points to redeem this reward");
        }

        RewardRedemption redemption = new RewardRedemption();
        redemption.setUser(user);
        redemption.setReward(reward);
        redemption.setPointsUsed(reward.getPointsRequired());
        redemption.setCode(generateUniqueCode());
        redemption.setStatus(RewardRedemptionStatus.UNUSED);
        rewardRedemptionRepository.save(redemption);

        PointTransaction pointTransaction = new PointTransaction();
        pointTransaction.setUser(user);
        pointTransaction.setPoints(-reward.getPointsRequired());
        pointTransaction.setType(PointTransactionType.REDEEM);
        pointTransaction.setDescription("Đổi điểm lấy \"" + reward.getName() + "\"");
        pointTransactionRepository.save(pointTransaction);

        user.setTotalPoints(user.getTotalPoints() - reward.getPointsRequired());
        userRepository.save(user);

        return toRedemptionResponse(redemption);
    }

    public List<RewardRedemptionResponse> getMyRedemptions() {
        User user = getCurrentUser();

        return rewardRedemptionRepository.findByUserIdOrderByRedeemedAtDesc(user.getId())
                .stream()
                .map(this::toRedemptionResponse)
                .toList();
    }

    // Nhân viên quầy xác nhận khách đã dùng mã đổi quà
    public RewardRedemptionResponse markRedemptionUsed(String code) {
        RewardRedemption redemption = rewardRedemptionRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Redemption code not found"));

        if (redemption.getStatus() != RewardRedemptionStatus.UNUSED) {
            throw new BookingConflictException("This redemption code has already been used or expired");
        }

        redemption.setStatus(RewardRedemptionStatus.USED);
        redemption.setUsedAt(java.time.LocalDateTime.now());
        rewardRedemptionRepository.save(redemption);

        return toRedemptionResponse(redemption);
    }

    private String generateUniqueCode() {
        String code;
        do {
            code = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (rewardRedemptionRepository.existsByCode(code));
        return code;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    private RewardResponse toRewardResponse(Reward reward) {
        return new RewardResponse(
                reward.getId(),
                reward.getName(),
                reward.getDescription(),
                reward.getPointsRequired(),
                reward.getDiscountValue());
    }

    private RewardRedemptionResponse toRedemptionResponse(RewardRedemption redemption) {
        return new RewardRedemptionResponse(
                redemption.getId(),
                redemption.getReward().getName(),
                redemption.getPointsUsed(),
                redemption.getCode(),
                redemption.getStatus().name(),
                redemption.getRedeemedAt(),
                redemption.getUsedAt());
    }
}
