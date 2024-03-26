from django.conf import settings
import paho.mqtt.client as mqtt


def on_connect(client, userdata, rc, *extra_params):
    client.subscribe("iot/#")


def on_message(client, userdata, msg):
    from api.applications.transcation import Transaction

    topic = msg.topic
    payload = msg.payload.decode("utf-8")
    nim, amount = payload.split(",")
    transaction = Transaction(nim)
    if topic == "iot/topup":
        transaction.topup(int(amount))
    elif topic == "iot/deduct":
        transaction.deduct(int(amount))


client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(settings.MQTT["SERVER"], settings.MQTT["PORT"], 60)
