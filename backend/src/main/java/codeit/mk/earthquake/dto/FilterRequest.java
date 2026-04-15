package codeit.mk.earthquake.dto;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FilterRequest {
    private Double minMagnitude;
    private Instant after;
}
