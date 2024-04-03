import mqtt, { MqttClient } from 'mqtt';

const MQTT_BROKER = 'ws://192.168.0.111';
const MQTT_PORT = 8080;
const MQTT_TOPIC_SUCCESS = 'iot/success';
const MQTT_TOPIC_FAILURE = 'iot/failed';
const MQTT_TOPIC_CREATE = 'iot/created'; // New user created
const MQTT_USERNAME = 'user'; 
const MQTT_PASSWORD = 'iot2024';

const options = {
    port: MQTT_PORT,
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
};

const client: MqttClient = mqtt.connect(MQTT_BROKER, options);

client.on('connect', () => {
    console.log('Connected to MQTT Broker');
    client.subscribe(MQTT_TOPIC_SUCCESS, (err) => {
        if (err) {
            console.error('Failed to subscribe to topic:', err);
        }
    });

    client.subscribe(MQTT_TOPIC_FAILURE, (err) => {
        if (err) {
            console.error('Failed to subscribe to topic:', err);
        }
    });

    client.subscribe(MQTT_TOPIC_CREATE, (err) => {
        if (err) {
            console.error('Failed to subscribe to topic:', err);
        }
    });


});

client.on('message', (topic, message) => {
    console.log(`Received message on ${topic}: ${message.toString()}`);
});

export default client;