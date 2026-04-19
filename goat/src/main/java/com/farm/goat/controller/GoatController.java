package com.farm.goat.controller;

import com.farm.goat.dto.*;
import com.farm.goat.model.Goat;
import com.farm.goat.model.GoatLog;
import com.farm.goat.service.GoatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goats")
@RequiredArgsConstructor
public class GoatController {

    private final GoatService goatService;

    @GetMapping
    public List<Goat> getAllGoats() {
        return goatService.getAllGoats();
    }

    @GetMapping("/herd")
    public List<Goat> getHerdGoats() {
        return goatService.getHerdGoats();
    }

    @GetMapping("/inactive")
    public List<Goat> getInactiveGoats() {
        return goatService.getInactiveGoats();
    }

    @PostMapping
    public ResponseEntity<?> createGoat(@RequestBody CreateGoatRequest req) {
        try {
            return ResponseEntity.ok(goatService.createGoat(req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getGoat(@PathVariable String id) {
        try {
            return ResponseEntity.ok(goatService.getGoat(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateGoat(@PathVariable String id, @RequestBody UpdateGoatRequest req) {
        try {
            return ResponseEntity.ok(goatService.updateGoat(id, req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/weight")
    public ResponseEntity<?> updateWeight(@PathVariable String id, @RequestBody UpdateWeightRequest req) {
        try {
            return ResponseEntity.ok(goatService.updateWeight(id, req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/sell")
    public ResponseEntity<?> sell(@PathVariable String id, @RequestBody SellRequest req) {
        try {
            return ResponseEntity.ok(goatService.sell(id, req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/dead")
    public ResponseEntity<?> markDead(@PathVariable String id, @RequestBody DeadRequest req) {
        try {
            return ResponseEntity.ok(goatService.markDead(id, req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/slaughter")
    public ResponseEntity<?> slaughter(@PathVariable String id, @RequestBody SlaughterRequest req) {
        try {
            return ResponseEntity.ok(goatService.slaughter(id, req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/chich-thuoc")
    public ResponseEntity<?> chichThuoc(@PathVariable String id, @RequestBody ChichThuocRequest req) {
        try {
            return ResponseEntity.ok(goatService.chichThuoc(id, req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGoat(@PathVariable String id) {
        try {
            goatService.deleteGoat(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa dê thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/children")
    public List<Goat> getChildren(@PathVariable String id) {
        return goatService.getChildren(id);
    }

    @GetMapping("/{id}/logs")
    public List<GoatLog> getLogs(@PathVariable String id) {
        return goatService.getLogs(id);
    }

    @GetMapping("/stats")
    public DashboardStats getDashboardStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return goatService.getDashboardStats(from, to);
    }
}
