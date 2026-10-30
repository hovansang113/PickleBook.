package com.pickleball.sang.entity.courts;

import jakarta.persistence.*;
import java.time.LocalTime;


@Entity
@Table(name = "courts")
public class Court {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "address", nullable = false)
    private String address;

    @Column (name= "image", nullable = false)
    private String image;

    @Column(name = "price_per_hour", nullable = false)
    private double price_per_hour;

    @Column(name = "open_time", nullable = false)
    private LocalTime open_time;

    @Column(name = "close_time", nullable = false)
    private LocalTime close_time;

    @Column(name = "slot_duration_minutes", nullable = false)
    private int slot_duration_minutes;


    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Enumerated(EnumType.STRING)
    @Column(name = "court_type", nullable = false)
    private CourtType courtType;


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

    public LocalTime getOpen_time() { return open_time; }
    public void setOpen_time(LocalTime open_time) { this.open_time = open_time; }

    public LocalTime getClose_time() { return close_time; }
    public void setClose_time(LocalTime close_time) { this.close_time = close_time; }

    public int getSlot_duration_minutes() { return slot_duration_minutes; }
    public void setSlot_duration_minutes(int slot_duration_minutes) { this.slot_duration_minutes = slot_duration_minutes; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public CourtType getCourtType() { return courtType; }
    public void setCourtType(CourtType courtType) { this.courtType = courtType; }
}
