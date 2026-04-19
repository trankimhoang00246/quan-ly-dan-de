package com.farm.goat.service;

import com.farm.goat.dto.TransactionRequest;
import com.farm.goat.model.FarmTransaction;
import com.farm.goat.repository.FarmTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final FarmTransactionRepository transactionRepo;

    public List<FarmTransaction> getAll(LocalDate from, LocalDate to) {
        if (from != null && to != null) return transactionRepo.findByDateBetweenOrderByDateDesc(from, to);
        if (from != null) return transactionRepo.findAllByOrderByDateDesc().stream()
                .filter(t -> !t.getDate().isBefore(from)).toList();
        if (to != null) return transactionRepo.findAllByOrderByDateDesc().stream()
                .filter(t -> !t.getDate().isAfter(to)).toList();
        return transactionRepo.findAllByOrderByDateDesc();
    }

    public List<FarmTransaction> getByType(String type, LocalDate from, LocalDate to) {
        if (from != null && to != null) return transactionRepo.findByTypeAndDateBetweenOrderByDateDesc(type, from, to);
        if (from != null) return transactionRepo.findByTypeOrderByDateDesc(type).stream()
                .filter(t -> !t.getDate().isBefore(from)).toList();
        if (to != null) return transactionRepo.findByTypeOrderByDateDesc(type).stream()
                .filter(t -> !t.getDate().isAfter(to)).toList();
        return transactionRepo.findByTypeOrderByDateDesc(type);
    }

    public FarmTransaction create(TransactionRequest req) {
        FarmTransaction t = new FarmTransaction();
        t.setDescription(req.description());
        t.setAmount(req.amount());
        t.setType(req.type());
        t.setDate(req.date());
        t.setNote(req.note());
        t.setCreatedAt(LocalDateTime.now());
        return transactionRepo.save(t);
    }

    public FarmTransaction update(String id, TransactionRequest req) {
        FarmTransaction t = transactionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch: " + id));
        t.setDescription(req.description());
        t.setAmount(req.amount());
        t.setType(req.type());
        t.setDate(req.date());
        t.setNote(req.note());
        return transactionRepo.save(t);
    }

    public void delete(String id) {
        transactionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch: " + id));
        transactionRepo.deleteById(id);
    }

    public double sumByType(String type, LocalDate from, LocalDate to) {
        return getAll(from, to).stream()
                .filter(t -> type.equals(t.getType()))
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0)
                .sum();
    }
}
