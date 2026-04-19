package com.farm.goat.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Document(collection = "farm_transactions")
public class FarmTransaction {
    @Id
    private String id;
    private String description;
    private Double amount;
    private String type; // EXPENSE or REVENUE
    private LocalDate date;
    private String note;
    private LocalDateTime createdAt;
}
