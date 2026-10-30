package com.pickleball.sang.config.seed;

import java.math.BigDecimal;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.pickleball.sang.entity.reward.Reward;
import com.pickleball.sang.entity.reward.RewardStatus;
import com.pickleball.sang.repository.RewardRepository;

@Component
@Order(2)
public class RewardSeeder implements CommandLineRunner {

    private final RewardRepository rewardRepository;

    public RewardSeeder(RewardRepository rewardRepository) {
        this.rewardRepository = rewardRepository;
    }

    @Override
    public void run(String... args) {
        seedReward("1 Ly Nước", "Đổi điểm lấy 1 ly nước tại quầy", 50, BigDecimal.ZERO);
        seedReward("1 Giờ Sân Miễn Phí", "Đổi điểm lấy 1 giờ chơi miễn phí", 100, BigDecimal.ZERO);
    }

    private void seedReward(String name, String description, int pointsRequired, BigDecimal discountValue) {
        if (rewardRepository.existsByName(name)) {
            return;
        }

        Reward reward = new Reward();
        reward.setName(name);
        reward.setDescription(description);
        reward.setPointsRequired(pointsRequired);
        reward.setDiscountValue(discountValue);
        reward.setStatus(RewardStatus.ACTIVE);

        rewardRepository.save(reward);
    }
}
