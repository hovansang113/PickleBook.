package com.pickleball.sang.util;

import com.pickleball.sang.config.payment.VNPayConfig;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Pattern;

@Component
public class VNPayUtil {

    private final VNPayConfig vnPayConfig;

    public VNPayUtil(VNPayConfig vnPayConfig) {
        this.vnPayConfig = vnPayConfig;
    }

    public String createPaymentUrl(Long bookingId, BigDecimal amount, String orderInfo, String ipAddress) {
        try {
            String vnpTxnRef = bookingId + "_" + System.currentTimeMillis();
            Calendar calendar = Calendar.getInstance();
            String vnpCreateDate = new SimpleDateFormat("yyyyMMddHHmmss").format(calendar.getTime());
            calendar.add(Calendar.MINUTE, 15);
            String vnpExpireDate = new SimpleDateFormat("yyyyMMddHHmmss").format(calendar.getTime());

            Map<String, String> params = new TreeMap<>();
            params.put("vnp_Version", vnPayConfig.getVersion());
            params.put("vnp_Command", vnPayConfig.getCommand());
            params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
            params.put("vnp_Amount", String.valueOf(amount.multiply(BigDecimal.valueOf(100)).longValue()));
            params.put("vnp_CurrCode", "VND");
            params.put("vnp_TxnRef", vnpTxnRef);
            params.put("vnp_OrderInfo", removeDiacritics(orderInfo));
            params.put("vnp_OrderType", vnPayConfig.getOrderType());
            params.put("vnp_Locale", "vn");
            params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
            params.put("vnp_IpAddr", normalizeIp(ipAddress));
            params.put("vnp_CreateDate", vnpCreateDate);
            params.put("vnp_ExpireDate", vnpExpireDate);

            // tạo chuỗi hash
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            Iterator<Map.Entry<String, String>> iterator = params.entrySet().iterator();
            while (iterator.hasNext()) {
                Map.Entry<String, String> entry = iterator.next();
                hashData.append(entry.getKey()).append("=")
                        .append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
                query.append(URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII))
                        .append("=")
                        .append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
                if (iterator.hasNext()) {
                    hashData.append("&");
                    query.append("&");
                }
            }

            String hash = hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
            query.append("&vnp_SecureHash=").append(hash);

            return vnPayConfig.getVnpayUrl() + "?" + query;
        } catch (Exception e) {
            throw new RuntimeException("Error creating VNPay payment URL", e);
        }
    }

    public boolean verifyPayment(Map<String, String> params) {
        String vnpSecureHash = params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        Map<String, String> sortedParams = new TreeMap<>(params);
        StringBuilder hashData = new StringBuilder();
        Iterator<Map.Entry<String, String>> iterator = sortedParams.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, String> entry = iterator.next();
            hashData.append(entry.getKey()).append("=")
                    .append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
            if (iterator.hasNext()) {
                hashData.append("&");
            }
        }

        String hash = hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
        return hash.equals(vnpSecureHash);
    }

    private static final Pattern DIACRITICS = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");

    private String removeDiacritics(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        return DIACRITICS.matcher(normalized).replaceAll("")
                .replace('đ', 'd').replace('Đ', 'D');
    }

    private String normalizeIp(String ipAddress) {
        if ("0:0:0:0:0:0:0:1".equals(ipAddress) || "::1".equals(ipAddress)) {
            return "127.0.0.1";
        }
        return ipAddress;
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) sb.append(String.format("%02x", b & 0xff));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error creating HMAC SHA512", e);
        }
    }
}
