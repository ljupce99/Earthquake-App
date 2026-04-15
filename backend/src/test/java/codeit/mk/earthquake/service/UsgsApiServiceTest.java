package codeit.mk.earthquake.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import codeit.mk.earthquake.exception.ExternalApiException;
import codeit.mk.earthquake.exception.GeoJsonParseException;
import codeit.mk.earthquake.model.Earthquake;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsgsApiServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private UsgsApiService usgsApiService;

    private static final String USGS_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(usgsApiService, "usgsApiUrl", USGS_URL);
    }

    // ── parseGeoJson happy path ────────────────────────────────────────────────

    @Test
    void parseGeoJson_validResponse_returnsEarthquakeList() {
        String geoJson = buildGeoJson("us123", 3.5, "California, US", 1_700_000_000_000L,
                -120.0, 37.0, 10.0, "ml", "Earthquake - California, US", "https://usgs.gov/123", 0);

        List<Earthquake> result = usgsApiService.parseGeoJson(geoJson);

        assertThat(result).hasSize(1);
        Earthquake eq = result.get(0);
        assertThat(eq.getUsgsId()).isEqualTo("us123");
        assertThat(eq.getMagnitude()).isEqualTo(3.5);
        assertThat(eq.getPlace()).isEqualTo("California, US");
        assertThat(eq.getMagType()).isEqualTo("ml");
        assertThat(eq.getLongitude()).isEqualTo(-120.0);
        assertThat(eq.getLatitude()).isEqualTo(37.0);
        assertThat(eq.getDepth()).isEqualTo(10.0);
        assertThat(eq.getTsunami()).isEqualTo(0);
    }

    @Test
    void parseGeoJson_multipleFeatures_returnsAll() {
        String geoJson = """
                {
                  "type": "FeatureCollection",
                  "features": [
                    %s,
                    %s
                  ]
                }
                """.formatted(
                buildFeature("id1", 2.1, "Place A", 1_700_000_000_000L),
                buildFeature("id2", 4.7, "Place B", 1_700_000_001_000L)
        );

        List<Earthquake> result = usgsApiService.parseGeoJson(geoJson);

        assertThat(result).hasSize(2);
        assertThat(result).extracting(Earthquake::getUsgsId).containsExactlyInAnyOrder("id1", "id2");
    }

    @Test
    void parseGeoJson_emptyFeatures_returnsEmptyList() {
        String geoJson = """
                { "type": "FeatureCollection", "features": [] }
                """;

        List<Earthquake> result = usgsApiService.parseGeoJson(geoJson);

        assertThat(result).isEmpty();
    }

    // ── parseGeoJson edge / error cases ───────────────────────────────────────

    @Test
    void parseGeoJson_missingFeaturesNode_throwsGeoJsonParseException() {
        String geoJson = """
                { "type": "FeatureCollection" }
                """;

        assertThatThrownBy(() -> usgsApiService.parseGeoJson(geoJson))
                .isInstanceOf(GeoJsonParseException.class)
                .hasMessageContaining("features");
    }

    @Test
    void parseGeoJson_featureWithNullMagnitude_skipsFeature() {
        String geoJson = """
                {
                  "type": "FeatureCollection",
                  "features": [
                    {
                      "id": "bad1",
                      "properties": { "mag": null, "time": 1700000000000, "place": "Somewhere" },
                      "geometry": { "type": "Point", "coordinates": [-100.0, 35.0, 5.0] }
                    },
                    %s
                  ]
                }
                """.formatted(buildFeature("good1", 3.0, "Good Place", 1_700_000_000_000L));

        List<Earthquake> result = usgsApiService.parseGeoJson(geoJson);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUsgsId()).isEqualTo("good1");
    }

    @Test
    void parseGeoJson_featureWithNullTime_skipsFeature() {
        String geoJson = """
                {
                  "type": "FeatureCollection",
                  "features": [
                    {
                      "id": "badtime",
                      "properties": { "mag": 3.0, "time": null, "place": "Somewhere" },
                      "geometry": { "type": "Point", "coordinates": [-100.0, 35.0, 5.0] }
                    }
                  ]
                }
                """;

        List<Earthquake> result = usgsApiService.parseGeoJson(geoJson);

        assertThat(result).isEmpty();
    }

    @Test
    void parseGeoJson_featureMissingId_skipsFeature() {
        String geoJson = """
                {
                  "type": "FeatureCollection",
                  "features": [
                    {
                      "properties": { "mag": 3.0, "time": 1700000000000 },
                      "geometry": { "type": "Point", "coordinates": [-100.0, 35.0, 5.0] }
                    }
                  ]
                }
                """;

        List<Earthquake> result = usgsApiService.parseGeoJson(geoJson);

        assertThat(result).isEmpty();
    }

    @Test
    void parseGeoJson_nullOptionalFields_parsesWithNulls() {
        String geoJson = """
                {
                  "type": "FeatureCollection",
                  "features": [
                    {
                      "id": "nopt1",
                      "properties": {
                        "mag": 2.5,
                        "time": 1700000000000,
                        "place": null,
                        "title": null,
                        "magType": null,
                        "url": null,
                        "tsunami": null
                      },
                      "geometry": { "type": "Point", "coordinates": [-100.0, 35.0, 5.0] }
                    }
                  ]
                }
                """;

        List<Earthquake> result = usgsApiService.parseGeoJson(geoJson);

        assertThat(result).hasSize(1);
        Earthquake eq = result.get(0);
        assertThat(eq.getPlace()).isNull();
        assertThat(eq.getTitle()).isNull();
        assertThat(eq.getMagType()).isNull();
        assertThat(eq.getTsunami()).isNull();
    }

    // ── fetchRawGeoJson ────────────────────────────────────────────────────────

    @Test
    void fetchRawGeoJson_apiReturnsData_returnsString() {
        String expected = """
                { "type": "FeatureCollection", "features": [] }
                """;
        when(restTemplate.getForObject(USGS_URL, String.class)).thenReturn(expected);

        String result = usgsApiService.fetchRawGeoJson();

        assertThat(result).isEqualTo(expected);
    }

    @Test
    void fetchRawGeoJson_apiReturnsNull_throwsExternalApiException() {
        when(restTemplate.getForObject(USGS_URL, String.class)).thenReturn(null);

        assertThatThrownBy(() -> usgsApiService.fetchRawGeoJson())
                .isInstanceOf(ExternalApiException.class)
                .hasMessageContaining("empty response");
    }

    @Test
    void fetchRawGeoJson_resourceAccessException_throwsExternalApiException() {
        when(restTemplate.getForObject(USGS_URL, String.class))
                .thenThrow(new ResourceAccessException("Connection refused"));

        assertThatThrownBy(() -> usgsApiService.fetchRawGeoJson())
                .isInstanceOf(ExternalApiException.class)
                .hasMessageContaining("Failed to connect");
    }

    @Test
    void fetchRawGeoJson_restClientException_throwsExternalApiException() {
        when(restTemplate.getForObject(USGS_URL, String.class))
                .thenThrow(new RestClientException("Bad gateway"));

        assertThatThrownBy(() -> usgsApiService.fetchRawGeoJson())
                .isInstanceOf(ExternalApiException.class)
                .hasMessageContaining("request failed");
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private String buildGeoJson(String id, double mag, String place, long time,
                                 double lon, double lat, double depth,
                                 String magType, String title, String url, int tsunami) {
        return """
                {
                  "type": "FeatureCollection",
                  "features": [
                    {
                      "id": "%s",
                      "properties": {
                        "mag": %s, "place": "%s", "time": %d,
                        "magType": "%s", "title": "%s", "url": "%s", "tsunami": %d
                      },
                      "geometry": { "type": "Point", "coordinates": [%s, %s, %s] }
                    }
                  ]
                }
                """.formatted(id, mag, place, time, magType, title, url, tsunami, lon, lat, depth);
    }

    private String buildFeature(String id, double mag, String place, long time) {
        return """
                {
                  "id": "%s",
                  "properties": { "mag": %s, "place": "%s", "time": %d },
                  "geometry": { "type": "Point", "coordinates": [-100.0, 35.0, 5.0] }
                }
                """.formatted(id, mag, place, time);
    }
}
