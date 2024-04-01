from django.contrib import admin
from api.models import User, TransactionLog

from django.forms import ModelForm, PasswordInput
from django import forms
from django.contrib.auth.hashers import make_password


class UserForm(ModelForm):
    password = forms.CharField(widget=PasswordInput())

    def save(self, commit=True):
        user = super(UserForm, self).save(commit=False)
        user.password = make_password(self.cleaned_data["password"])
        if commit:
            user.save()
        return user

    class Meta:
        model = User
        fields = "__all__"


# Register your models here.
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    form = UserForm
    list_display = [
        field.name for field in User._meta.fields if field.name != "password"
    ]

    # on delete, remove all related transaction logs
    def delete_model(self, request, obj):
        TransactionLog.objects.filter(uid=obj.uid).delete()
        obj.delete()


@admin.register(TransactionLog)
class TransactionLogAdmin(admin.ModelAdmin):
    list_display = [field.name for field in TransactionLog._meta.fields]

    # Make all fields readonly
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
