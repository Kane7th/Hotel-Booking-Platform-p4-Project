from app import create_app, db

app = create_app()

@app.shell_context_processor
def make_shell_context():
    from app.models import Customer, Room, Booking, Payment
    return {'db': db, 'Customer': Customer, 'Room': Room, 'Booking': Booking, 'Payment': Payment}
