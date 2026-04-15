package codeit.mk.earthquake.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI earthquakeOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Earthquake API")
                        .description("API for fetching, storing, and filtering earthquake records")
                        .version("v1")
                        .contact(new Contact().name("Earthquake Service Team"))
                        .license(new License().name("Apache 2.0")));
    }

    @Bean
    public GroupedOpenApi earthquakeApiGroup() {
        return GroupedOpenApi.builder()
                .group("earthquake")
                .pathsToMatch("/api/**")
                .build();
    }
}

