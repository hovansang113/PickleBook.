package com.pickleball.sang.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.pickleball.sang.dto.reward.RewardRedemptionResponse;
import com.pickleball.sang.service.RewardService;

@RestController
@RequestMapping("/api/admin/redemptions")
public class AdminRewardController {

    private final RewardService rewardService;

    public AdminRewardController(RewardService rewardService) {
        this.rewardService = rewardService;
    }

    @PutMapping("/{code}/use")
    public ResponseEntity<RewardRedemptionResponse> markUsed(@PathVariable String code) {
        return ResponseEntity.ok(rewardService.markRedemptionUsed(code));
    }
}
