package com.farm.goat.dto;

import java.time.LocalDate;

public record SellRequest(Double price, Double weight, String note, LocalDate date) {}
