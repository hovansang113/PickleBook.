package com.pickleball.sang.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.pickleball.sang.dto.admin.DashboardStatsResponse;
import com.pickleball.sang.dto.admin.RecentBookingResponse;
import com.pickleball.sang.dto.admin.WeeklyRevenuePoint;
import com.pickleball.sang.entity.booking.BookingStatus;
import com.pickleball.sang.entity.courts.Court;
import com.pickleball.sang.entity.courts.Status;
import com.pickleball.sang.entity.payment.Payment;
import com.pickleball.sang.entity.payment.PaymentStatus;
import com.pickleball.sang.repository.BookingRespository;
import com.pickleball.sang.repository.CourtRepository;
import com.pickleball.sang.repository.PaymentRepository;
import com.pickleball.sang.repository.UserRepository;

@Service
public class AdminService {

    private static final List<BookingStatus> OCCUPYING_STATUSES = List.of(
            BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED, BookingStatus.COMPLETED, BookingStatus.NO_SHOW);

    private final BookingRespository bookingRespository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final CourtRepository courtRepository;
    private final BookingService bookingService;

    public AdminService(BookingRespository bookingRespository, PaymentRepository paymentRepository,
            UserRepository userRepository, CourtRepository courtRepository, BookingService bookingService) {
        this.bookingRespository = bookingRespository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.courtRepository = courtRepository;
        this.bookingService = bookingService;
    }

    public DashboardStatsResponse getDashboardStats() {
        BigDecimal totalRevenue = paymentRepository.sumAmountByStatus(PaymentStatus.SUCCESS);

        LocalDateTime fourteenDaysAgo = LocalDateTime.now().minusDays(14);
        List<Payment> recentPayments = paymentRepository.findByStatusAndPaidAtAfter(PaymentStatus.SUCCESS, fourteenDaysAgo);

        List<WeeklyRevenuePoint> weeklyRevenue = buildWeeklyRevenue(recentPayments);
        double revenueChangePercent = calculateRevenueChangePercent(recentPayments);

        long totalBookings = bookingRespository.count();
        long activeUsers = userRepository.countByStatus(com.pickleball.sang.entity.user.Status.ACTIVE);
        double fillRate = calculateFillRate();

        List<RecentBookingResponse> recentBookings = bookingService.getRecentBookingsForDashboard();

        return new DashboardStatsResponse(
                totalRevenue, revenueChangePercent, totalBookings, activeUsers, fillRate, weeklyRevenue, recentBookings);
    }

    private List<WeeklyRevenuePoint> buildWeeklyRevenue(List<Payment> recentPayments) {
        Map<LocalDate, BigDecimal> byDate = recentPayments.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getPaidAt().toLocalDate(),
                        Collectors.reducing(BigDecimal.ZERO, Payment::getAmount, BigDecimal::add)));

        List<WeeklyRevenuePoint> result = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            result.add(new WeeklyRevenuePoint(vietnameseWeekday(date), byDate.getOrDefault(date, BigDecimal.ZERO)));
        }
        return result;
    }

    private String vietnameseWeekday(LocalDate date) {
        return switch (date.getDayOfWeek()) {
            case MONDAY -> "Thứ 2";
            case TUESDAY -> "Thứ 3";
            case WEDNESDAY -> "Thứ 4";
            case THURSDAY -> "Thứ 5";
            case FRIDAY -> "Thứ 6";
            case SATURDAY -> "Thứ 7";
            case SUNDAY -> "Chủ Nhật";
        };
    }

    private double calculateRevenueChangePercent(List<Payment> recentPayments) {
        LocalDate sevenDaysAgo = LocalDate.now().minusDays(7);

        BigDecimal thisWeek = sumWhere(recentPayments, p -> !p.getPaidAt().toLocalDate().isBefore(sevenDaysAgo));
        BigDecimal lastWeek = sumWhere(recentPayments, p -> p.getPaidAt().toLocalDate().isBefore(sevenDaysAgo));

        if (lastWeek.compareTo(BigDecimal.ZERO) == 0) {
            return thisWeek.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }

        return thisWeek.subtract(lastWeek)
                .divide(lastWeek, 4, java.math.RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }

    private BigDecimal sumWhere(List<Payment> payments, java.util.function.Predicate<Payment> predicate) {
        return payments.stream()
                .filter(predicate)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private double calculateFillRate() {
        List<Court> activeCourts = courtRepository.findByStatus(Status.ACTIVE);

        long totalSlots = activeCourts.stream()
                .mapToLong(court -> java.time.Duration.between(court.getOpen_time(), court.getClose_time()).toMinutes()
                        / court.getSlot_duration_minutes())
                .sum();

        if (totalSlots == 0) {
            return 0.0;
        }

        long bookedSlots = bookingRespository.countByBookingDateAndStatusIn(LocalDate.now(), OCCUPYING_STATUSES);

        return Math.min(100.0, (bookedSlots * 100.0) / totalSlots);
    }
}
