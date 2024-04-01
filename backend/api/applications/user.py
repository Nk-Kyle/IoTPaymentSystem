from api.models import User, TransactionLog


def get_user_info(uid):
    user = User.objects.filter(uid=uid).first()
    history = TransactionLog.objects.filter(uid=uid)
    history = [
        {
            "amount": log.amount if log.transaction_type == 1 else -log.amount,
            "time": log.created_at.strftime("%d-%m-%Y, %H:%M:%S"),
        }
        for log in history
    ]
    if user:
        return {
            "status": "success",
            "balance": user.balance,
            "nim": user.uid,
            "history": history,
        }
    return {"status": "failed", "message": "User not found"}
