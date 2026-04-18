package com.farm.goat.dto;

public record CreateGoatRequest(
        String code,
        String gender,
        String label,
        Double currentWeight,
        Double capital,
        String fatherCode,
        String motherCode,
        String note
) {}
