package com.pickleball.sang.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.pickleball.sang.dto.reward.RewardRedemptionResponse;
import com.pickleball.sang.dto.reward.RewardResponse;
import com.pickleball.sang.dto.reward.RewardSummaryResponse;
import com.pickleball.sang.service.RewardService;

@RestController
@RequestMapping("/api/rewards")
public class RewardController {

    private final RewardService rewardService;

    public RewardController(RewardService rewardService) {
        this.rewardService = rewardService;
    }

    @GetMapping
    public ResponseEntity<List<RewardResponse>> getActiveRewards() {
        return ResponseEntity.ok(rewardService.getActiveRewards());
    }

    @GetMapping("/me/summary")
    public ResponseEntity<RewardSummaryResponse> getMySummary() {
        return ResponseEntity.ok(rewardService.getMySummary());
    }

    @PostMapping("/{id}/redeem")
    public ResponseEntity<RewardRedemptionResponse> redeemReward(@PathVariable Long id) {
        return ResponseEntity.ok(rewardService.redeemReward(id));
    }

    @GetMapping("/redemptions/me")
    public ResponseEntity<List<RewardRedemptionResponse>> getMyRedemptions() {
        return ResponseEntity.ok(rewardService.getMyRedemptions());
    }
}
