package com.pickleball.sang.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.pickleball.sang.entity.booking.BookingStatus;
import com.pickleball.sang.entity.booking.Booking;

@Repository
public interface BookingRespository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByCourtIdAndBookingDate(Long courtId, LocalDate bookingDate);

    boolean existsByCourtIdAndBookingDateAndStartTime(Long courtId, LocalDate bookingDate, LocalTime startTime);

    List<Booking> findByStatusAndExpiresAtBefore(BookingStatus status, LocalDateTime now);

    List<Booking> findTop5ByOrderByIdDesc();

    long countByBookingDateAndStatusIn(LocalDate bookingDate, List<BookingStatus> statuses);

    boolean existsByCourtId(Long courtId);

    List<Booking> findByStatus(BookingStatus status);

    long countByUserIdAndStatus(Long userId, BookingStatus status);
}
