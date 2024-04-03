from django.db import models

# Create your models here.
from django.db import models
from constants import BASE_BALANCE

from django.contrib.auth.hashers import make_password


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class User(BaseModel):
    uid = models.CharField(max_length=10)
    password = models.CharField(max_length=255, default=make_password("password"))
    balance = models.IntegerField(default=BASE_BALANCE)

    def __str__(self):
        return self.uid


class TransactionLog(BaseModel):
    class TransactionType(models.TextChoices):
        TOPUP = "TOPUP"
        DEDUCT = "DEDUCT"

    uid = models.CharField(max_length=10)
    amount = models.IntegerField()
    transaction_type = models.CharField(max_length=10, choices=TransactionType.choices)

    class Meta:
        ordering = ["-created_at"]
