from api.models import User, TransactionLog
from datetime import timedelta


def get_user_info(uid):
    user = User.objects.filter(uid=uid).first()
    history = TransactionLog.objects.filter(uid=uid)
    history = [
        {
            "amount": (
                log.amount
                if log.transaction_type == TransactionLog.TransactionType.TOPUP
                else -log.amount
            ),
            "time": (log.created_at + timedelta(hours=7)).strftime(
                "%d-%m-%Y, %H:%M:%S"
            ),
        }
        for log in history
    ]
    if user:
        return {
            "status": "success",
            "balance": user.balance,
            "uid": user.uid,
            "history": history,
        }
    return {"status": "failed", "message": "User not found"}
