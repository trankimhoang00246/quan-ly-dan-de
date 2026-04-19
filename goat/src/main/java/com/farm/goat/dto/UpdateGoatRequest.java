package com.farm.goat.dto;

public record UpdateGoatRequest(
        String gender,
        String label,
        String tag,
        Double capital,
        String note
) {}
