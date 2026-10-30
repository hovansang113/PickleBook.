package com.pickleball.sang.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.pickleball.sang.entity.booking.Booking;
import com.pickleball.sang.entity.booking.BookingStatus;
import com.pickleball.sang.repository.BookingRespository;

@Component
public class BookingScheduler {

    private static final Logger log = LoggerFactory.getLogger(BookingScheduler.class);

    private final BookingRespository bookingRespository;

    public BookingScheduler(BookingRespository bookingRespository) {
        this.bookingRespository = bookingRespository;
    }

    // Chạy mỗi 1 phút - huỷ booking chưa thanh toán cọc đã quá hạn 15 phút
    @Scheduled(fixedRate = 60_000)
    public void cancelExpiredPendingBookings() {
        List<Booking> expired = bookingRespository.findByStatusAndExpiresAtBefore(
                BookingStatus.PENDING_PAYMENT, LocalDateTime.now());

        if (expired.isEmpty()) {
            return;
        }

        expired.forEach(booking -> booking.setStatus(BookingStatus.CANCELLED));
        bookingRespository.saveAll(expired);
        log.info("Auto-cancelled {} expired PENDING_PAYMENT booking(s)", expired.size());
    }

    // Booking CONFIRMED không tự động chuyển sang COMPLETED bằng giờ hệ thống - nhân viên phải
    // xác nhận đã thu tiền còn lại tại quầy qua BookingService.completeBookingWithPayment(),
    // nếu không số tiền còn lại (70%) sẽ không bao giờ được đối soát.
}
