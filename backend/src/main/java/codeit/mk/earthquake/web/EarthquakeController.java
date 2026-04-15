package codeit.mk.earthquake.web;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import codeit.mk.earthquake.dto.ApiResponse;
import codeit.mk.earthquake.dto.EarthquakeDto;
import codeit.mk.earthquake.service.EarthquakeService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/earthquakes")
@RequiredArgsConstructor
@Slf4j
public class EarthquakeController {

    private final EarthquakeService earthquakeService;

    /**
     * GET /api/earthquakes
     * Returns all stored earthquakes.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<EarthquakeDto>>> getAllEarthquakes() {
        List<EarthquakeDto> earthquakes = earthquakeService.getAllEarthquakes();
        return ResponseEntity.ok(ApiResponse.success(earthquakes,
                "Retrieved " + earthquakes.size() + " earthquake records"));
    }

    /**
     * GET /api/earthquakes/{id}
     * Returns a single earthquake by its database ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EarthquakeDto>> getEarthquakeById(@PathVariable Long id) {
        EarthquakeDto dto = earthquakeService.getEarthquakeById(id);
        return ResponseEntity.ok(ApiResponse.success(dto, "Earthquake found"));
    }

    /**
     * POST /api/earthquakes/fetch
     * Triggers a fresh fetch from USGS, filters, clears DB and saves new records.
     */
    @PostMapping("/fetch")
    public ResponseEntity<ApiResponse<List<EarthquakeDto>>> fetchAndRefresh() {
        log.info("Manual fetch triggered via REST endpoint");
        List<EarthquakeDto> saved = earthquakeService.fetchAndRefreshEarthquakes();
        return ResponseEntity.ok(ApiResponse.success(saved,
                "Fetched and stored " + saved.size() + " earthquakes (mag > 2.0)"));
    }

    /**
     * GET /api/earthquakes/filter?minMag=3.0
     * Returns earthquakes with magnitude greater than the given value.
     */
    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<List<EarthquakeDto>>> filterByMagnitude(
            @RequestParam(name = "minMag", defaultValue = "2.0") double minMag) {
        List<EarthquakeDto> result = earthquakeService.getEarthquakesByMinMagnitude(minMag);
        return ResponseEntity.ok(ApiResponse.success(result,
                "Found " + result.size() + " earthquakes with magnitude > " + minMag));
    }

    /**
     * GET /api/earthquakes/filter/after?time=2024-01-01T00:00:00Z
     * Returns earthquakes that occurred after the given ISO timestamp.
     */
    @GetMapping("/filter/after")
    public ResponseEntity<ApiResponse<List<EarthquakeDto>>> filterByTime(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant time) {
        List<EarthquakeDto> result = earthquakeService.getEarthquakesAfter(time);
        return ResponseEntity.ok(ApiResponse.success(result,
                "Found " + result.size() + " earthquakes after " + time));
    }

    /**
     * GET /api/earthquakes/filter/combined?minMag=2.5&after=2024-01-01T00:00:00Z
     * Returns earthquakes filtered by both magnitude and time.
     */
    @GetMapping("/filter/combined")
    public ResponseEntity<ApiResponse<List<EarthquakeDto>>> filterCombined(
            @RequestParam(defaultValue = "2.0") double minMag,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant after) {
        List<EarthquakeDto> result = earthquakeService.getEarthquakesByMagnitudeAndTime(minMag, after);
        return ResponseEntity.ok(ApiResponse.success(result,
                "Found " + result.size() + " earthquakes matching combined filter"));
    }

    /**
     * DELETE /api/earthquakes/{id}
     * Deletes a specific earthquake record by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEarthquake(@PathVariable Long id) {
        earthquakeService.deleteEarthquakeById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Earthquake with id " + id + " deleted successfully"));
    }
}
