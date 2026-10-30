package com.pickleball.sang.repository;

import com.pickleball.sang.entity.courts.Court;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pickleball.sang.entity.courts.Status;
import java.util.List;


@Repository
public interface CourtRepository extends JpaRepository<Court, Long> {
    List<Court> findByStatus(Status status);

    List<Court> findByNameContainingIgnoreCase(String name);

    boolean existsByName(String name);
}
