package com.farm.goat.repository;

import com.farm.goat.model.Goat;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface GoatRepository extends MongoRepository<Goat, String> {
    boolean existsByCodeAndStatus(String code, String status);
    List<Goat> findAllByOrderByCreatedAtDesc();
    Optional<Goat> findByCodeAndStatus(String code, String status);
}
