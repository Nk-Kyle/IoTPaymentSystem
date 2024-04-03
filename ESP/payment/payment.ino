#include <WiFi.h>
#include <PubSubClient.h>
#include <SPI.h>
#include <MFRC522.h>

#define LED 2
#define BUTTON 0 // Override boot button

#define RST_PIN 22
#define SS_PIN 5

// Connection
// WiFi
const char *ssid = "LT2";
const char *password = "Kyle02Treoxer";

// MQTT Broker
const char *mqtt_server = "192.168.0.111";
const char *mqtt_topic = "iot/#";
const int mqtt_port = 1884;
const char *mqtt_user = "user";
const char *mqtt_pwd = "iot2024";

WiFiClient espClient;
PubSubClient client(espClient);

// Variables
volatile int hz = 10;
unsigned long previousButtonPressMillis = 0;
unsigned long buttonDelay = 1000; // Delay between button presses (in milliseconds)
unsigned long ledDuration = 5000; // Duration for LED action (Full on/blink) (in milliseconds)
unsigned long blinkDelay = 200;   // Duration of delay between blinks (in milliseconds)
unsigned long previousLightMillis = 0;
unsigned long previousLightToggleMillis = 0;
unsigned long currentMillis = 0;

enum PaymentState
{
  IDLE,
  REQUEST_SENT,
  PAYMENT_SUCCESS,
  PAYMENT_FAILED
};
PaymentState paymentState = IDLE;

MFRC522 mfrc522(SS_PIN, RST_PIN);

void setup()
{
  // Set pin mode
  pinMode(LED, OUTPUT);
  Serial.begin(115200);

  // RFID
  SPI.begin();                       // Init SPI bus
  mfrc522.PCD_Init();                // Init MFRC522
  mfrc522.PCD_DumpVersionToSerial(); // Show details of PCD - MFRC522 Card Reader details

  // Connecting to a Wi-Fi network
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.println("Connecting to WiFi..");
  }
  Serial.println("Connected");

  // Initialize MQTT client
  client.setServer(mqtt_server, mqtt_port);

  // Set callback function for incoming messages
  client.setCallback(callback);

  // Connect to MQTT broker
  reconnect();
}

void loop()
{
  // Reconnect to MQTT if necessary
  if (!client.connected())
  {
    reconnect();
  }

  // Handle MQTT messages
  client.loop();

  // Update currentMillis
  currentMillis = millis();

  // Handle LED State based on PaymentState
  handleLED();

  // Handle RFID
  handleRFID();
}

void handleRFID()
{
  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial())
  {
    String cardUID = "";
    for (byte i = 0; i < mfrc522.uid.size; i++)
    {
      if (mfrc522.uid.uidByte[i] < 0x10)
      {
        cardUID += "0";
      }
      cardUID += String(mfrc522.uid.uidByte[i], HEX);
    }
    cardUID.replace(" ", "");
    cardUID.toUpperCase();
    mfrc522.PICC_HaltA();
    sendPaymentRequest(cardUID);
  }
}

void handleLED()
{
  // Handle LED state
  switch (paymentState)
  {
  case PAYMENT_SUCCESS:
    if (currentMillis - previousLightMillis >= ledDuration)
    {
      digitalWrite(LED, LOW);
      paymentState = IDLE;
    }
    break;
  case PAYMENT_FAILED:
    if (currentMillis - previousLightToggleMillis >= blinkDelay)
    {
      digitalWrite(LED, !digitalRead(LED));
      previousLightToggleMillis = currentMillis;
    }
    if (currentMillis - previousLightMillis >= ledDuration)
    {
      digitalWrite(LED, LOW);
      paymentState = IDLE;
    }
    break;
  default:
    break;
  }
}

void sendPaymentRequest(String cardUID)
{
  Serial.println("Sending payment request");
  Serial.println(cardUID);
  client.publish("iot/deduct", cardUID.c_str());
}

void callback(char *topic, byte *payload, unsigned int length)
{
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");

  // Construct payload string
  String message;
  for (int i = 0; i < length; i++)
  {
    message += (char)payload[i];
  }

  digitalWrite(LED, HIGH); // Turn on LED
  previousLightMillis = currentMillis;

  // Handle messages based on topic
  if (strcmp(topic, "iot/success") == 0)
  {
    Serial.println("Payment successful");
    paymentState = PAYMENT_SUCCESS;
  }
  else if (strcmp(topic, "iot/failed") == 0)
  {
    Serial.println("Payment failed");
    paymentState = PAYMENT_FAILED;
  }
}

void reconnect()
{
  // Loop until we're reconnected
  while (!client.connected())
  {
    Serial.println("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("ESP32Client", mqtt_user, mqtt_pwd))
    {
      Serial.println("Connected to MQTT broker");
      // Subscribe to topics on successful connection
      client.subscribe("iot/success");
      client.subscribe("iot/failed");
      Serial.println("Connected to MQTT broker and subscribed");
    }
    else
    {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      Serial.println(" Retrying in 5 seconds...");
      delay(5000);
    }
  }
}