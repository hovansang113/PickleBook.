package com.pickleball.sang.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.pickleball.sang.dto.admin.RecentBookingResponse;
import com.pickleball.sang.entity.payment.PaymentMethod;
import com.pickleball.sang.service.BookingService;

@RestController
@RequestMapping("/api/admin/bookings")
public class AdminBookingController {

    private final BookingService bookingService;

    public AdminBookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<List<RecentBookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookingsForAdmin());
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<RecentBookingResponse> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.adminCancelBooking(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<RecentBookingResponse> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, body.get("status")));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<RecentBookingResponse> completeBooking(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String methodParam = body != null ? body.get("paymentMethod") : null;
        PaymentMethod paymentMethod = methodParam != null ? PaymentMethod.valueOf(methodParam) : PaymentMethod.CASH;
        return ResponseEntity.ok(bookingService.completeBookingWithPayment(id, paymentMethod));
    }
}
