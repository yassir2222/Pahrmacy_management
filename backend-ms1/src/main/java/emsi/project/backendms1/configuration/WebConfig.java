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
                                // Primary origin for Expo Go development via Metro bundler
                                "http://localhost:8081",
                                // Fallback origin often used by Expo Web or other tools
                                "http://localhost:19006"
                                // Add your deployed frontend URL here for production later
                                // e.g., "https://myapp.com"
                                // You can usually remove "exp://*" unless you encounter issues
                        )
                        // Allow standard HTTP methods including OPTIONS for preflight
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        // Allow all headers requested by the client
                        .allowedHeaders("*")
                        // Allow cookies and authorization headers
                        .allowCredentials(true);
            }
        };
    }

    // Add other @Bean definitions or configurations if needed
}