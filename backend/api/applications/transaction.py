from api.models import User, TransactionLog
from django.db import transaction

from paymentapp import mqtt


class Transaction:

    def __init__(self, uid):
        self.uid = uid
        self.user = User.objects.get_or_create(uid=uid)[0]

    def deduct(self, amount):

        if self.user.balance < amount:
            # Publish to MQTT
            mqtt.client.publish(
                "iot/failed",
                f"Insufficient balance for {self.uid} to deduct {amount}\nBalance: {self.user.balance}",
            )
            return

        self.user.balance -= amount
        with transaction.atomic():
            self.user.save()
            self.create_log(amount)

        # Publish to MQTT
        mqtt.client.publish(
            "iot/success",
            f"Successfully deducted {amount} for {self.uid}\nBalance: {self.user.balance}",
        )

    def topup(self, amount):
        self.user.balance += amount
        with transaction.atomic():
            self.user.save()
            self.create_log(amount, TransactionLog.TransactionType.TOPUP)

    def create_log(
        self, amount, transaction_type=TransactionLog.TransactionType.DEDUCT
    ):
        TransactionLog.objects.create(
            uid=self.uid, amount=amount, transaction_type=transaction_type
        )
