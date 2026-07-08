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
                        .title("Doações API")
                        .description("API para gestão de instituições, produtos, doações e distribuições de alimentos pela prefeitura")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("Prefeitura - Assistência Social")
                                .email("contato@prefeitura.gov.br"))
                        .license(new License()
                                .name("MIT")
                                .url("https://opensource.org/licenses/MIT")));
    }

}
