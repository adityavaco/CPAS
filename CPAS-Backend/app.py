from flask import Flask
from api.interview_scheduler_api.route import interview_bp
from models.models import Employee, Candidate, db
from flask_cors import CORS

app = Flask(__name__)

CORS(app, origins=["http://localhost:3000"], supports_credentials=True, allow_headers=["Content-Type", "Authorization"])

app.register_blueprint(interview_bp)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cpas_database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True

db.init_app(app)

# Create tables if they don't exist
with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(debug = True)