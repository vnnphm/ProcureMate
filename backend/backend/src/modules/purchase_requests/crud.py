from fastcrud import FastCRUD

from .models import PurchaseRequest

crud_purchase_requests: FastCRUD = FastCRUD(PurchaseRequest)