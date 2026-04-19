package com.farm.goat.dto;

import java.time.LocalDate;

public record ChichThuocRequest(String medicine, String note, LocalDate date, LocalDate nextDueDate, Double cost) {}
