package com.farm.goat.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

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
    private String fatherCode;
    private String motherCode;
    private String status;   // ALIVE, SOLD, DEAD, SLAUGHTERED
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
