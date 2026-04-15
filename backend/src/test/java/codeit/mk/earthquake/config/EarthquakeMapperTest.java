package codeit.mk.earthquake.config;

import codeit.mk.earthquake.dto.EarthquakeDto;
import codeit.mk.earthquake.model.Earthquake;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class EarthquakeMapperTest {

    private final EarthquakeMapper mapper = new EarthquakeMapper();

    @Test
    void toDto_mapsDatabaseIdForSafeDelete() {
        Earthquake earthquake = Earthquake.builder()
                .id(42L)
                .usgsId("us123")
                .magnitude(4.1)
                .magType("ml")
                .place("Skopje")
                .title("M 4.1 - Skopje")
                .time(Instant.parse("2024-01-01T10:15:30Z"))
                .build();

        EarthquakeDto dto = mapper.toDto(earthquake);

        assertThat(dto).isNotNull();
        assertThat(dto.getId()).isEqualTo(42L);
        assertThat(dto.getMagnitude()).isEqualTo(4.1);
        assertThat(dto.getTime()).isEqualTo(LocalDateTime.of(2024, 1, 1, 10, 15, 30));
    }

    @Test
    void toDto_nullEntity_returnsNull() {
        assertThat(mapper.toDto(null)).isNull();
    }
}

