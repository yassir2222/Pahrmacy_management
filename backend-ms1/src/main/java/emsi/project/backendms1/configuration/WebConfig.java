package emsi.project.backendms1.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig { // Remove "implements WebMvcConfigurer"

    // Remove the addCorsMappings method that was directly in the class

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // Apply CORS rules only to API paths
                registry.addMapping("/api/**")
                        .allowedOrigins(
                                "http://localhost:8081",
                                "http://localhost:19006",
                                "http://localhost:4200"

                        )
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }

}