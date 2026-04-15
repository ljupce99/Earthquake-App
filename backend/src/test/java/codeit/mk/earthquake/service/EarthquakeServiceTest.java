package codeit.mk.earthquake.service;

import codeit.mk.earthquake.config.EarthquakeMapper;
import codeit.mk.earthquake.dto.EarthquakeDto;
import codeit.mk.earthquake.exception.EarthquakeNotFoundException;
import codeit.mk.earthquake.exception.ExternalApiException;
import codeit.mk.earthquake.model.Earthquake;
import codeit.mk.earthquake.repository.EarthquakeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EarthquakeServiceTest {

    @Mock
    private EarthquakeRepository earthquakeRepository;

    @Mock
    private UsgsApiService usgsApiService;

    @Mock
    private EarthquakeMapper earthquakeMapper;

    @InjectMocks
    private EarthquakeService earthquakeService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(earthquakeService, "minMagnitude", 2.0);
    }

    // ── fetchAndRefreshEarthquakes ─────────────────────────────────────────────

    @Test
    void fetchAndRefresh_filtersAndSavesEarthquakes() {
        Earthquake low = buildEarthquake(1L, "id1", 1.5, Instant.now());
        Earthquake high = buildEarthquake(2L, "id2", 3.2, Instant.now());

        when(usgsApiService.fetchEarthquakes()).thenReturn(List.of(low, high));
        when(earthquakeRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
        when(earthquakeMapper.toDto(any())).thenAnswer(inv -> {
            Earthquake e = inv.getArgument(0);
            return EarthquakeDto.builder().id(e.getId()).place(e.getPlace()).magnitude(e.getMagnitude()).build();
        });

        List<EarthquakeDto> result = earthquakeService.fetchAndRefreshEarthquakes();

        // Only the high-magnitude earthquake should be saved
        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getId()).isEqualTo(2L);
        assertThat(result.get(0).getMagnitude()).isEqualTo(3.2);
        verify(earthquakeRepository).deleteAllEarthquakes();
        verify(earthquakeRepository).saveAll(argThat(list -> ((List<?>) list).size() == 1));
    }

    @Test
    void fetchAndRefresh_allBelowThreshold_savesNothing() {
        when(usgsApiService.fetchEarthquakes()).thenReturn(List.of(
                buildEarthquake(1L, "a", 0.5, Instant.now()),
                buildEarthquake(2L, "b", 1.9, Instant.now())
        ));
        when(earthquakeRepository.saveAll(anyList())).thenReturn(List.of());

        List<EarthquakeDto> result = earthquakeService.fetchAndRefreshEarthquakes();

        assertThat(result).isEmpty();
        verify(earthquakeRepository).deleteAllEarthquakes();
    }

    @Test
    void fetchAndRefresh_apiUnavailable_throwsExternalApiException() {
        when(usgsApiService.fetchEarthquakes()).thenThrow(new ExternalApiException("API down"));

        assertThatThrownBy(() -> earthquakeService.fetchAndRefreshEarthquakes())
                .isInstanceOf(ExternalApiException.class);
        verify(earthquakeRepository, never()).deleteAllEarthquakes();
    }

    // ── getAllEarthquakes ──────────────────────────────────────────────────────

    @Test
    void getAllEarthquakes_returnsAll() {
        List<Earthquake> stored = List.of(
                buildEarthquake(1L, "x1", 2.5, Instant.now()),
                buildEarthquake(2L, "x2", 3.1, Instant.now())
        );
        when(earthquakeRepository.findAll()).thenReturn(stored);
        when(earthquakeMapper.toDto(any())).thenAnswer(inv -> {
            Earthquake e = inv.getArgument(0);
            return EarthquakeDto.builder().id(e.getId()).place(e.getPlace()).build();
        });

        List<EarthquakeDto> result = earthquakeService.getAllEarthquakes();

        assertThat(result).hasSize(2);
        assertThat(result).extracting(EarthquakeDto::getId).containsExactlyInAnyOrder(1L, 2L);
    }

    // ── getEarthquakesByMinMagnitude ───────────────────────────────────────────

    @Test
    void getEarthquakesByMinMagnitude_negativeMag_throwsIllegalArgument() {
        assertThatThrownBy(() -> earthquakeService.getEarthquakesByMinMagnitude(-1.0))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void getEarthquakesByMinMagnitude_validMag_returnsFiltered() {
        Earthquake e = buildEarthquake(1L, "z1", 4.0, Instant.now());
        when(earthquakeRepository.findByMagnitudeGreaterThan(3.0)).thenReturn(List.of(e));
        when(earthquakeMapper.toDto(e)).thenReturn(EarthquakeDto.builder().magnitude(4.0).build());

        List<EarthquakeDto> result = earthquakeService.getEarthquakesByMinMagnitude(3.0);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getMagnitude()).isEqualTo(4.0);
    }

    // ── getEarthquakesAfter ────────────────────────────────────────────────────

    @Test
    void getEarthquakesAfter_nullTime_throwsIllegalArgument() {
        assertThatThrownBy(() -> earthquakeService.getEarthquakesAfter(null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void getEarthquakesAfter_validTime_returnsFiltered() {
        Instant threshold = Instant.parse("2024-01-01T00:00:00Z");
        Earthquake e = buildEarthquake(1L, "t1", 3.0, Instant.parse("2024-06-01T00:00:00Z"));
        when(earthquakeRepository.findByTimeAfter(threshold)).thenReturn(List.of(e));
        when(earthquakeMapper.toDto(e)).thenReturn(EarthquakeDto.builder().place("Test Place").build());

        List<EarthquakeDto> result = earthquakeService.getEarthquakesAfter(threshold);

        assertThat(result).hasSize(1);
    }

    // ── getEarthquakeById ──────────────────────────────────────────────────────

    @Test
    void getEarthquakeById_exists_returnsDto() {
        Earthquake e = buildEarthquake(42L, "usgs42", 3.5, Instant.now());
        when(earthquakeRepository.findById(42L)).thenReturn(Optional.of(e));
        when(earthquakeMapper.toDto(e)).thenReturn(EarthquakeDto.builder().magnitude(3.5).build());

        EarthquakeDto result = earthquakeService.getEarthquakeById(42L);

        assertThat(result.getMagnitude()).isEqualTo(3.5);
    }

    @Test
    void getEarthquakeById_notFound_throwsEarthquakeNotFoundException() {
        when(earthquakeRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> earthquakeService.getEarthquakeById(99L))
                .isInstanceOf(EarthquakeNotFoundException.class);
    }

    // ── deleteEarthquakeById ───────────────────────────────────────────────────

    @Test
    void deleteEarthquakeById_exists_deletesSuccessfully() {
        when(earthquakeRepository.existsById(5L)).thenReturn(true);

        earthquakeService.deleteEarthquakeById(5L);

        verify(earthquakeRepository).deleteById(5L);
    }

    @Test
    void deleteEarthquakeById_notFound_throwsEarthquakeNotFoundException() {
        when(earthquakeRepository.existsById(77L)).thenReturn(false);

        assertThatThrownBy(() -> earthquakeService.deleteEarthquakeById(77L))
                .isInstanceOf(EarthquakeNotFoundException.class);
        verify(earthquakeRepository, never()).deleteById(anyLong());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Earthquake buildEarthquake(Long id, String usgsId, double magnitude, Instant time) {
        return Earthquake.builder()
                .id(id)
                .usgsId(usgsId)
                .magnitude(magnitude)
                .place("Test Place")
                .time(time)
                .build();
    }
}
