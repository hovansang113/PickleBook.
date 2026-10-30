package com.pickleball.sang.dto.payment;

public class PaymentResponse {

    private Long bookingId;
    private String paymentUrl;
    private String status;

    public PaymentResponse() {}

    public PaymentResponse(Long bookingId, String paymentUrl, String status) {
        this.bookingId = bookingId;
        this.paymentUrl = paymentUrl;
        this.status = status;
    }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public String getPaymentUrl() { return paymentUrl; }
    public void setPaymentUrl(String paymentUrl) { this.paymentUrl = paymentUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
