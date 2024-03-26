from django.db import models

# Create your models here.
from django.db import models
from constants import BASE_BALANCE

# Create your models here.


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class User(BaseModel):
    nim = models.CharField(max_length=10)
    balance = models.IntegerField(default=BASE_BALANCE)

    def __str__(self):
        return self.nim


class TransactionLog(BaseModel):
    nim = models.CharField(max_length=10)
    amount = models.IntegerField()
