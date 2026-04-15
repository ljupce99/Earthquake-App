package codeit.mk.earthquake.exception;

public class EarthquakeNotFoundException extends RuntimeException {

    public EarthquakeNotFoundException(Long id) {
        super("Earthquake not found with id: " + id);
    }

    public EarthquakeNotFoundException(String message) {
        super(message);
    }
}
