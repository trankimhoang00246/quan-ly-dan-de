package com.farm.goat.dto;

import java.time.LocalDate;

public record TransactionRequest(
        String description,
        Double amount,
        String type,
        LocalDate date,
        String note
) {}
