package codeit.mk.earthquake.config;

import codeit.mk.earthquake.dto.EarthquakeDto;
import codeit.mk.earthquake.model.Earthquake;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Component
public class EarthquakeMapper {

    public EarthquakeDto toDto(Earthquake earthquake) {
        if (earthquake == null) return null;

        LocalDateTime time = earthquake.getTime() != null
                ? LocalDateTime.ofInstant(earthquake.getTime(), ZoneOffset.UTC)
                : null;

        return EarthquakeDto.builder()
                .id(earthquake.getId())
                .magnitude(earthquake.getMagnitude())
                .magType(earthquake.getMagType())
                .place(earthquake.getPlace())
                .title(earthquake.getTitle())
                .time(time)
                .build();
    }
}
