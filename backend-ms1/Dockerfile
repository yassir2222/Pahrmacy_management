
FROM maven:3.9-eclipse-temurin-17-alpine AS build

WORKDIR /build
# Make the wrapper executable
COPY pom.xml .
# Use 'mvn' directly since it's included in the base image
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

#Runtime stage
FROM amazoncorretto:17

ARG PROFILE=dev
ARG APP_VERSION=1.0.0

WORKDIR /app
COPY --from=build /build/target/backend-ms1-*.jar /app/

EXPOSE 8083

ENV DB_URL=jdbc:mysql://mysql_container:3306/pharmacyDB
ENV ACTIVE_PROFILE=${PROFILE}
ENV JAR_VERSION=${APP_VERSION}

CMD java -jar -Dspring.profiles.active=${ACTIVE_PROFILE} -Dspring.datasource.url=${DB_URL} backend-ms1-${JAR_VERSION}.jar


