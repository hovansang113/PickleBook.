package com.pickleball.sang.entity.user;

import java.math.BigDecimal;

public enum Membership {
    BRONZE(BigDecimal.ZERO),
    SILVER(new BigDecimal("0.03")),
    GOLD(new BigDecimal("0.07")),
    DIAMOND(new BigDecimal("0.15"));

    private final BigDecimal discountPercent;

    Membership(BigDecimal discountPercent) {
        this.discountPercent = discountPercent;
    }

    public BigDecimal getDiscountPercent() {
        return discountPercent;
    }

    public static Membership fromCompletedCount(long completedBookings) {
        if (completedBookings >= 100) {
            return DIAMOND;
        }
        if (completedBookings >= 50) {
            return GOLD;
        }
        if (completedBookings >= 30) {
            return SILVER;
        }
        return BRONZE;
    }

    // Số lần đặt sân hoàn thành tối thiểu để đạt hạng này
    public long getCompletedBookingsThreshold() {
        return switch (this) {
            case BRONZE -> 0;
            case SILVER -> 30;
            case GOLD -> 50;
            case DIAMOND -> 100;
        };
    }

    public Membership next() {
        return switch (this) {
            case BRONZE -> SILVER;
            case SILVER -> GOLD;
            case GOLD -> DIAMOND;
            case DIAMOND -> null;
        };
    }
}
