package com.pickleball.sang.dto.court;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalTime;

public class CourtRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Address is required")
    private String address;

    private String image;

    @Positive(message = "Price per hour must be positive")
    private double price_per_hour;

    @NotNull(message = "Open time is required")
    private LocalTime open_time;

    @NotNull(message = "Close time is required")
    private LocalTime close_time;

    @Positive(message = "Slot duration must be positive")
    private int slot_duration_minutes;

    @NotBlank(message = "Status is required")
    private String status;

    @NotBlank(message = "Court type is required")
    private String court_type;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public double getPrice_per_hour() { return price_per_hour; }
    public void setPrice_per_hour(double price_per_hour) { this.price_per_hour = price_per_hour; }

    public LocalTime getOpen_time() { return open_time; }
    public void setOpen_time(LocalTime open_time) { this.open_time = open_time; }

    public LocalTime getClose_time() { return close_time; }
    public void setClose_time(LocalTime close_time) { this.close_time = close_time; }

    public int getSlot_duration_minutes() { return slot_duration_minutes; }
    public void setSlot_duration_minutes(int slot_duration_minutes) { this.slot_duration_minutes = slot_duration_minutes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCourt_type() { return court_type; }
    public void setCourt_type(String court_type) { this.court_type = court_type; }
}
