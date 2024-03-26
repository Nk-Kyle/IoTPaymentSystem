from api.models import User, TransactionLog
from django.db import transaction


class Transaction:

    def __init__(self, nim):
        self.nim = nim
        self.user = User.objects.get_or_create(nim=nim)[0]

    def deduct(self, amount):
        self.user.balance -= amount
        with transaction.atomic():
            self.user.save()
            self.create_log(-amount)

    def topup(self, amount):
        self.user.balance += amount
        with transaction.atomic():
            self.user.save()
            self.create_log(amount)

    def create_log(self, amount):
        TransactionLog.objects.create(nim=self.nim, amount=amount)
