package com.farm.goat.controller;

import com.farm.goat.dto.TransactionRequest;
import com.farm.goat.model.FarmTransaction;
import com.farm.goat.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public List<FarmTransaction> getAll(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (type != null && !type.isBlank()) return transactionService.getByType(type, from, to);
        return transactionService.getAll(from, to);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody TransactionRequest req) {
        try {
            return ResponseEntity.ok(transactionService.create(req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody TransactionRequest req) {
        try {
            return ResponseEntity.ok(transactionService.update(id, req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        try {
            transactionService.delete(id);
            return ResponseEntity.ok(Map.of("message", "Da xoa giao dich thanh cong"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
