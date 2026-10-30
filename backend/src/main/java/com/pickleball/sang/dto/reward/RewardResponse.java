package com.pickleball.sang.dto.reward;

import java.math.BigDecimal;

public class RewardResponse {

    private Long id;
    private String name;
    private String description;
    private int pointsRequired;
    private BigDecimal discountValue;

    public RewardResponse() {
    }

    public RewardResponse(Long id, String name, String description, int pointsRequired, BigDecimal discountValue) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.pointsRequired = pointsRequired;
        this.discountValue = discountValue;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getPointsRequired() { return pointsRequired; }
    public void setPointsRequired(int pointsRequired) { this.pointsRequired = pointsRequired; }

    public BigDecimal getDiscountValue() { return discountValue; }
    public void setDiscountValue(BigDecimal discountValue) { this.discountValue = discountValue; }
}
