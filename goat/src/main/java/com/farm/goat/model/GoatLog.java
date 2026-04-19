package com.farm.goat.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Document(collection = "goat_logs")
public class GoatLog {
    @Id
    private String id;
    private String goatId;
    private String action;   // CREATE, UPDATE_WEIGHT, SELL, DEAD, SLAUGHTER, CHICH_THUOC
    private Double weight;
    private Double price;
    private String medicine; // tên thuốc (cho hành động CHICH_THUOC)
    private String note;
    private LocalDate date;       // ngày thực tế của hành động, dùng cho thống kê
    private LocalDateTime createdAt;
}
