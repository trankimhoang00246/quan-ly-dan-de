package com.farm.goat.controller;

import com.farm.goat.model.Goat;
import com.farm.goat.model.GoatLog;
import com.farm.goat.repository.GoatLogRepository;
import com.farm.goat.repository.GoatRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class ExportController {

    private final GoatRepository goatRepo;
    private final GoatLogRepository logRepo;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final Map<String, String> GENDER = Map.of("MALE", "Đực", "FEMALE", "Cái");
    private static final Map<String, String> LABEL  = Map.of("BUON", "Buôn", "GIONG", "Giống");
    private static final Map<String, String> STATUS = Map.of(
            "ALIVE", "Còn sống", "SOLD", "Đã bán", "DEAD", "Đã chết", "SLAUGHTERED", "Đã mổ");
    private static final Map<String, String> TAG    = Map.of("DEP", "Đẹp", "XAU", "Xấu");

    @GetMapping("/goats")
    public ResponseEntity<byte[]> exportGoats() throws Exception {
        List<Goat> goats = goatRepo.findAllByOrderByCreatedAtDesc();

        // Build a map: goatId -> latest SELL/SLAUGHTER log price
        List<GoatLog> revLogs = logRepo.findByActionIn(List.of("SELL", "SLAUGHTER"));
        Map<String, Double> revenueByGoat = revLogs.stream()
                .filter(l -> l.getPrice() != null)
                .collect(Collectors.toMap(GoatLog::getGoatId, GoatLog::getPrice, (a, b) -> a));

        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Danh sách đàn dê");
            sheet.setColumnWidth(0, 3000);
            sheet.setColumnWidth(1, 3500);
            sheet.setColumnWidth(2, 3500);
            sheet.setColumnWidth(3, 3500);
            sheet.setColumnWidth(4, 3000);
            sheet.setColumnWidth(5, 4000);
            sheet.setColumnWidth(6, 4000);
            sheet.setColumnWidth(7, 4000);
            sheet.setColumnWidth(8, 4000);
            sheet.setColumnWidth(9, 4000);
            sheet.setColumnWidth(10, 4000);

            // Header style
            CellStyle hdrStyle = wb.createCellStyle();
            Font hdrFont = wb.createFont();
            hdrFont.setBold(true);
            hdrStyle.setFont(hdrFont);
            hdrStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
            hdrStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            hdrStyle.setBorderBottom(BorderStyle.THIN);

            // Create header row
            Row hdr = sheet.createRow(0);
            String[] cols = {"Mã số", "Giới tính", "Nhãn", "Đánh giá", "Cân nặng (kg)",
                    "Vốn (đ)", "Doanh thu (đ)", "Lãi/Lỗ (đ)", "Trạng thái",
                    "Cha", "Mẹ", "Ngày nhập/sinh"};
            for (int i = 0; i < cols.length; i++) {
                Cell c = hdr.createCell(i);
                c.setCellValue(cols[i]);
                c.setCellStyle(hdrStyle);
            }

            // Data rows
            CellStyle numStyle = wb.createCellStyle();
            DataFormat fmt = wb.createDataFormat();
            numStyle.setDataFormat(fmt.getFormat("#,##0"));

            int rowIdx = 1;
            for (Goat g : goats) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(g.getCode());
                row.createCell(1).setCellValue(GENDER.getOrDefault(g.getGender(), g.getGender()));
                row.createCell(2).setCellValue(LABEL.getOrDefault(g.getLabel(), g.getLabel()));
                row.createCell(3).setCellValue(g.getTag() != null ? TAG.getOrDefault(g.getTag(), g.getTag()) : "");
                if (g.getCurrentWeight() != null) row.createCell(4).setCellValue(g.getCurrentWeight());
                else row.createCell(4).setCellValue("");

                Cell capCell = row.createCell(5);
                capCell.setCellValue(g.getCapital() != null ? g.getCapital() : 0);
                capCell.setCellStyle(numStyle);

                Double revenue = revenueByGoat.get(g.getId());
                Cell revCell = row.createCell(6);
                if (revenue != null) { revCell.setCellValue(revenue); revCell.setCellStyle(numStyle); }
                else revCell.setCellValue("");

                Cell profitCell = row.createCell(7);
                if (revenue != null && g.getCapital() != null) {
                    profitCell.setCellValue(revenue - g.getCapital());
                    profitCell.setCellStyle(numStyle);
                } else profitCell.setCellValue("");

                row.createCell(8).setCellValue(STATUS.getOrDefault(g.getStatus(), g.getStatus()));
                row.createCell(9).setCellValue(g.getFatherCode() != null ? g.getFatherCode() : "");
                row.createCell(10).setCellValue(g.getMotherCode() != null ? g.getMotherCode() : "");

                String dateStr = g.getDate() != null
                        ? g.getDate().format(DATE_FMT)
                        : (g.getCreatedAt() != null ? g.getCreatedAt().toLocalDate().format(DATE_FMT) : "");
                row.createCell(11).setCellValue(dateStr);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"dan-de.xlsx\"")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(out.toByteArray());
        }
    }
}
