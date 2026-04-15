package codeit.mk.earthquake.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import codeit.mk.earthquake.exception.ExternalApiException;
import codeit.mk.earthquake.exception.GeoJsonParseException;
import codeit.mk.earthquake.model.Earthquake;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UsgsApiService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${usgs.api.url}")
    private String usgsApiUrl;

    /**
     * Fetches raw GeoJSON string from the USGS endpoint.
     */
    public String fetchRawGeoJson() {
        try {
            log.info("Fetching earthquake data from USGS API: {}", usgsApiUrl);
            String response = restTemplate.getForObject(usgsApiUrl, String.class);
            if (response == null || response.isBlank()) {
                throw new ExternalApiException("USGS API returned empty response");
            }
            return response;
        } catch (ResourceAccessException ex) {
            throw new ExternalApiException("Failed to connect to USGS API", ex);
        } catch (RestClientException ex) {
            throw new ExternalApiException("USGS API request failed", ex);
        }
    }

    /**
     * Fetches and parses the USGS GeoJSON into a list of Earthquake objects.
     */
    public List<Earthquake> fetchEarthquakes() {
        String geoJson = fetchRawGeoJson();
        return parseGeoJson(geoJson);
    }

    /**
     * Parses GeoJSON FeatureCollection into Earthquake entities.
     */
    public List<Earthquake> parseGeoJson(String geoJson) {
        List<Earthquake> earthquakes = new ArrayList<>();

        try {
            JsonNode root = objectMapper.readTree(geoJson);
            JsonNode features = root.path("features");

            if (features.isMissingNode() || !features.isArray()) {
                throw new GeoJsonParseException("GeoJSON response is missing 'features' array");
            }

            for (JsonNode feature : features) {
                try {
                    Earthquake earthquake = parseFeature(feature);
                    earthquakes.add(earthquake);
                } catch (GeoJsonParseException ex) {
                    log.warn("Skipping invalid earthquake feature: {}", ex.getMessage());
                }
            }

            log.info("Parsed {} earthquake events from USGS response", earthquakes.size());
            return earthquakes;

        } catch (GeoJsonParseException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new GeoJsonParseException("Failed to parse GeoJSON response", ex);
        }
    }

    private Earthquake parseFeature(JsonNode feature) {
        // Extract ID
        String usgsId = getTextSafely(feature, "id");
        if (usgsId == null || usgsId.isBlank()) {
            throw new GeoJsonParseException("Feature is missing 'id' field");
        }

        JsonNode properties = feature.path("properties");
        if (properties.isMissingNode()) {
            throw new GeoJsonParseException("Feature '" + usgsId + "' is missing 'properties' node");
        }

        // Extract magnitude — required field
        JsonNode magNode = properties.path("mag");
        if (magNode.isNull() || magNode.isMissingNode()) {
            throw new GeoJsonParseException("Feature '" + usgsId + "' has null or missing magnitude");
        }
        double magnitude = magNode.asDouble();

        // Extract time — required field
        JsonNode timeNode = properties.path("time");
        if (timeNode.isNull() || timeNode.isMissingNode()) {
            throw new GeoJsonParseException("Feature '" + usgsId + "' has null or missing time");
        }
        Instant time = Instant.ofEpochMilli(timeNode.asLong());

        // Extract optional fields safely
        String place = getTextSafely(properties, "place");
        String title = getTextSafely(properties, "title");
        String magType = getTextSafely(properties, "magType");
        String url = getTextSafely(properties, "url");
        Integer tsunami = properties.path("tsunami").isNull() ? null : properties.path("tsunami").asInt();

        // Extract geometry coordinates
        Double longitude = null;
        Double latitude = null;
        Double depth = null;

        JsonNode geometry = feature.path("geometry");
        if (!geometry.isMissingNode() && !geometry.isNull()) {
            JsonNode coords = geometry.path("coordinates");
            if (coords.isArray() && coords.size() >= 2) {
                longitude = coords.get(0).isNull() ? null : coords.get(0).asDouble();
                latitude = coords.get(1).isNull() ? null : coords.get(1).asDouble();
                if (coords.size() >= 3 && !coords.get(2).isNull()) {
                    depth = coords.get(2).asDouble();
                }
            }
        }

        return Earthquake.builder()
                .usgsId(usgsId)
                .magnitude(magnitude)
                .magType(magType)
                .place(place)
                .title(title)
                .time(time)
                .longitude(longitude)
                .latitude(latitude)
                .depth(depth)
                .url(url)
                .tsunami(tsunami)
                .build();
    }

    private String getTextSafely(JsonNode node, String fieldName) {
        JsonNode field = node.path(fieldName);
        if (field.isNull() || field.isMissingNode()) {
            return null;
        }
        String value = field.asText();
        return value.isBlank() ? null : value;
    }
}
