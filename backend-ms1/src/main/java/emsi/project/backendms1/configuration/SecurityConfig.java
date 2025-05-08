package emsi.project.backendms1.configuration;

import emsi.project.backendms1.filter.JwtFilter;
import emsi.project.backendms1.service.CustomUserDetailsService;
import org.apache.catalina.filters.CorsFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity

public class SecurityConfig {
    private final CustomUserDetailsService customUserDetailsService;
    private final JwtUtils jwtUtils;

    public SecurityConfig(CustomUserDetailsService customUserDetailsService, JwtUtils jwtUtils) {
        this.customUserDetailsService = customUserDetailsService;
        this.jwtUtils = jwtUtils;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http, PasswordEncoder passwordEncoder) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        authenticationManagerBuilder.userDetailsService(customUserDetailsService).passwordEncoder(passwordEncoder);
        return authenticationManagerBuilder.build();
    }
    @Bean
    @Order(1) // This chain will be evaluated first
    public SecurityFilterChain actuatorPrometheusFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/actuator/prometheus") // IMPORTANT: This chain only applies to /actuator/prometheus
                .authorizeHttpRequests(authorize -> authorize
                        .anyRequest().permitAll() // All requests matching this path are permitted
                )
                .csrf(AbstractHttpConfigurer::disable); // Disable CSRF for this specific path
        // Note: No JwtFilter is added to this chain
        return http.build();
    }
    @Bean
    @Order(2)
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http.sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .cors(withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth ->
                        auth.requestMatchers("/api/auth/**","/actuator/prometheus").permitAll()
                                .anyRequest().authenticated())
                .addFilterBefore(new JwtFilter(jwtUtils, customUserDetailsService), UsernamePasswordAuthenticationFilter.class)
                .build();
    }



}
