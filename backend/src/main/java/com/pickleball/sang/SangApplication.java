package com.pickleball.sang;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SangApplication {

	public static void main(String[] args) {
		SpringApplication.run(SangApplication.class, args);
	}

}
