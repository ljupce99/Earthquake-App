package codeit.mk.earthquake.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "earthquakes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Earthquake {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usgs_id", unique = true, nullable = false)
    private String usgsId;

    @Column(nullable = false)
    private Double magnitude;

    @Column(name = "mag_type", length = 20)
    private String magType;

    @Column(length = 500)
    private String place;

    @Column(length = 500)
    private String title;

    @Column(nullable = false)
    private Instant time;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "depth")
    private Double depth;

    @Column(name = "url", length = 1000)
    private String url;

    @Column(name = "tsunami")
    private Integer tsunami;
}
