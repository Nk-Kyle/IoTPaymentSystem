from api.models import User, TransactionLog
from django.db import transaction

from paymentapp import mqtt


class Transaction:

    def __init__(self, nim):
        self.nim = nim
        self.user = User.objects.get_or_create(nim=nim)[0]

    def deduct(self, amount):

        if self.user.balance < amount:
            # Publish to MQTT
            mqtt.client.publish(
                "iot/failed",
                f"Insufficient balance for {self.nim} to deduct {amount}. Balance: {self.user.balance}",
            )
            return

        self.user.balance -= amount
        with transaction.atomic():
            self.user.save()
            self.create_log(-amount)

        # Publish to MQTT
        mqtt.client.publish(
            "iot/success", f"Successfully deducted {amount} for {self.nim}"
        )

    def topup(self, amount):
        self.user.balance += amount
        with transaction.atomic():
            self.user.save()
            self.create_log(amount)

    def create_log(self, amount):
        TransactionLog.objects.create(nim=self.nim, amount=amount)
