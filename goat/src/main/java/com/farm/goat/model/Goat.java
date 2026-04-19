package com.farm.goat.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Document(collection = "goats")
@CompoundIndexes({
    @CompoundIndex(name = "status_createdAt", def = "{'status': 1, 'createdAt': -1}"),
    @CompoundIndex(name = "code_status", def = "{'code': 1, 'status': 1}"),
})
public class Goat {
    @Id
    private String id;
    private String code;
    private String gender;
    private String label;
    private Double currentWeight;
    private Double capital;
    @Indexed
    private String fatherId;
    @Indexed
    private String motherId;
    private String fatherCode;
    private String motherCode;
    @Indexed
    private String status;
    private String tag;
    private String note;
    private LocalDate date;
    @Indexed
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
