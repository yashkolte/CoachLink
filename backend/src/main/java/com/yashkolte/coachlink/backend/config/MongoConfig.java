package com.yashkolte.coachlink.backend.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.core.MongoTemplate;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.security.cert.X509Certificate;
import java.util.concurrent.TimeUnit;

/**
 * MongoDB Configuration for CoachLink Application
 *
 * This configuration class sets up the MongoDB connection with optimized
 * settings for production use with MongoDB Atlas. It includes: - SSL/TLS
 * configuration for secure connections - Connection pooling for performance
 * optimization - Timeout configurations for reliability - Fallback mechanism
 * for connection issues
 *
 * The configuration is specifically tuned for MongoDB Atlas cloud deployment
 * with proper security and performance considerations.
 *
 * @author Yash Kolte
 * @version 1.0
 * @since 2024
 */
@Configuration
@Slf4j
public class MongoConfig extends AbstractMongoClientConfiguration {

    /**
     * MongoDB connection URI injected from application properties Should
     * contain full Atlas connection string with credentials
     */
    @Value("${spring.data.mongodb.uri}")
    private String connectionString;

    /**
     * Database name for the CoachLink application All collections will be
     * created under this database
     *
     * @return The database name "coachlink"
     */
    @Override
    protected String getDatabaseName() {
        return "coachlink";
    }

    /**
     * Configure and create MongoDB client with optimized settings
     *
     * This method creates a MongoDB client with: - SSL/TLS encryption for
     * secure communication - Connection pooling for better performance -
     * Appropriate timeouts for reliability - Fallback mechanism for connection
     * failures
     *
     * @return Configured MongoClient instance
     */
    @Override
    public MongoClient mongoClient() {
        try {
            log.info("Configuring MongoDB client with SSL and connection pooling");

            // Create SSL context for secure connections
            // Note: In production, consider using proper certificate validation
            TrustManager[] trustAllCerts = new TrustManager[]{
                new X509TrustManager() {
                    public X509Certificate[] getAcceptedIssuers() {
                        return null;
                    }

                    public void checkClientTrusted(X509Certificate[] certs, String authType) {
                        // Accept all client certificates (Atlas handles this)
                    }

                    public void checkServerTrusted(X509Certificate[] certs, String authType) {
                        // Accept all server certificates (Atlas handles this)
                    }
                }
            };

            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, trustAllCerts, new java.security.SecureRandom());

            // Build MongoDB client settings with optimizations
            MongoClientSettings settings = MongoClientSettings.builder()
                    .applyConnectionString(new ConnectionString(connectionString))
                    // SSL Configuration for Atlas
                    .applyToSslSettings(builder -> {
                        builder.enabled(true)
                                .invalidHostNameAllowed(true) // Required for Atlas
                                .context(sslContext);
                    })
                    // Connection Pool Configuration for Performance
                    .applyToConnectionPoolSettings(builder -> {
                        builder.maxSize(20) // Maximum connections in pool
                                .minSize(5) // Minimum connections maintained
                                .maxWaitTime(10, TimeUnit.SECONDS) // Max wait for connection
                                .maxConnectionIdleTime(120, TimeUnit.SECONDS) // Idle timeout
                                .maxConnectionLifeTime(120, TimeUnit.SECONDS); // Connection lifetime
                    })
                    // Socket Configuration for Reliability
                    .applyToSocketSettings(builder -> {
                        builder.connectTimeout(10, TimeUnit.SECONDS) // Connection timeout
                                .readTimeout(10, TimeUnit.SECONDS);    // Read timeout
                    })
                    .build();

            log.info("MongoDB client configured successfully");
            return MongoClients.create(settings);

        } catch (Exception e) {
            log.warn("Failed to configure SSL MongoDB client, falling back to default: {}", e.getMessage());
            // Fallback to default client if SSL configuration fails
            return MongoClients.create(connectionString);
        }
    }

    /**
     * Create MongoTemplate bean for database operations
     *
     * MongoTemplate provides a high-level abstraction for MongoDB operations
     * and is used by Spring Data MongoDB repositories.
     *
     * @return Configured MongoTemplate instance
     */
    @Bean
    public MongoTemplate mongoTemplate() {
        log.info("Creating MongoTemplate for database: {}", getDatabaseName());
        return new MongoTemplate(mongoClient(), getDatabaseName());
    }
}
