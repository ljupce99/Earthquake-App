package codeit.mk.earthquake.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import codeit.mk.earthquake.service.EarthquakeService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
@ConditionalOnProperty(value = "earthquake.scheduler.enabled", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
@Slf4j
public class EarthquakeScheduler {

    private final EarthquakeService earthquakeService;

    /**
     * Automatically refreshes earthquake data every 5 minutes.
     * The USGS "all_hour" feed updates frequently, so polling every 5 minutes
     * keeps the database reasonably current.
     */
    @Scheduled(fixedRateString = "${earthquake.scheduler.rate-minutes:5}", timeUnit = TimeUnit.MINUTES)
    public void scheduledFetch() {
//        System.out.println("Scheduled earthquake data refresh started");
        log.info("Scheduled earthquake data refresh started");
        try {
            var saved = earthquakeService.fetchAndRefreshEarthquakes();
            log.info("Scheduled refresh completed: {} earthquakes stored", saved.size());
        } catch (Exception ex) {
            log.error("Scheduled earthquake refresh failed: {}", ex.getMessage(), ex);
            // Do not rethrow — scheduler should continue running on next tick
        }
    }
}
