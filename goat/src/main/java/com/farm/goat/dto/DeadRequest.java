package com.farm.goat.dto;

import java.time.LocalDate;

public record DeadRequest(Double price, Double weight, String note, LocalDate date) {}
