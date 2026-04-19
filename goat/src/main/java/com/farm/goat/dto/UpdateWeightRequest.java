package com.farm.goat.dto;

import java.time.LocalDate;

public record UpdateWeightRequest(Double weight, String note, LocalDate date) {}
