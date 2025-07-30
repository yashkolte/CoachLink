package com.yashkolte.coachlink.backend.config;

import com.yashkolte.coachlink.backend.entity.Coach;
import com.yashkolte.coachlink.backend.repository.CoachRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.FluentQuery;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Function;

@Configuration
@ConditionalOnProperty(name = "app.use-in-memory-db", havingValue = "true", matchIfMissing = false)
public class InMemoryDatabaseConfig {

    @Bean
    @Primary
    public CoachRepository inMemoryCoachRepository() {
        return new InMemoryCoachRepository();
    }

    public static class InMemoryCoachRepository implements CoachRepository {

        private final ConcurrentHashMap<String, Coach> coaches = new ConcurrentHashMap<>();
        private final AtomicLong idGenerator = new AtomicLong(1);

        @Override
        public <S extends Coach> S save(S coach) {
            if (coach.getId() == null) {
                coach.setId(String.valueOf(idGenerator.getAndIncrement()));
                coach.setCreatedAt(LocalDateTime.now());
            }
            coach.setUpdatedAt(LocalDateTime.now());
            coaches.put(coach.getId(), coach);
            return coach;
        }

        @Override
        public <S extends Coach> List<S> saveAll(Iterable<S> entities) {
            List<S> result = new ArrayList<>();
            entities.forEach(entity -> result.add(save(entity)));
            return result;
        }

        @Override
        public Optional<Coach> findById(String id) {
            return Optional.ofNullable(coaches.get(id));
        }

        @Override
        public boolean existsById(String id) {
            return coaches.containsKey(id);
        }

        @Override
        public List<Coach> findAll() {
            return new ArrayList<>(coaches.values());
        }

        @Override
        public List<Coach> findAll(Sort sort) {
            // Simple implementation - sorting not implemented for this demo
            return new ArrayList<>(coaches.values());
        }

        @Override
        public Page<Coach> findAll(Pageable pageable) {
            List<Coach> all = new ArrayList<>(coaches.values());
            return new PageImpl<>(all, pageable, all.size());
        }

        @Override
        public List<Coach> findAllById(Iterable<String> ids) {
            List<Coach> result = new ArrayList<>();
            ids.forEach(id -> findById(id).ifPresent(result::add));
            return result;
        }

        @Override
        public long count() {
            return coaches.size();
        }

        @Override
        public void deleteById(String id) {
            coaches.remove(id);
        }

        @Override
        public void delete(Coach entity) {
            coaches.remove(entity.getId());
        }

        @Override
        public void deleteAllById(Iterable<? extends String> ids) {
            ids.forEach(coaches::remove);
        }

        @Override
        public void deleteAll(Iterable<? extends Coach> entities) {
            entities.forEach(entity -> coaches.remove(entity.getId()));
        }

        @Override
        public void deleteAll() {
            coaches.clear();
        }

        @Override
        public Optional<Coach> findByEmail(String email) {
            return coaches.values().stream()
                    .filter(coach -> email.equals(coach.getEmail()))
                    .findFirst();
        }

        @Override
        public Optional<Coach> findByStripeAccountId(String stripeAccountId) {
            return coaches.values().stream()
                    .filter(coach -> stripeAccountId.equals(coach.getStripeAccountId()))
                    .findFirst();
        }

        // Example-based query methods (required by MongoRepository)
        @Override
        public <S extends Coach> Optional<S> findOne(Example<S> example) {
            return Optional.empty();
        }

        @Override
        public <S extends Coach> List<S> findAll(Example<S> example) {
            return new ArrayList<>((Collection<S>) coaches.values());
        }

        @Override
        public <S extends Coach> List<S> findAll(Example<S> example, Sort sort) {
            return new ArrayList<>((Collection<S>) coaches.values());
        }

        @Override
        public <S extends Coach> Page<S> findAll(Example<S> example, Pageable pageable) {
            List<S> all = new ArrayList<>((Collection<S>) coaches.values());
            return new PageImpl<>(all, pageable, all.size());
        }

        @Override
        public <S extends Coach> long count(Example<S> example) {
            return coaches.size();
        }

        @Override
        public <S extends Coach> boolean exists(Example<S> example) {
            return !coaches.isEmpty();
        }

        @Override
        public <S extends Coach, R> R findBy(Example<S> example,
                Function<FluentQuery.FetchableFluentQuery<S>, R> queryFunction) {
            return queryFunction.apply(null);
        }

        // Insert methods (required by MongoRepository)
        @Override
        public <S extends Coach> S insert(S entity) {
            return save(entity);
        }

        @Override
        public <S extends Coach> List<S> insert(Iterable<S> entities) {
            return saveAll(entities);
        }
    }
}
