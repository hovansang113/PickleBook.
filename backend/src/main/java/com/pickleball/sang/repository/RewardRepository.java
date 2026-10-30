package com.pickleball.sang.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pickleball.sang.entity.reward.Reward;
import com.pickleball.sang.entity.reward.RewardStatus;

@Repository
public interface RewardRepository extends JpaRepository<Reward, Long> {

    List<Reward> findByStatus(RewardStatus status);

    boolean existsByName(String name);
}
