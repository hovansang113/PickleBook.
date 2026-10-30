package com.pickleball.sang.dto.admin;

import java.math.BigDecimal;

public class WeeklyRevenuePoint {

    private String day;
    private BigDecimal revenue;

    public WeeklyRevenuePoint() {
    }

    public WeeklyRevenuePoint(String day, BigDecimal revenue) {
        this.day = day;
        this.revenue = revenue;
    }

    public String getDay() { return day; }
    public void setDay(String day) { this.day = day; }

    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
}
