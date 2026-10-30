package com.pickleball.sang.config.seed;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.pickleball.sang.entity.booking.Booking;
import com.pickleball.sang.entity.booking.BookingStatus;
import com.pickleball.sang.entity.courts.Court;
import com.pickleball.sang.entity.user.User;
import com.pickleball.sang.repository.BookingRespository;
import com.pickleball.sang.repository.CourtRepository;
import com.pickleball.sang.repository.UserRepository;

@Component
@Order(3)
public class BookingSeeder implements CommandLineRunner {

    private static final String SEED_USER_EMAIL = "admin@gmail.com";

    private final CourtRepository courtRepository;
    private final UserRepository userRepository;
    private final BookingRespository bookingRespository;

    public BookingSeeder(CourtRepository courtRepository, UserRepository userRepository,
            BookingRespository bookingRespository) {
        this.courtRepository = courtRepository;
        this.userRepository = userRepository;
        this.bookingRespository = bookingRespository;
    }

    @Override
    public void run(String... args) {
        if (bookingRespository.count() > 0) {
            return;
        }

        User user = userRepository.findByEmail(SEED_USER_EMAIL).orElse(null);
        List<Court> courts = courtRepository.findAll();

        if (user == null || courts.isEmpty()) {
            return;
        }

        Court firstCourt = courts.get(0);
        LocalDate today = LocalDate.now();

        seedBooking(user, firstCourt, today, LocalTime.of(8, 0));
        seedBooking(user, firstCourt, today, LocalTime.of(15, 0));
        seedBooking(user, firstCourt, today.plusDays(1), LocalTime.of(10, 0));

        if (courts.size() > 1) {
            seedBooking(user, courts.get(1), today, LocalTime.of(18, 0));
        }
    }

    private void seedBooking(User user, Court court, LocalDate date, LocalTime startTime) {
        LocalTime endTime = startTime.plusMinutes(court.getSlot_duration_minutes());
        BigDecimal price = BigDecimal.valueOf(court.getPrice_per_hour());

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setCourt(court);
        booking.setBookingDate(date);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setTotalPrice(price);
        booking.setDepositAmount(price);
        booking.setRemainingAmount(BigDecimal.ZERO);
        booking.setDiscountApplied(BigDecimal.ZERO);
        booking.setFinalPrice(price);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        booking.setPointsEarned(0);

        bookingRespository.save(booking);
    }
}
