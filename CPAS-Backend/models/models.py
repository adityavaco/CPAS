from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Employee(db.Model):
    __tablename__ = 'employee'

    id_user = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_name = db.Column(db.String, nullable=False)
    reporting_manager_id = db.Column(db.Integer, nullable=False, default=0)
    last_working_day = db.Column(db.DateTime, nullable=True)
    password = db.Column(db.String, nullable=False)
    security_key = db.Column(db.String, nullable=False)
    full_name = db.Column(db.String, nullable=False)
    is_admin = db.Column(db.Integer, nullable=False, default=0)
    is_manager = db.Column(db.Integer, nullable=False, default=0)
    is_hr = db.Column(db.Integer, nullable=False, default=0)
    is_panel_member = db.Column(db.Integer, nullable=False, default=0)
    email = db.Column(db.String, nullable=False, unique=True)
    employee_id = db.Column(db.String, nullable=False, unique = True)
    client_name = db.Column(db.String, nullable=False)
    is_notice_period = db.Column(db.Integer, nullable=False, default=0)
    is_active = db.Column(db.Integer, nullable=False, default=1)
    created_on = db.Column(db.DateTime, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships (optional, but useful)
    managed_candidates = db.relationship('Candidate', foreign_keys='Candidate.manager_id', backref='manager', lazy=True)
    hr_candidates = db.relationship('Candidate', foreign_keys='Candidate.hr_id', backref='hr', lazy=True)



class Candidate(db.Model):
    __tablename__ = 'candidates'

    candidate_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    candidate_name = db.Column(db.String, nullable=False)
    hr_id = db.Column(db.Integer, db.ForeignKey('employee.id_user'))
    total_experience = db.Column(db.Float)
    resume_link = db.Column(db.String)
    job_id = db.Column(db.String, nullable=False)
    manager_id = db.Column(db.Integer, db.ForeignKey('employee.id_user'))
    job_role = db.Column(db.String)
    manager_assigned = db.Column(db.String)  # Stores the assigned manager string (e.g., 'manager_raj')
    interview_link = db.Column(db.String)
    l1_panel = db.Column(db.String) #sare members yha ane chahiye jb manager select krega is_panel jb 1 ya true hoga tb
    l1_date = db.Column(db.DateTime)
    l1_feedback = db.Column(db.String)  
    l1_status = db.Column(db.String)
    l2_panel = db.Column(db.String)
    l2_date = db.Column(db.DateTime)  
    l2_feedback = db.Column(db.String)
    l2_status = db.Column(db.String)
    hr_panel = db.Column(db.String)  # HR panel members
    hr_date = db.Column(db.DateTime)
    hr_feedback = db.Column(db.Text)
    hr_status = db.Column(db.String(20)) #avg scoring column ko add kiya hai
    final_average_score = db.Column(db.Float)
    final_decision = db.Column(db.String) #selected or rejected
    candidate_status = db.Column(db.String, default='pending') #candidate ana chahta hai ya nhi
    offer_letter_status = db.Column(db.Integer, default=0)
    bgv_status = db.Column(db.Integer, default=0)
    loi_status = db.Column(db.Integer, default=0)
    additional_stages = db.Column(db.Integer, default=0)
    stage_one_status = db.Column(db.Boolean, default=False)  # True if candidate accepted in stage one
    is_active = db.Column(db.Integer, default=1)
    created_on = db.Column(db.DateTime, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)



