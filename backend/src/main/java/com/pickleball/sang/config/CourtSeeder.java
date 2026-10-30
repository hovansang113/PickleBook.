package com.pickleball.sang.config;

import java.time.LocalTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.pickleball.sang.entity.courts.Court;
import com.pickleball.sang.entity.courts.CourtType;
import com.pickleball.sang.entity.courts.Status;
import com.pickleball.sang.repository.CourtRepository;

@Component
@Order(2)
public class CourtSeeder implements CommandLineRunner {

    private final CourtRepository courtRepository;

    public CourtSeeder(CourtRepository courtRepository) {
        this.courtRepository = courtRepository;
    }

    @Override
    public void run(String... args) {
        if (courtRepository.count() > 0) {
            return;
        }

        seedCourt("Sân 1", "Sân pickleball tiêu chuẩn, mặt sân chống trơn trượt.",
                "123 Nguyễn Văn Linh, Quận 7, TP.HCM", 150000, CourtType.INSIDE);
        seedCourt("Sân 2", "Sân trong nhà, có mái che, chơi được cả khi trời mưa.",
                "45 Lê Văn Việt, Quận 9, TP.HCM", 180000, CourtType.INSIDE);
        seedCourt("Sân 3", "Sân ngoài trời, không gian rộng rãi, nhiều cây xanh.",
                "78 Phạm Văn Đồng, TP. Thủ Đức, TP.HCM", 120000, CourtType.OUTSIDE);
        seedCourt("Sân 4", "Sân trong nhà diện tích nhỏ, phù hợp tập luyện cá nhân.",
                "12 Cách Mạng Tháng 8, Quận 3, TP.HCM", 100000, CourtType.INSIDE);
        seedCourt("Sân 5", "Sân ngoài trời khuôn viên rộng, phù hợp giao lưu đông người.",
                "56 Nguyễn Thị Thập, Quận 7, TP.HCM", 130000, CourtType.OUTSIDE);
        seedCourt("Sân 6", "Sân ngoài trời trên tầng thượng, view thoáng đãng.",
                "9 Trần Não, TP. Thủ Đức, TP.HCM", 160000, CourtType.OUTSIDE);
    }

    private void seedCourt(String name, String description, String address, double pricePerHour, CourtType courtType) {
        Court court = new Court();
        court.setName(name);
        court.setDescription(description);
        court.setAddress(address);
        court.setImage("");
        court.setPrice_per_hour(pricePerHour);
        court.setOpen_time(LocalTime.of(6, 0));
        court.setClose_time(LocalTime.of(22, 0));
        court.setSlot_duration_minutes(60);
        court.setStatus(Status.ACTIVE);
        court.setCourtType(courtType);

        courtRepository.save(court);
    }
}
