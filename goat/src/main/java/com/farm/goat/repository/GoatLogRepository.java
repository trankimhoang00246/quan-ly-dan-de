package com.farm.goat.repository;

import com.farm.goat.model.GoatLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface GoatLogRepository extends MongoRepository<GoatLog, String> {
    List<GoatLog> findByGoatIdOrderByCreatedAtDesc(String goatId);
}
