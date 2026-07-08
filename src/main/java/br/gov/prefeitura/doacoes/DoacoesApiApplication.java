package br.gov.prefeitura.doacoes;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class DoacoesApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(DoacoesApiApplication.class, args);
    }

}
