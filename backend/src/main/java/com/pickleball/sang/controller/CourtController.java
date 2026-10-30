package com.pickleball.sang.controller;
import com.pickleball.sang.dto.court.CourtReponse;
import com.pickleball.sang.service.CourtService;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.http.ResponseEntity;
import java.util.List;


@RestController
@RequestMapping("/api/courts")
public class CourtController {

    private final CourtService courtService;

    public CourtController(CourtService courtService) {
        this.courtService = courtService;
    }

    @GetMapping
    public ResponseEntity<List<CourtReponse>> getAllCourts() {
        List<CourtReponse> courts = courtService.getAllCourts();
        return ResponseEntity.ok(courts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourtReponse> getCourtById(@PathVariable Long id) {
        CourtReponse court = courtService.getCourtById(id);
        return ResponseEntity.ok(court);
    }

}
