package com.pickleball.sang.dto.reward;

import java.time.LocalDateTime;

public class RewardRedemptionResponse {

    private Long id;
    private String rewardName;
    private int pointsUsed;
    private String code;
    private String status;
    private LocalDateTime redeemedAt;
    private LocalDateTime usedAt;

    public RewardRedemptionResponse() {
    }

    public RewardRedemptionResponse(Long id, String rewardName, int pointsUsed, String code, String status,
            LocalDateTime redeemedAt, LocalDateTime usedAt) {
        this.id = id;
        this.rewardName = rewardName;
        this.pointsUsed = pointsUsed;
        this.code = code;
        this.status = status;
        this.redeemedAt = redeemedAt;
        this.usedAt = usedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRewardName() { return rewardName; }
    public void setRewardName(String rewardName) { this.rewardName = rewardName; }

    public int getPointsUsed() { return pointsUsed; }
    public void setPointsUsed(int pointsUsed) { this.pointsUsed = pointsUsed; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getRedeemedAt() { return redeemedAt; }
    public void setRedeemedAt(LocalDateTime redeemedAt) { this.redeemedAt = redeemedAt; }

    public LocalDateTime getUsedAt() { return usedAt; }
    public void setUsedAt(LocalDateTime usedAt) { this.usedAt = usedAt; }
}
