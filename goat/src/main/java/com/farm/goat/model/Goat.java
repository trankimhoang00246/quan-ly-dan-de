package com.farm.goat.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Document(collection = "goats")
public class Goat {
    @Id
    private String id;
    private String code;
    private String gender;   // MALE, FEMALE
    private String label;    // BUON, GIONG
    private Double currentWeight;
    private Double capital;
    private String fatherId;
    private String fatherCode;
    private String motherId;
    private String motherCode;
    private String status;   // ALIVE, SOLD, DEAD, SLAUGHTERED
    private String note;
    private LocalDate date;       // ngày thực tế (nhập/sinh), dùng cho thống kê
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
