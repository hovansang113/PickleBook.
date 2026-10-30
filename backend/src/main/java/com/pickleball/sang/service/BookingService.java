package com.pickleball.sang.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.pickleball.sang.dto.admin.RecentBookingResponse;
import com.pickleball.sang.dto.booking.BookingRequest;
import com.pickleball.sang.dto.booking.BookingResponse;
import com.pickleball.sang.dto.booking.TimeSlotResponse;
import com.pickleball.sang.entity.booking.Booking;
import com.pickleball.sang.entity.booking.BookingStatus;
import com.pickleball.sang.entity.courts.Court;
import com.pickleball.sang.entity.payment.Payment;
import com.pickleball.sang.entity.payment.PaymentMethod;
import com.pickleball.sang.entity.payment.PaymentStatus;
import com.pickleball.sang.entity.payment.PaymentType;
import com.pickleball.sang.entity.point.PointTransaction;
import com.pickleball.sang.entity.point.PointTransactionType;
import com.pickleball.sang.entity.user.Membership;
import com.pickleball.sang.entity.user.User;
import com.pickleball.sang.exception.BookingConflictException;
import com.pickleball.sang.exception.ForbiddenActionException;
import com.pickleball.sang.exception.ResourceNotFoundException;
import com.pickleball.sang.exception.UserNotFoundException;
import com.pickleball.sang.repository.BookingRespository;
import com.pickleball.sang.repository.CourtRepository;
import com.pickleball.sang.repository.PaymentRepository;
import com.pickleball.sang.repository.PointTransactionRepository;
import com.pickleball.sang.repository.UserRepository;

@Service
public class BookingService {

    private static final int POINTS_PER_COMPLETED_BOOKING = 10;

    private final CourtRepository courtRepository;
    private final BookingRespository bookingRespository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final PointTransactionRepository pointTransactionRepository;

    public BookingService(CourtRepository courtRepository, BookingRespository bookingRespository,
            UserRepository userRepository, PaymentRepository paymentRepository,
            PointTransactionRepository pointTransactionRepository) {
        this.courtRepository = courtRepository;
        this.bookingRespository = bookingRespository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.pointTransactionRepository = pointTransactionRepository;
    }

    public List<TimeSlotResponse> getTimeSlots(Long courtId, LocalDate date) {
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException("Court not found"));

        List<Booking> existingBookings = bookingRespository.findByCourtIdAndBookingDate(courtId, date);

        Set<LocalTime> bookedTimes = existingBookings.stream()
                .map(Booking::getStartTime)
                .collect(Collectors.toSet());

        List<TimeSlotResponse> result = new ArrayList<>();
        LocalTime current = court.getOpen_time();

        while (current.isBefore(court.getClose_time())) {
            LocalTime end = current.plusMinutes(court.getSlot_duration_minutes());
            boolean available = !bookedTimes.contains(current);
            result.add(new TimeSlotResponse(current.toString(), end.toString(), available));
            current = end;
        }

        return result;
    }

    public BookingResponse createBooking(BookingRequest request) {
        User user = getCurrentUser();

        Court court = courtRepository.findById(request.getCourtId())
                .orElseThrow(() -> new ResourceNotFoundException("Court not found"));

        // kiểm tra slot còn trống không
        boolean isBooked = bookingRespository.existsByCourtIdAndBookingDateAndStartTime(
                request.getCourtId(), request.getBookingDate(), request.getStartTime());
        if (isBooked) {
            throw new BookingConflictException("This time slot is already booked");
        }

        // tính tiền
        long hours = java.time.Duration.between(request.getStartTime(), request.getEndTime()).toHours();
        BigDecimal totalPrice = BigDecimal.valueOf(court.getPrice_per_hour() * hours);

        // giảm giá tự động theo hạng thành viên
        BigDecimal discountApplied = totalPrice.multiply(user.getMembershipTier().getDiscountPercent());
        BigDecimal finalPrice = totalPrice.subtract(discountApplied);

        BigDecimal depositAmount = finalPrice.multiply(BigDecimal.valueOf(0.3)); // đặt cọc 30%
        BigDecimal remainingAmount = finalPrice.subtract(depositAmount);

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setCourt(court);
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setTotalPrice(totalPrice);
        booking.setDepositAmount(depositAmount);
        booking.setRemainingAmount(remainingAmount);
        booking.setDiscountApplied(discountApplied);
        booking.setFinalPrice(finalPrice);
        booking.setStatus(BookingStatus.PENDING_PAYMENT);
        booking.setPointsEarned(0);
        booking.setExpiresAt(LocalDateTime.now().plusMinutes(15)); // hết hạn sau 15 phút

        bookingRespository.save(booking);

        return toBookingResponse(booking);
    }

    public List<BookingResponse> getMyBookings() {
        User user = getCurrentUser();

        return bookingRespository.findByUserId(user.getId())
                .stream()
                .map(this::toBookingResponse)
                .toList();
    }

    public BookingResponse cancelBooking(Long bookingId) {
        User user = getCurrentUser();

        Booking booking = bookingRespository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new ForbiddenActionException("You are not allowed to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BookingConflictException("This booking cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRespository.save(booking);

        return toBookingResponse(booking);
    }

    public List<RecentBookingResponse> getAllBookingsForAdmin() {
        return bookingRespository.findAll(org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Direction.DESC, "id"))
                .stream()
                .map(this::toRecentBookingResponse)
                .toList();
    }

    public List<RecentBookingResponse> getRecentBookingsForDashboard() {
        return bookingRespository.findTop5ByOrderByIdDesc()
                .stream()
                .map(this::toRecentBookingResponse)
                .toList();
    }

    public RecentBookingResponse adminCancelBooking(Long bookingId) {
        Booking booking = bookingRespository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BookingConflictException("This booking cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRespository.save(booking);

        return toRecentBookingResponse(booking);
    }

    public RecentBookingResponse updateBookingStatus(Long bookingId, String status) {
        BookingStatus newStatus = BookingStatus.valueOf(status);
        if (newStatus == BookingStatus.COMPLETED) {
            throw new BookingConflictException(
                    "Use the /complete endpoint to complete a booking, so the remaining payment is recorded");
        }

        Booking booking = bookingRespository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        booking.setStatus(newStatus);
        bookingRespository.save(booking);

        return toRecentBookingResponse(booking);
    }

    // Nhân viên xác nhận đã thu tiền còn lại tại quầy, hoàn thành booking, cộng điểm và xét lại hạng thành viên
    public RecentBookingResponse completeBookingWithPayment(Long bookingId, PaymentMethod paymentMethod) {
        Booking booking = bookingRespository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new BookingConflictException("Only CONFIRMED bookings can be completed");
        }

        Payment remainingPayment = new Payment();
        remainingPayment.setBooking(booking);
        remainingPayment.setAmount(booking.getRemainingAmount());
        remainingPayment.setPaymentType(PaymentType.REMAINING);
        remainingPayment.setPaymentMethod(paymentMethod != null ? paymentMethod : PaymentMethod.CASH);
        remainingPayment.setStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(remainingPayment);

        booking.setStatus(BookingStatus.COMPLETED);
        booking.setPointsEarned(POINTS_PER_COMPLETED_BOOKING);
        bookingRespository.save(booking);

        User user = booking.getUser();

        PointTransaction pointTransaction = new PointTransaction();
        pointTransaction.setUser(user);
        pointTransaction.setBooking(booking);
        pointTransaction.setPoints(POINTS_PER_COMPLETED_BOOKING);
        pointTransaction.setType(PointTransactionType.EARN);
        pointTransaction.setDescription("Điểm thưởng cho booking #" + booking.getId());
        pointTransactionRepository.save(pointTransaction);

        user.setTotalPoints(user.getTotalPoints() + POINTS_PER_COMPLETED_BOOKING);
        long completedCount = bookingRespository.countByUserIdAndStatus(user.getId(), BookingStatus.COMPLETED);
        user.setMembershipTier(Membership.fromCompletedCount(completedCount));
        userRepository.save(user);

        return toRecentBookingResponse(booking);
    }

    public RecentBookingResponse toRecentBookingResponse(Booking booking) {
        return new RecentBookingResponse(
                booking.getId(),
                booking.getUser().getName(),
                booking.getUser().getPhone(),
                booking.getCourt().getName(),
                booking.getCourt().getCourtType().name(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getStatus().name(),
                booking.getTotalPrice(),
                booking.getRemainingAmount());
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    private BookingResponse toBookingResponse(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getCourt().getId(),
                booking.getCourt().getName(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getTotalPrice(),
                booking.getDepositAmount(),
                booking.getRemainingAmount(),
                booking.getStatus().name()
        );
    }
}
