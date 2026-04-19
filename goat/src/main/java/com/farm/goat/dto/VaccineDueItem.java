package com.farm.goat.dto;

import java.time.LocalDate;

public record VaccineDueItem(
        String goatId,
        String goatCode,
        String medicine,
        LocalDate nextDueDate,
        long daysLeft
) {}
