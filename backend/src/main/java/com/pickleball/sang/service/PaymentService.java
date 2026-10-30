package com.pickleball.sang.service;

import com.pickleball.sang.dto.payment.PaymentResponse;
import com.pickleball.sang.entity.booking.Booking;
import com.pickleball.sang.entity.booking.BookingStatus;
import com.pickleball.sang.entity.payment.Payment;
import com.pickleball.sang.entity.payment.PaymentMethod;
import com.pickleball.sang.entity.payment.PaymentStatus;
import com.pickleball.sang.entity.payment.PaymentType;
import com.pickleball.sang.exception.BookingConflictException;
import com.pickleball.sang.exception.ResourceNotFoundException;
import com.pickleball.sang.repository.BookingRespository;
import com.pickleball.sang.repository.PaymentRepository;
import com.pickleball.sang.util.VNPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class PaymentService {

    private final BookingRespository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final VNPayUtil vnPayUtil;

    public PaymentService(BookingRespository bookingRepository, PaymentRepository paymentRepository, VNPayUtil vnPayUtil) {
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.vnPayUtil = vnPayUtil;
    }

    public PaymentResponse createPaymentUrl(Long bookingId, HttpServletRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw new BookingConflictException("Booking is not in PENDING_PAYMENT status");
        }

        String ipAddress = request.getRemoteAddr();
        String orderInfo = "Dat san " + booking.getCourt().getName() + " - " + booking.getBookingDate();
        String paymentUrl = vnPayUtil.createPaymentUrl(bookingId, booking.getDepositAmount(), orderInfo, ipAddress);

        return new PaymentResponse(bookingId, paymentUrl, booking.getStatus().name());
    }

    public void handleVNPayReturn(Map<String, String> params) {
        boolean isValid = vnPayUtil.verifyPayment(params);
        String responseCode = params.get("vnp_ResponseCode");
        String txnRef = params.get("vnp_TxnRef");
        String transactionCode = params.get("vnp_TransactionNo");

        // lấy bookingId từ txnRef (format: bookingId_timestamp)
        Long bookingId = Long.parseLong(txnRef.split("_")[0]);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(booking.getDepositAmount());
        payment.setPaymentType(PaymentType.DEPOSIT);
        payment.setPaymentMethod(PaymentMethod.VNPAY);
        payment.setTransactionCode(transactionCode);

        if (isValid && "00".equals(responseCode)) {
            booking.setStatus(BookingStatus.CONFIRMED);
            payment.setStatus(PaymentStatus.SUCCESS);
        } else {
            booking.setStatus(BookingStatus.CANCELLED);
            payment.setStatus(PaymentStatus.FAILED);
        }

        bookingRepository.save(booking);
        paymentRepository.save(payment);
    }
}
