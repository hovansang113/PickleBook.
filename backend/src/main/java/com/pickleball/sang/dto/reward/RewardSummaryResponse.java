package com.pickleball.sang.dto.reward;

import java.math.BigDecimal;

public class RewardSummaryResponse {

    private int totalPoints;
    private String membershipTier;
    private BigDecimal discountPercent;
    private long completedBookings;
    private long currentTierThreshold;
    private String nextTier;
    private Long nextTierThreshold;

    public RewardSummaryResponse() {
    }

    public RewardSummaryResponse(int totalPoints, String membershipTier, BigDecimal discountPercent,
            long completedBookings, long currentTierThreshold, String nextTier, Long nextTierThreshold) {
        this.totalPoints = totalPoints;
        this.membershipTier = membershipTier;
        this.discountPercent = discountPercent;
        this.completedBookings = completedBookings;
        this.currentTierThreshold = currentTierThreshold;
        this.nextTier = nextTier;
        this.nextTierThreshold = nextTierThreshold;
    }

    public int getTotalPoints() { return totalPoints; }
    public void setTotalPoints(int totalPoints) { this.totalPoints = totalPoints; }

    public String getMembershipTier() { return membershipTier; }
    public void setMembershipTier(String membershipTier) { this.membershipTier = membershipTier; }

    public BigDecimal getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(BigDecimal discountPercent) { this.discountPercent = discountPercent; }

    public long getCompletedBookings() { return completedBookings; }
    public void setCompletedBookings(long completedBookings) { this.completedBookings = completedBookings; }

    public long getCurrentTierThreshold() { return currentTierThreshold; }
    public void setCurrentTierThreshold(long currentTierThreshold) { this.currentTierThreshold = currentTierThreshold; }

    public String getNextTier() { return nextTier; }
    public void setNextTier(String nextTier) { this.nextTier = nextTier; }

    public Long getNextTierThreshold() { return nextTierThreshold; }
    public void setNextTierThreshold(Long nextTierThreshold) { this.nextTierThreshold = nextTierThreshold; }
}
