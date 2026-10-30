package com.pickleball.sang.service;
import com.pickleball.sang.repository.BookingRespository;
import com.pickleball.sang.repository.CourtRepository;
import com.pickleball.sang.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import com.pickleball.sang.dto.court.CourtReponse;
import com.pickleball.sang.dto.court.CourtRequest;
import com.pickleball.sang.entity.courts.Court;
import com.pickleball.sang.entity.courts.CourtType;
import com.pickleball.sang.entity.courts.Status;
import com.pickleball.sang.exception.BookingConflictException;
import com.pickleball.sang.exception.ResourceNotFoundException;
import java.util.List;

@Service
public class CourtService {
    private final CourtRepository courtRepository;
    private final ReviewRepository reviewRepository;
    private final BookingRespository bookingRespository;

    public CourtService(CourtRepository courtRepository, ReviewRepository reviewRepository,
            BookingRespository bookingRespository) {
        this.courtRepository = courtRepository;
        this.reviewRepository = reviewRepository;
        this.bookingRespository = bookingRespository;
    }

    public List<CourtReponse> getAllCourts() {
        return courtRepository.findByStatus(Status.ACTIVE)
                .stream()
                .map(this::toCourtReponse)
                .toList();
    }

    public List<CourtReponse> getAllCourtsForAdmin() {
        return courtRepository.findAll()
                .stream()
                .map(this::toCourtReponse)
                .toList();
    }

    public CourtReponse getCourtById(Long id) {
        Court court = findCourtOrThrow(id);
        return toCourtReponse(court);
    }

    public CourtReponse createCourt(CourtRequest request) {
        Court court = new Court();
        applyRequest(court, request);
        courtRepository.save(court);
        return toCourtReponse(court);
    }

    public CourtReponse updateCourt(Long id, CourtRequest request) {
        Court court = findCourtOrThrow(id);
        applyRequest(court, request);
        courtRepository.save(court);
        return toCourtReponse(court);
    }

    public void deleteCourt(Long id) {
        Court court = findCourtOrThrow(id);

        if (bookingRespository.existsByCourtId(id)) {
            throw new BookingConflictException("Không thể xoá sân đã có lịch đặt");
        }

        courtRepository.delete(court);
    }

    private Court findCourtOrThrow(Long id) {
        return courtRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Court not found"));
    }

    private void applyRequest(Court court, CourtRequest request) {
        court.setName(request.getName());
        court.setDescription(request.getDescription());
        court.setAddress(request.getAddress());
        court.setImage(request.getImage() != null ? request.getImage() : "");
        court.setPrice_per_hour(request.getPrice_per_hour());
        court.setOpen_time(request.getOpen_time());
        court.setClose_time(request.getClose_time());
        court.setSlot_duration_minutes(request.getSlot_duration_minutes());
        court.setStatus(Status.valueOf(request.getStatus()));
        court.setCourtType(CourtType.valueOf(request.getCourt_type()));
    }

    private CourtReponse toCourtReponse(Court court) {
        return new CourtReponse(
                court.getId(),
                court.getName(),
                court.getDescription(),
                court.getAddress(),
                court.getImage(),
                court.getPrice_per_hour(),
                court.getOpen_time().toString(),
                court.getClose_time().toString(),
                court.getSlot_duration_minutes(),
                court.getStatus().name(),
                reviewRepository.findAverageRatingByCourtId(court.getId()),
                court.getCourtType().name()
        );
    }
}
