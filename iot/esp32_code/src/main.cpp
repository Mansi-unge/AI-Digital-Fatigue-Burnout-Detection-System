#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <DHT.h>

// =====================================================
// WIFI
// =====================================================

// const char* WIFI_SSID = "Mansiunge";
// const char* WIFI_PASSWORD = "987654321";
const char* WIFI_SSID = "vivo 1901";
const char* WIFI_PASSWORD = "sanjayunge";
// const char* WIFI_SSID = "Redmi 9";
// const char* WIFI_PASSWORD = "shiu1234";
// const char* WIFI_SSID = "moto g67 power 5G_1804";
// const char* WIFI_PASSWORD = "12345678";
// Laptop IPv4 address
const char* serverUrl = "http://192.168.82.156:5000/monitoring/iot-data";


// =====================================================
// DHT22
// =====================================================

#define DHTPIN 4
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);


// =====================================================
// BH1750
// =====================================================

#define BH1750_ADDRESS 0x23


// =====================================================
// HC-SR04
// =====================================================

#define TRIG_PIN 5
#define ECHO_PIN 18


// =====================================================
// PIR
// =====================================================

#define PIR_PIN 19


// =====================================================
// CONNECT TO WIFI
// =====================================================

void connectWiFi()
{
    Serial.println();
    Serial.println("==============================");
    Serial.println("Connecting to Wi-Fi...");
    Serial.println("==============================");

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    int attempts = 0;

    while (WiFi.status() != WL_CONNECTED && attempts < 30)
    {
        delay(500);
        Serial.print(".");
        attempts++;
    }

    Serial.println();

    if (WiFi.status() == WL_CONNECTED)
    {
        Serial.println("Connected!");

        Serial.print("IP Address: ");
        Serial.println(WiFi.localIP());
    }
    else
    {
        Serial.println("Wi-Fi Connection Failed!");
    }
}


// =====================================================
// BH1750 INITIALIZATION
// =====================================================

bool initBH1750()
{
    Wire.beginTransmission(BH1750_ADDRESS);

    // Continuous High Resolution Mode
    Wire.write(0x10);

    return Wire.endTransmission() == 0;
}


// =====================================================
// READ BH1750
// =====================================================

float readBH1750()
{
    Wire.requestFrom(BH1750_ADDRESS, 2);

    if (Wire.available() == 2)
    {
        uint16_t raw = Wire.read() << 8;
        raw |= Wire.read();

        return raw / 1.2;
    }

    return -1;
}


// =====================================================
// READ HC-SR04
// =====================================================

float readDistance()
{
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);

    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    long duration = pulseIn(ECHO_PIN, HIGH, 30000);

    if (duration == 0)
    {
        return -1;
    }

    float distance = duration * 0.0343 / 2.0;

    return distance;
}


// =====================================================
// SEND DATA TO FLASK BACKEND
// =====================================================

void sendDataToBackend(
    float temperature,
    float humidity,
    float light,
    float distance,
    bool motion,
    bool temperatureValid,
    bool humidityValid,
    bool lightValid,
    bool distanceValid
)
{
    if (WiFi.status() != WL_CONNECTED)
    {
        Serial.println("Wi-Fi disconnected!");
        return;
    }

    HTTPClient http;

    Serial.println();
    Serial.println("Sending data to backend...");

    http.begin(serverUrl);

    http.addHeader("Content-Type", "application/json");


    // =================================================
    // CREATE JSON
    // =================================================

    String json = "{";


    // Temperature
    json += "\"temperature\":";

    if (temperatureValid)
    {
        json += String(temperature, 2);
    }
    else
    {
        json += "null";
    }


    // Humidity
    json += ",\"humidity\":";

    if (humidityValid)
    {
        json += String(humidity, 2);
    }
    else
    {
        json += "null";
    }


    // Light
    json += ",\"light\":";

    if (lightValid)
    {
        json += String(light, 2);
    }
    else
    {
        json += "null";
    }


    // Distance
    json += ",\"distance\":";

    if (distanceValid)
    {
        json += String(distance, 2);
    }
    else
    {
        json += "null";
    }


    // Motion
    json += ",\"motion\":";

    if (motion)
    {
        json += "true";
    }
    else
    {
        json += "false";
    }


    json += "}";


    // =================================================
    // PRINT JSON
    // =================================================

    Serial.print("JSON: ");
    Serial.println(json);


    // =================================================
    // SEND POST REQUEST
    // =================================================

    int httpResponseCode = http.POST(json);


    Serial.print("HTTP Response Code: ");
    Serial.println(httpResponseCode);


    if (httpResponseCode > 0)
    {
        String response = http.getString();

        Serial.print("Backend Response: ");
        Serial.println(response);
    }
    else
    {
        Serial.print("HTTP Error: ");
        Serial.println(
            http.errorToString(httpResponseCode)
        );
    }


    http.end();
}


// =====================================================
// SETUP
// =====================================================

void setup()
{
    Serial.begin(115200);

    delay(1000);


    Serial.println();
    Serial.println("==============================");
    Serial.println("ESP32 IoT SYSTEM STARTED");
    Serial.println("==============================");


    // =================================================
    // DHT22
    // =================================================

    dht.begin();


    // =================================================
    // I2C
    // =================================================

    Wire.begin(21, 22);


    // =================================================
    // HC-SR04
    // =================================================

    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);


    // =================================================
    // PIR
    // =================================================

    pinMode(PIR_PIN, INPUT_PULLDOWN);


    // =================================================
    // BH1750
    // =================================================

    if (initBH1750())
    {
        Serial.println("BH1750 Initialized!");
    }
    else
    {
        Serial.println("BH1750 Initialization Failed!");
    }


    // =================================================
    // WIFI
    // =================================================

    connectWiFi();


    Serial.println();
    Serial.println("==============================");
    Serial.println("SENSOR TEST STARTED");
    Serial.println("==============================");
}


// =====================================================
// LOOP
// =====================================================

void loop()
{
    // =================================================
    // CHECK WIFI
    // =================================================

    if (WiFi.status() != WL_CONNECTED)
    {
        Serial.println("Wi-Fi disconnected.");
        Serial.println("Reconnecting...");

        connectWiFi();
    }


    Serial.println();
    Serial.println("------------------------------");


    // =================================================
    // DHT22
    // =================================================

    Serial.println("Reading DHT22...");

    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();

    bool temperatureValid = !isnan(temperature);
    bool humidityValid = !isnan(humidity);


    // =================================================
    // BH1750
    // =================================================

    Serial.println("Reading BH1750...");

    float light = readBH1750();

    bool lightValid = light >= 0;


    // =================================================
    // HC-SR04
    // =================================================

    Serial.println("Reading HC-SR04...");

    float distance = readDistance();

    bool distanceValid = distance >= 0;


    // =================================================
    // PIR
    // =================================================

    Serial.println("Reading PIR...");

    int pirValue = digitalRead(PIR_PIN);

    bool motion = (pirValue == HIGH);


    // =================================================
    // DISPLAY SENSOR DATA
    // =================================================

    Serial.println();
    Serial.println("SENSOR DATA");
    Serial.println("==============================");


    // Temperature

    if (temperatureValid)
    {
        Serial.print("Temperature : ");
        Serial.print(temperature);
        Serial.println(" °C");
    }
    else
    {
        Serial.println("Temperature : Failed");
    }


    // Humidity

    if (humidityValid)
    {
        Serial.print("Humidity    : ");
        Serial.print(humidity);
        Serial.println(" %");
    }
    else
    {
        Serial.println("Humidity    : Failed");
    }


    // Light

    if (lightValid)
    {
        Serial.print("Light       : ");
        Serial.print(light);
        Serial.println(" lux");
    }
    else
    {
        Serial.println("Light       : Failed");
    }


    // Distance

    if (distanceValid)
    {
        Serial.print("Distance    : ");
        Serial.print(distance);
        Serial.println(" cm");
    }
    else
    {
        Serial.println("Distance    : Failed");
    }


    // Motion

    Serial.print("Motion      : ");

    if (motion)
    {
        Serial.println("Yes");
    }
    else
    {
        Serial.println("No");
    }


    // =================================================
    // ALWAYS SEND DATA
    // =================================================

    sendDataToBackend(
        temperature,
        humidity,
        light,
        distance,
        motion,
        temperatureValid,
        humidityValid,
        lightValid,
        distanceValid
    );


    Serial.println("==============================");


    // =================================================
    // WAIT 5 SECONDS
    // =================================================

    delay(5000);
}