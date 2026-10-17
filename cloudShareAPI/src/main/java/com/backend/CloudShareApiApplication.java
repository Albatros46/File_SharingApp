package com.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class CloudShareApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(CloudShareApiApplication.class, args);
	}

}
