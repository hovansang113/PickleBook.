package com.pickleball.sang.controller;

import com.pickleball.sang.dto.payment.PaymentResponse;
import com.pickleball.sang.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/vnpay")
    public ResponseEntity<PaymentResponse> createPayment(
            @RequestParam Long bookingId,
            HttpServletRequest request) {
        return ResponseEntity.ok(paymentService.createPaymentUrl(bookingId, request));
    }

    @GetMapping("/vnpay/return")
    public ResponseEntity<String> vnpayReturn(@RequestParam Map<String, String> params) {
        paymentService.handleVNPayReturn(new HashMap<>(params));
        String responseCode = params.get("vnp_ResponseCode");
        if ("00".equals(responseCode)) {
            return ResponseEntity.ok("Payment successful");
        }
        return ResponseEntity.badRequest().body("Payment failed");
    }
}
