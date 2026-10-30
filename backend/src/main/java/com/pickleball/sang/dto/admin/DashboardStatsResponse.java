package com.pickleball.sang.dto.admin;

import java.math.BigDecimal;
import java.util.List;

public class DashboardStatsResponse {

    private BigDecimal totalRevenue;
    private double revenueChangePercent;
    private long totalBookings;
    private long activeUsers;
    private double fillRate;
    private List<WeeklyRevenuePoint> weeklyRevenue;
    private List<RecentBookingResponse> recentBookings;

    public DashboardStatsResponse() {
    }

    public DashboardStatsResponse(BigDecimal totalRevenue, double revenueChangePercent, long totalBookings,
            long activeUsers, double fillRate, List<WeeklyRevenuePoint> weeklyRevenue,
            List<RecentBookingResponse> recentBookings) {
        this.totalRevenue = totalRevenue;
        this.revenueChangePercent = revenueChangePercent;
        this.totalBookings = totalBookings;
        this.activeUsers = activeUsers;
        this.fillRate = fillRate;
        this.weeklyRevenue = weeklyRevenue;
        this.recentBookings = recentBookings;
    }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public double getRevenueChangePercent() { return revenueChangePercent; }
    public void setRevenueChangePercent(double revenueChangePercent) { this.revenueChangePercent = revenueChangePercent; }

    public long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(long totalBookings) { this.totalBookings = totalBookings; }

    public long getActiveUsers() { return activeUsers; }
    public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }

    public double getFillRate() { return fillRate; }
    public void setFillRate(double fillRate) { this.fillRate = fillRate; }

    public List<WeeklyRevenuePoint> getWeeklyRevenue() { return weeklyRevenue; }
    public void setWeeklyRevenue(List<WeeklyRevenuePoint> weeklyRevenue) { this.weeklyRevenue = weeklyRevenue; }

    public List<RecentBookingResponse> getRecentBookings() { return recentBookings; }
    public void setRecentBookings(List<RecentBookingResponse> recentBookings) { this.recentBookings = recentBookings; }
}
