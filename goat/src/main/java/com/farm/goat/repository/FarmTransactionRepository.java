package com.farm.goat.repository;

import com.farm.goat.model.FarmTransaction;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface FarmTransactionRepository extends MongoRepository<FarmTransaction, String> {
    List<FarmTransaction> findAllByOrderByDateDesc();
    List<FarmTransaction> findByDateBetweenOrderByDateDesc(LocalDate from, LocalDate to);
    List<FarmTransaction> findByTypeOrderByDateDesc(String type);
    List<FarmTransaction> findByTypeAndDateBetweenOrderByDateDesc(String type, LocalDate from, LocalDate to);
}
