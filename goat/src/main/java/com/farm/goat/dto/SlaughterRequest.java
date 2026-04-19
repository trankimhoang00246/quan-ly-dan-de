package com.farm.goat.dto;

import java.time.LocalDate;

public record SlaughterRequest(Double price, Double weight, String note, LocalDate date) {}
