package com.pickleball.sang.dto.booking;

public class TimeSlotResponse {
    private String startTime;
    private String endTime;
    private boolean isAvailable;


    public TimeSlotResponse() {
    }

    public TimeSlotResponse(String startTime, String endTime, boolean isAvailable) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.isAvailable = isAvailable;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean available) {
        isAvailable = available;
    }
}
