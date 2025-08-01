package com.yashkolte.coachlink.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * CORS (Cross-Origin Resource Sharing) Configuration for CoachLink API
 *
 * This configuration enables secure cross-origin requests between the frontend
 * application and the backend API. It's specifically configured to: - Allow
 * requests from the Next.js frontend application - Support all necessary HTTP
 * methods for RESTful operations - Enable credential sharing for authentication
 * - Handle preflight OPTIONS requests properly
 *
 * The configuration supports both development and production environments by
 * using configurable allowed origins.
 *
 * @author Yash Kolte
 * @version 1.0
 * @since 2024
 */
@Configuration
@Slf4j
public class CorsConfig implements WebMvcConfigurer {

    /**
     * Allowed origins for CORS requests, injected from application properties
     * Typically includes frontend application URLs (e.g., http://localhost:3000
     * for dev)
     */
    @Value("${cors.allowed.origins}")
    private String allowedOrigins;

    /**
     * Configure CORS mappings for API endpoints
     *
     * This method sets up CORS rules specifically for API endpoints (/api/**).
     * It allows all standard REST methods and enables credential sharing for
     * authenticated requests.
     *
     * @param registry The CORS registry to configure
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        log.info("Configuring CORS for API endpoints with allowed origins: {}", allowedOrigins);

        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins) // From application properties
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // All REST methods
                .allowedHeaders("*") // Allow all headers
                .allowCredentials(true);         // Enable credentials for auth
    }

    /**
     * Create a global CORS configuration source
     *
     * This bean provides a fallback CORS configuration for all endpoints that
     * aren't explicitly mapped above. It's more permissive and useful for
     * development environments or when specific endpoint mapping isn't needed.
     *
     * @return Configured CorsConfigurationSource
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        log.info("Creating global CORS configuration source");

        CorsConfiguration configuration = new CorsConfiguration();

        // Global configuration - more permissive for development
        configuration.setAllowedOriginPatterns(List.of("*"));  // Allow all origins with patterns
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));         // Allow all headers
        configuration.setAllowCredentials(true);               // Enable credentials

        // Apply configuration to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
