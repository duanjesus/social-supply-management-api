package br.gov.prefeitura.doacoes.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI doacoesOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Social Supply Management API")
                        .description("API for managing institutions, products, donations and distributions in social food supply programs")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("Social Assistance Department")
                                .email("contact@social-supply.example.org"))
                        .license(new License()
                                .name("MIT")
                                .url("https://opensource.org/licenses/MIT")));
    }

}
