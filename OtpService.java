package com.agribuddy.agribuddy_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class OtpService {

    @Autowired
    private JavaMailSender mailSender;

    // ✅ Store OTP with expiry
    private Map<String, String> otpStore = new HashMap<>();
    private Map<String, LocalDateTime> otpExpiry = new HashMap<>();

    // ✅ Generate OTP
    public String generateOtp(String phone) {
        SecureRandom random = new SecureRandom();
        String otp = String.valueOf(100000 + random.nextInt(900000));

        otpStore.put(phone, otp);
        otpExpiry.put(phone, LocalDateTime.now().plusMinutes(5));

        return otp;
    }

    // ✅ Verify OTP
    public boolean verifyOtp(String phone, String otp) {
        if (!otpStore.containsKey(phone)) return false;

        String storedOtp = otpStore.get(phone);
        LocalDateTime expiry = otpExpiry.get(phone);

        if (expiry.isBefore(LocalDateTime.now())) {
            otpStore.remove(phone);
            otpExpiry.remove(phone);
            return false;
        }

        if (storedOtp.equals(otp)) {
            otpStore.remove(phone);
            otpExpiry.remove(phone);
            return true;
        }

        return false;
    }

    // ✅ Send Email
    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("AgriFinTech - Your Login OTP");
        message.setText(
                "Your OTP is: " + otp + "\nValid for 5 minutes."
        );
        mailSender.send(message);
    }
}
