package com.pickleball.sang.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class RecentBookingResponse {

    private Long id;
    private String customerName;
    private String customerPhone;
    private String courtName;
    private String courtType;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
    private BigDecimal amount;
    private BigDecimal remainingAmount;

    public RecentBookingResponse() {
    }

    public RecentBookingResponse(Long id, String customerName, String customerPhone, String courtName,
            String courtType, LocalDate bookingDate, LocalTime startTime, LocalTime endTime, String status,
            BigDecimal amount, BigDecimal remainingAmount) {
        this.id = id;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.courtName = courtName;
        this.courtType = courtType;
        this.bookingDate = bookingDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this.amount = amount;
        this.remainingAmount = remainingAmount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getCourtName() { return courtName; }
    public void setCourtName(String courtName) { this.courtName = courtName; }

    public String getCourtType() { return courtType; }
    public void setCourtType(String courtType) { this.courtType = courtType; }

    public LocalDate getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public BigDecimal getRemainingAmount() { return remainingAmount; }
    public void setRemainingAmount(BigDecimal remainingAmount) { this.remainingAmount = remainingAmount; }
}
