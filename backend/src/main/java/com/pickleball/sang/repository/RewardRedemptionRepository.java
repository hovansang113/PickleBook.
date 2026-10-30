package com.pickleball.sang.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pickleball.sang.entity.reward.RewardRedemption;

@Repository
public interface RewardRedemptionRepository extends JpaRepository<RewardRedemption, Long> {

    List<RewardRedemption> findByUserIdOrderByRedeemedAtDesc(Long userId);

    Optional<RewardRedemption> findByCode(String code);

    boolean existsByCode(String code);
}
