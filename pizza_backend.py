from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from sqlmodel import SQLModel, Field as SQLField, create_engine, Session, select


class OrderItem(BaseModel):
    category: str = Field(description="pizza | side | drink")
    name: str
    size: Optional[str] = None
    crust: Optional[str] = None
    toppings: Optional[List[str]] = None
    extras: Optional[List[str]] = None
    quantity: int = 1


class CustomerInfo(BaseModel):
    full_name: str
    phone: str
    dine_type: str = Field(description="dine-in | delivery | pickup")
    address: Optional[str] = None


class PaymentInfo(BaseModel):
    method: str = Field(description="cash | card | upi | other")
    paid: bool = False


class OrderCreate(BaseModel):
    items: List[OrderItem]
    customer: CustomerInfo
    payment: Optional[PaymentInfo] = None
    notes: Optional[str] = None


class Order(SQLModel, table=True):
    id: Optional[int] = SQLField(default=None, primary_key=True)
    created_at: datetime = SQLField(default_factory=datetime.utcnow)
    status: str = SQLField(default="received")
    customer_name: str
    phone: str
    dine_type: str
    address: Optional[str] = None
    items_json: str
    notes: Optional[str] = None
    payment_method: Optional[str] = None
    paid: bool = False


DATABASE_URL = "sqlite:///pizza_shop.db"
engine = create_engine(DATABASE_URL)


def init_db() -> None:
    SQLModel.metadata.create_all(engine)


app = FastAPI(title="Pizza Shop API")


PIZZA_MENU = {
    "pizzas": [
        {
            "name": "Margherita",
            "description": "Classic pizza with tomato, mozzarella, fresh basil",
            "sizes": {"small": 7.99, "medium": 9.99, "large": 11.99},
            "crusts": ["thin", "hand-tossed", "cheese-burst"],
            "toppings": ["extra cheese", "olives", "jalapenos", "onions", "mushrooms"],
        },
        {
            "name": "Pepperoni",
            "description": "Tomato, mozzarella, pepperoni",
            "sizes": {"small": 8.99, "medium": 10.99, "large": 12.99},
            "crusts": ["thin", "hand-tossed"],
            "toppings": ["extra cheese", "onions", "mushrooms"],
        },
        {
            "name": "Veggie",
            "description": "Tomato, mozzarella, onions, capsicum, olives, mushrooms",
            "sizes": {"small": 8.49, "medium": 10.49, "large": 12.49},
            "crusts": ["thin", "hand-tossed", "wheat"],
            "toppings": ["extra cheese", "jalapenos", "corn"],
        },
    ],
    "sides": [
        {"name": "Garlic Bread", "price": 3.49, "description": "Buttery garlic bread"},
        {"name": "Cheesy Sticks", "price": 4.99, "description": "Mozzarella sticks"},
    ],
    "drinks": [
        {"name": "Coke", "sizes": {"small": 1.49, "medium": 1.99, "large": 2.49}},
        {"name": "Sprite", "sizes": {"small": 1.49, "medium": 1.99, "large": 2.49}},
        {"name": "Water", "sizes": {"small": 0.99}},
    ],
}


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/menu")
def get_menu():
    return PIZZA_MENU


@app.post("/orders")
def create_order(payload: OrderCreate):
    import json

    with Session(engine) as session:
        order = Order(
            customer_name=payload.customer.full_name,
            phone=payload.customer.phone,
            dine_type=payload.customer.dine_type,
            address=payload.customer.address,
            items_json=json.dumps([item.model_dump() for item in payload.items]),
            notes=payload.notes,
            payment_method=(payload.payment.method if payload.payment else None),
            paid=(payload.payment.paid if payload.payment else False),
        )
        session.add(order)
        session.commit()
        session.refresh(order)
        return {"order_id": order.id, "status": order.status}


@app.get("/orders/{order_id}")
def get_order(order_id: int):
    with Session(engine) as session:
        stmt = select(Order).where(Order.id == order_id)
        order = session.exec(stmt).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order


