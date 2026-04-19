package com.farm.goat.dto;

public record DashboardStats(
        int totalGoats,
        int aliveCount,
        int soldCount,
        int deadCount,
        int slaughteredCount,
        int maleAlive,
        int femaleAlive,
        int buonAlive,
        int giongAlive,
        double totalCapital,
        double totalRevenue,
        double avgWeightAlive
) {}
