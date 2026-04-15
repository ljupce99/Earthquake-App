package codeit.mk.earthquake.repository;

import codeit.mk.earthquake.model.Earthquake;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface EarthquakeRepository extends JpaRepository<Earthquake, Long> {

    Optional<Earthquake> findByUsgsId(String usgsId);

    List<Earthquake> findByMagnitudeGreaterThan(double magnitude);

    List<Earthquake> findByTimeAfter(Instant time);

    List<Earthquake> findByMagnitudeGreaterThanAndTimeAfter(double magnitude, Instant time);

    @Modifying
    @Query("DELETE FROM Earthquake e")
    void deleteAllEarthquakes();

    @Query("SELECT COUNT(e) FROM Earthquake e WHERE e.magnitude > :mag")
    long countByMagnitudeGreaterThan(@Param("mag") double mag);
}
