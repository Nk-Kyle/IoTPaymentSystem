#include <WiFi.h>
#include <PubSubClient.h>

#define LED 2
#define BUTTON 0 // Override boot button

// Connection
// WiFi
const char *ssid = "LT2";
const char *password = "Kyle02Treoxer";

// MQTT Broker
const char *mqtt_server = "192.168.0.106"; 
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
unsigned long blinkDelay = 200; // Duration of delay between blinks (in milliseconds)
unsigned long previousLightMillis = 0;
unsigned long previousLightToggleMillis = 0;
unsigned long currentMillis = 0;

const char *nim = "13520040";

enum PaymentState {
  IDLE,
  REQUEST_SENT,
  PAYMENT_SUCCESS,
  PAYMENT_FAILED
};
PaymentState paymentState = IDLE;

void setup() {
  // Set pin mode
  pinMode(BUTTON, INPUT);
  pinMode(LED, OUTPUT);
  Serial.begin(115200);

  // Connecting to a Wi-Fi network
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
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

void loop() {
  // Reconnect to MQTT if necessary
  if (!client.connected()) {
    reconnect();
  }

  // Handle MQTT messages
  client.loop();

  // Update currentMillis
  currentMillis = millis();

  // Read button state
  int PushBtnState = digitalRead(BUTTON);

  // Check if button is pressed and debounce delay has passed
  if (PushBtnState == LOW && (currentMillis - previousButtonPressMillis >= buttonDelay)) {
    previousButtonPressMillis = currentMillis; // Record the time of button press
    sendPaymentRequest();
  }

  // Handle LED State based on PaymentState
  handleLED();

}

void handleLED(){
  // Handle LED state
  switch (paymentState) {
    case PAYMENT_SUCCESS:
      if (currentMillis - previousLightMillis >= ledDuration) {
        digitalWrite(LED, LOW);
        paymentState = IDLE;
      }
      break;
    case PAYMENT_FAILED:
      if (currentMillis - previousLightToggleMillis >= blinkDelay) {
        digitalWrite(LED, !digitalRead(LED));
        previousLightToggleMillis = currentMillis;
      }
      if (currentMillis - previousLightMillis >= ledDuration) {
        digitalWrite(LED, LOW);
        paymentState = IDLE;
      }
      break;
    default:
      break;
  }
}

void sendPaymentRequest(){
  client.publish("iot/deduct", nim);
}

void callback(char *topic, byte *payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  
  // Construct payload string
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  digitalWrite(LED, HIGH); // Turn on LED
  previousLightMillis = currentMillis;

  // Handle messages based on topic
  if (strcmp(topic, "iot/success") == 0) {
    Serial.println("Payment successful");
    paymentState = PAYMENT_SUCCESS;
  } else if (strcmp(topic, "iot/failed") == 0) {
    Serial.println("Payment failed");
    paymentState = PAYMENT_FAILED;
  }
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.println("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("ESP32Client", mqtt_user, mqtt_pwd)) {
      Serial.println("Connected to MQTT broker");
      // Subscribe to topics on successful connection
      client.subscribe("iot/success");
      client.subscribe("iot/failed");
      Serial.println("Connected to MQTT broker and subscribed");
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      Serial.println(" Retrying in 5 seconds...");
      delay(5000);
    }
  }
}
