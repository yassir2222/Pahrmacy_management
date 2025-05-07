package emsi.project.backendms1;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class BackendMs1ApplicationTests {

    @Autowired
    private Environment env; // Autowire Environment

    @Test
    void contextLoads() {
        System.out.println("---- TEST DATASOURCE PROPERTIES ----");
        System.out.println("spring.datasource.url=" + env.getProperty("spring.datasource.url"));
        System.out.println("spring.datasource.driverClassName=" + env.getProperty("spring.datasource.driverClassName"));
        System.out.println("spring.datasource.username=" + env.getProperty("spring.datasource.username"));
        System.out.println("------------------------------------");
    }

}
