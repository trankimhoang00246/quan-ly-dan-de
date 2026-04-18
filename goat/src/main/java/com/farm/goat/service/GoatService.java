package com.farm.goat.service;

import com.farm.goat.dto.*;
import com.farm.goat.model.Goat;
import com.farm.goat.model.GoatLog;
import com.farm.goat.repository.GoatLogRepository;
import com.farm.goat.repository.GoatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoatService {

    private final GoatRepository goatRepo;
    private final GoatLogRepository logRepo;

    public List<Goat> getAllGoats() {
        return goatRepo.findAllByOrderByCreatedAtDesc();
    }

    public Goat getGoat(String id) {
        return goatRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dê: " + id));
    }

    public Goat createGoat(CreateGoatRequest req) {
        if (goatRepo.existsByCodeAndStatus(req.code(), "ALIVE")) {
            throw new RuntimeException("Mã dê '" + req.code() + "' đang được sử dụng bởi con dê khác còn sống");
        }

        Goat goat = new Goat();
        goat.setCode(req.code());
        goat.setGender(req.gender());
        goat.setLabel(req.label());
        goat.setCurrentWeight(req.currentWeight());
        goat.setCapital(req.capital() != null ? req.capital() : 0.0);
        goat.setFatherCode(req.fatherCode());
        goat.setMotherCode(req.motherCode());
        goat.setNote(req.note());
        goat.setStatus("ALIVE");
        goat.setCreatedAt(LocalDateTime.now());
        goat.setUpdatedAt(LocalDateTime.now());
        goat = goatRepo.save(goat);

        String logNote = "Tạo mới dê";
        if (req.fatherCode() != null || req.motherCode() != null) {
            logNote += " (đẻ từ cha: " + req.fatherCode() + ", mẹ: " + req.motherCode() + ")";
        }
        if (req.note() != null && !req.note().isBlank()) {
            logNote += " - " + req.note();
        }
        saveLog(goat.getId(), "CREATE", req.currentWeight(), req.capital(), logNote);
        return goat;
    }

    public Goat updateWeight(String id, UpdateWeightRequest req) {
        Goat goat = getGoat(id);
        if (!"ALIVE".equals(goat.getStatus())) throw new RuntimeException("Chỉ cập nhật cân cho dê còn sống");
        goat.setCurrentWeight(req.weight());
        goat.setUpdatedAt(LocalDateTime.now());
        goatRepo.save(goat);
        saveLog(id, "UPDATE_WEIGHT", req.weight(), null, req.note());
        return goat;
    }

    public Goat sell(String id, SellRequest req) {
        Goat goat = getGoat(id);
        if (!"ALIVE".equals(goat.getStatus())) throw new RuntimeException("Dê không còn sống");
        goat.setStatus("SOLD");
        if (req.weight() != null) goat.setCurrentWeight(req.weight());
        goat.setUpdatedAt(LocalDateTime.now());
        goatRepo.save(goat);
        saveLog(id, "SELL", req.weight(), req.price(), req.note());
        return goat;
    }

    public Goat markDead(String id, DeadRequest req) {
        Goat goat = getGoat(id);
        if (!"ALIVE".equals(goat.getStatus())) throw new RuntimeException("Dê không còn sống");
        goat.setStatus("DEAD");
        goat.setUpdatedAt(LocalDateTime.now());
        goatRepo.save(goat);
        saveLog(id, "DEAD", req.weight(), req.price(), req.note());
        return goat;
    }

    public Goat slaughter(String id, SlaughterRequest req) {
        Goat goat = getGoat(id);
        if (!"ALIVE".equals(goat.getStatus())) throw new RuntimeException("Dê không còn sống");
        goat.setStatus("SLAUGHTERED");
        goat.setUpdatedAt(LocalDateTime.now());
        goatRepo.save(goat);
        saveLog(id, "SLAUGHTER", req.weight(), req.price(), req.note());
        return goat;
    }

    public List<GoatLog> getLogs(String id) {
        return logRepo.findByGoatIdOrderByCreatedAtDesc(id);
    }

    private void saveLog(String goatId, String action, Double weight, Double price, String note) {
        GoatLog log = new GoatLog();
        log.setGoatId(goatId);
        log.setAction(action);
        log.setWeight(weight);
        log.setPrice(price);
        log.setNote(note);
        log.setCreatedAt(LocalDateTime.now());
        logRepo.save(log);
    }
}
