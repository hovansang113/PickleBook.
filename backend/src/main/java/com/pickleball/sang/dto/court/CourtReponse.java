package com.pickleball.sang.dto.court;

public class CourtReponse {
    private Long id;
    private String name;
    private String description;
    private String address;
    private String image;
    private double price_per_hour;
    private String open_time;
    private String close_time;
    private int slot_duration_minutes;
    private String status;
    private Double rating;
    private String court_type;


    public CourtReponse() {
    }

    public CourtReponse(Long id, String name, String description, String address, String image, double price_per_hour, String open_time, String close_time, int slot_duration_minutes, String status, Double rating, String court_type) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.address = address;
        this.image = image;
        this.price_per_hour = price_per_hour;
        this.open_time = open_time;
        this.close_time = close_time;
        this.slot_duration_minutes = slot_duration_minutes;
        this.status = status;
        this.rating = rating;
        this.court_type = court_type;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public String getOpen_time() { return open_time; }
    public void setOpen_time(String open_time) { this.open_time = open_time; }

    public String getClose_time() { return close_time; }
    public void setClose_time(String close_time) { this.close_time = close_time; }  

    public int getSlot_duration_minutes() { return slot_duration_minutes; }
    public void setSlot_duration_minutes(int slot_duration_minutes) { this.slot_duration_minutes = slot_duration_minutes; } 

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public String getCourt_type() { return court_type; }
    public void setCourt_type(String court_type) { this.court_type = court_type; }

}
