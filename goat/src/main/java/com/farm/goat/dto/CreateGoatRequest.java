package com.farm.goat.dto;

import java.time.LocalDate;

public record CreateGoatRequest(
        String code,
        String gender,
        String label,
        Double currentWeight,
        Double capital,
        String fatherId,
        String motherId,
        String note,
        LocalDate date
) {}
