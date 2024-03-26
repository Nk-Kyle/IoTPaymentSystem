from django.contrib import admin
from api.models import User, TransactionLog


# Register your models here.
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = [field.name for field in User._meta.fields]

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
