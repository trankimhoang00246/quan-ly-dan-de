package com.farm.goat.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "goat_logs")
public class GoatLog {
    @Id
    private String id;
    private String goatId;
    private String action;   // CREATE, UPDATE_WEIGHT, SELL, DEAD, SLAUGHTER
    private Double weight;
    private Double price;
    private String note;
    private LocalDateTime createdAt;
}
