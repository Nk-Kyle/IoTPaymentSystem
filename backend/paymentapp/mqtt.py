from django.conf import settings
from constants import DEDUCT_AMOUNT
import paho.mqtt.client as mqtt


def on_connect(client, userdata, rc, *extra_params):
    client.subscribe("iot/#")


def on_message(client, userdata, msg):
    from api.applications.transaction import Transaction

    topic = msg.topic
    payload = msg.payload.decode("utf-8")
    uid = payload
    if topic in ["iot/topup", "iot/deduct"]:
        transaction = Transaction(uid)
        if topic == "iot/topup":
            transaction.topup(int(DEDUCT_AMOUNT))
        elif topic == "iot/deduct":
            transaction.deduct(int(DEDUCT_AMOUNT))


client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.username_pw_set(settings.MQTT["USERNAME"], settings.MQTT["PASSWORD"])

client.connect(settings.MQTT["SERVER"], settings.MQTT["PORT"], 60)
