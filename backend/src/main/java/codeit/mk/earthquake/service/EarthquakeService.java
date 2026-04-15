package codeit.mk.earthquake.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import codeit.mk.earthquake.config.EarthquakeMapper;
import codeit.mk.earthquake.dto.EarthquakeDto;
import codeit.mk.earthquake.exception.EarthquakeNotFoundException;
import codeit.mk.earthquake.model.Earthquake;
import codeit.mk.earthquake.repository.EarthquakeRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EarthquakeService {

    private final EarthquakeRepository earthquakeRepository;
    private final UsgsApiService usgsApiService;
    private final EarthquakeMapper earthquakeMapper;

    @Value("${earthquake.filter.min-magnitude:2.0}")
    private double minMagnitude;

    /**
     * Fetches fresh data from USGS, filters by magnitude > 2.0,
     * clears existing records and saves new ones.
     * Returns the saved earthquake DTOs.
     */
    @Transactional
    public List<EarthquakeDto> fetchAndRefreshEarthquakes() {
        log.info("Starting earthquake data refresh from USGS API");

        List<Earthquake> fetched = usgsApiService.fetchEarthquakes();

        List<Earthquake> filtered = fetched.stream()
                .filter(e -> e.getMagnitude() != null && e.getMagnitude() >= minMagnitude)
                .collect(Collectors.toList());

        log.info("Filtered {} earthquakes with magnitude > {} from {} total fetched",
                filtered.size(), minMagnitude, fetched.size());

        // Delete all existing records to avoid duplicates
        earthquakeRepository.deleteAllEarthquakes();
        log.info("Cleared existing earthquake records from database");

        List<Earthquake> saved = earthquakeRepository.saveAll(filtered);
        log.info("Saved {} new earthquake records to database", saved.size());

        return saved.stream()
                .map(earthquakeMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Returns all stored earthquakes.
     */
    @Transactional(readOnly = true)
    public List<EarthquakeDto> getAllEarthquakes() {
        return earthquakeRepository.findAll().stream()
                .map(earthquakeMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Returns earthquakes filtered by minimum magnitude.
     */
    @Transactional(readOnly = true)
    public List<EarthquakeDto> getEarthquakesByMinMagnitude(double minMag) {
        if (minMag < 0) {
            throw new IllegalArgumentException("Minimum magnitude cannot be negative");
        }
        return earthquakeRepository.findByMagnitudeGreaterThan(minMag).stream()
                .map(earthquakeMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Returns earthquakes that occurred after a given timestamp.
     */
    @Transactional(readOnly = true)
    public List<EarthquakeDto> getEarthquakesAfter(Instant time) {
        if (time == null) {
            throw new IllegalArgumentException("Time parameter cannot be null");
        }
        return earthquakeRepository.findByTimeAfter(time).stream()
                .map(earthquakeMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Returns earthquakes filtered by both minimum magnitude and time.
     */
    @Transactional(readOnly = true)
    public List<EarthquakeDto> getEarthquakesByMagnitudeAndTime(double minMag, Instant after) {
        if (minMag < 0) {
            throw new IllegalArgumentException("Minimum magnitude cannot be negative");
        }
        if (after == null) {
            throw new IllegalArgumentException("Time parameter cannot be null");
        }
        return earthquakeRepository.findByMagnitudeGreaterThanAndTimeAfter(minMag, after).stream()
                .map(earthquakeMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Returns a single earthquake by its database ID.
     */
    @Transactional(readOnly = true)
    public EarthquakeDto getEarthquakeById(Long id) {
        Earthquake earthquake = earthquakeRepository.findById(id)
                .orElseThrow(() -> new EarthquakeNotFoundException(id));
        return earthquakeMapper.toDto(earthquake);
    }

    /**
     * Deletes a specific earthquake record by ID.
     */
    @Transactional
    public void deleteEarthquakeById(Long id) {
        if (!earthquakeRepository.existsById(id)) {
            throw new EarthquakeNotFoundException(id);
        }
        earthquakeRepository.deleteById(id);
        log.info("Deleted earthquake with id: {}", id);
    }
}
