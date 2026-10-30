package com.pickleball.sang.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.pickleball.sang.dto.court.CourtReponse;
import com.pickleball.sang.dto.court.CourtRequest;
import com.pickleball.sang.service.CourtService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/courts")
public class AdminCourtController {

    private final CourtService courtService;

    public AdminCourtController(CourtService courtService) {
        this.courtService = courtService;
    }

    @GetMapping
    public ResponseEntity<List<CourtReponse>> getAllCourts() {
        return ResponseEntity.ok(courtService.getAllCourtsForAdmin());
    }

    @PostMapping
    public ResponseEntity<CourtReponse> createCourt(@Valid @RequestBody CourtRequest request) {
        return ResponseEntity.ok(courtService.createCourt(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourtReponse> updateCourt(@PathVariable Long id, @Valid @RequestBody CourtRequest request) {
        return ResponseEntity.ok(courtService.updateCourt(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourt(@PathVariable Long id) {
        courtService.deleteCourt(id);
        return ResponseEntity.noContent().build();
    }
}
