from flask import Blueprint, request
from flask_cors import cross_origin
from utility import read_csv_data, generic_json_response
from models.models import Employee, Candidate, db
from datetime import datetime
import secrets
import string
from flask import jsonify


interview_bp = Blueprint('api', __name__, url_prefix="/interviews")


@interview_bp.route('/fetch-data-from-sheet',methods=['POST'])
def fetch_data_from_sheet():
    try:
        candidate_data = read_csv_data("files/data.csv")
        new_candidates = []
        for data in candidate_data:
            exists = Candidate.query.filter_by(job_id=data.get("job_id"), candidate_name=data.get("candidate_name")).first()
            if not exists:
                new_candidates.append(Candidate(**data))
        if new_candidates:
            db.session.add_all(new_candidates)
            db.session.commit()
            msg = f"Inserted {len(new_candidates)} new candidates."
        else:
            msg = "No new candidates to insert."
        return generic_json_response(success=True, status_code=200, message=msg)
    except Exception as err:
        return generic_json_response(
            success=False,
            status_code=500,
            message="Internal server error",
            error=str(err)
        )


@interview_bp.route('/candidate-stage-one', methods=['PATCH'])
@cross_origin()
def candidate_stage_one():
    try:
        data = request.get_json()
        candidate_id = data.get('candidate_id')
        if not candidate_id:
            return generic_json_response(success=False, status_code=400, message='candidate_id is required')
        candidate = Candidate.query.get(candidate_id)
        if not candidate:
            return generic_json_response(success=False, status_code=404, message='Candidate not found')
        candidate.stage_one_status = True
        db.session.commit()
        return generic_json_response(success=True, status_code=200, message='Stage one status set to true.')
    except Exception as err:
        return generic_json_response(
            success=False,
            status_code=500,
            message="Internal server error",
            error=str(err)
        )


@interview_bp.route('/get-candidates-stageone', methods=['GET'])
def get_candidates_stageone():
    try:
        candidates = Candidate.query.filter_by(stage_one_status=1).order_by(Candidate.updated_on.desc()).all()
        result = []
        for candidate in candidates:
            result.append({
                "job_id": candidate.job_id,
                "candidate_id": candidate.candidate_id,
                "candidate_name": candidate.candidate_name,
                "l1_interview_date": candidate.l1_date,
                "l1_status": candidate.l1_status,
                "l2_interview_date": candidate.l2_date,
                "l2_status": candidate.l2_status,
                "hr_interview_date": candidate.hr_date,
                "hr_status": candidate.hr_status,
                "manager_assigned": candidate.manager_assigned,
                "interview_link": candidate.interview_link,
                "final_average_score": candidate.final_average_score,
                "final_decision": candidate.final_decision
            })
        return generic_json_response(
            success=True,
            status_code=200,
            message="Candidates with stage_one_status=1 fetched successfully.",
            data=result
        )
    except Exception as err:
        return generic_json_response(
            success=False,
            status_code=500,
            message="Internal server error",
            error=str(err)
        )
    
@interview_bp.route('/get-candidates', methods = ['GET'])
def get_candidates():
    try:
        candidates = Candidate.query.filter((Candidate.stage_one_status == False) | (Candidate.stage_one_status == None)).order_by(Candidate.updated_on.desc()).all()
        result = []

        
        for candidate in candidates:
            result.append({
                "job_id": candidate.job_id,
                "candidate_id": candidate.candidate_id,
                "candidate_name": candidate.candidate_name,
                "l1_interview_date": candidate.l1_date,
                "l1_status": candidate.l1_status,
                "l2_interview_date": candidate.l2_date,
                "l2_status": candidate.l2_status,
                "hr_interview_date": candidate.hr_date,
                "hr_status": candidate.hr_status,
                "manager_assigned": candidate.manager_assigned,
                "interview_link": candidate.interview_link
            })
            
        return generic_json_response(
            success = True,
            status_code = 200,
            message="Candidate data fetched successfully.",
            data = result
        )


    except Exception as err:
        return generic_json_response(
                                     success=False,
                                     status_code = 500,
                                     message="Internal server error",
                                     error= str(err) 
                                     )


@interview_bp.route('/assign-manager', methods=['PATCH'])
def assign_manager():
    candidate_id = request.args.get('candidate_id')
    manager = request.args.get('manager')
    if not candidate_id or not manager:
        return generic_json_response(success=False, status_code=400, message='candidate_id and manager are required')
    candidate = Candidate.query.get(candidate_id)
    if not candidate:
        return generic_json_response(success=False, status_code=404, message='Candidate not found')
    candidate.manager_assigned = manager
    db.session.commit()
    return generic_json_response(success=True, status_code=200, message='Manager assigned successfully.')



@interview_bp.route('/interview-schedule', methods=['PATCH'])
def interview_schedule():
    try:
        data = request.get_json()

        candidate_id = data.get('candidate_id')
        interview_datetime_str = data.get('interview_datetime')
        round_type = data.get('round_type', None)
        reset = data.get('reset', False)

        # Check required parameters
        if not all([candidate_id, round_type]):
            return generic_json_response(
                success=False,
                status_code=400,
                message="Missing required parameters (candidate_id, round_type)."
            )

        candidate = Candidate.query.get(candidate_id)
        if not candidate:
            return generic_json_response(
                success=False,
                status_code=404,
                message="Candidate not found"
            )

        round_type = round_type.upper()

        if reset:
            # Reset all relevant fields for the round
            if round_type == "L1":
                candidate.l1_date = None
                candidate.l1_status = None
                candidate.l1_panel = None
                candidate.l1_feedback = None
                candidate.manager_assigned = None  # Clear manager on L1 reset
                candidate.interview_link = None
            elif round_type == "L2":
                candidate.l2_date = None
                candidate.l2_status = None
                candidate.l2_panel = None
                candidate.l2_feedback = None
            elif round_type == "HR":
                candidate.hr_date = None
                candidate.hr_status = None
                candidate.hr_id = None
                candidate.hr_feedback = None
            else:
                return generic_json_response(
                    success=False,
                    status_code=400,
                    message="Invalid interview round type."
                )
            db.session.commit()
            return generic_json_response(
                success=True,
                status_code=200,
                message=f"{round_type} interview round reset successfully and all fields cleared."
            )

        # If not reset, proceed as before
        if not interview_datetime_str:
            return generic_json_response(
                success=False,
                status_code=400,
                message="Missing required parameter: interview_datetime."
            )
        try:
            interview_datetime = datetime.strptime(interview_datetime_str, "%Y-%m-%d %H:%M")
        except ValueError:
            return generic_json_response(
                success=False,
                status_code=400,
                message="Invalid datetime format. Use YYYY-MM-DD HH:MM"
            )

        # Logical validations
        if round_type == "L2":
            if not candidate.l1_date:
                return generic_json_response(
                    success=False,
                    status_code=400,
                    message="Cannot schedule L2 before L1 is scheduled."
                )
            if interview_datetime < candidate.l1_date:
                return generic_json_response(
                    success=False,
                    status_code=400,
                    message="L2 interview cannot be before L1 interview."
                )
        elif round_type == "HR":
            if not candidate.l2_date:
                return generic_json_response(
                    success=False,
                    status_code=400,
                    message="Cannot schedule HR before L2 is scheduled."
                )
            if interview_datetime < candidate.l2_date:
                return generic_json_response(
                    success=False,
                    status_code=400,
                    message="HR interview cannot be before L2 interview."
                )
        elif round_type == "L1":
            if candidate.l2_date and interview_datetime > candidate.l2_date:
                return generic_json_response(
                    success=False,
                    status_code=400,
                    message="L1 interview cannot be after L2 is already scheduled."
                )

        # Update interview date and panel
        if round_type == "L1":
            candidate.l1_date = interview_datetime
            if 'l1_panel' in data:
                candidate.l1_panel = data['l1_panel']
        elif round_type == "L2":
            candidate.l2_date = interview_datetime
            if 'l2_panel' in data:
                candidate.l2_panel = data['l2_panel']
        elif round_type == "HR":
            candidate.hr_date = interview_datetime
            if 'hr_panel' in data:
                candidate.hr_panel = data['hr_panel']
        else:
            return generic_json_response(
                success=False,
                status_code=400,
                message="Invalid interview round type."
            )

        db.session.commit()
        return generic_json_response(
            success=True,
            status_code=200,
            message=f"{round_type} interview date updated successfully."
        )

    except Exception as err:
        return generic_json_response(
            success=False,
            status_code=500,
            message="Internal server error",
            error=str(err)
        )


@interview_bp.route("/managers", methods=["GET", "POST"])
def managers_config():
    '''
        API collection to get manager list and assign manager to candidate
    '''    
    try:
        if request.method == "GET":
            # Get all employees with the role as a 'manager'.
            try:
                managers = Employee.query.filter_by(is_manager=True).all()
                response_body = [
                    {"id": manager.id_user, "name": manager.full_name}
                    for manager in managers
                ]

                return generic_json_response(
                    success=True,
                    status_code = 200,
                    message = "Manager list fetched successfully.",
                    data = response_body
                )

            except Exception as err:
                return generic_json_response(
                                             success=False,
                                             status_code = 500,
                                             message="Internal server error",
                                             error= str(err) 
                                             )
            
        if request.method == "POST":
            try:
                data = request.get_json()
                candidate_id = data.get("candidate_id", None)
                manager_id = data.get("manager_id", None)
                
                # Validate inputs
                if not candidate_id or not manager_id:
                    return generic_json_response(success = False,
                                                 status_code = 400,
                                                 message = "Required parameters not provided.",
                                                 )
                
                candidate = Candidate.query.get(candidate_id)
                manager = Employee.query.get(manager_id)

                if not candidate:
                    return generic_json_response(
                        success = False,
                        status_code = 404,
                        message = "Candidate not found."
                    )
                
                if not manager:
                    return generic_json_response(
                        success = False,
                        status_code = 404,
                        message = "Manager not found."
                    )
                
                # assign manager
                candidate.manager_id = manager_id
                db.session.commit()

                return generic_json_response(
                    success = True,
                    status_code = 200,
                     message = "Manager assigned successfully."
                )

            except Exception as err:
                return generic_json_response(
                                             success=False,
                                             status_code = 500,
                                             message="Internal server error",
                                             error= str(err) 
                                             )
    except Exception as err:
        return generic_json_response(
                                     success=False,
                                     status_code = 500,
                                     message="Internal server error",
                                     error= str(err) 
                                     )



@interview_bp.route("/candidate-reject" , methods = ["DELETE"] )
def candidate_reject():
    try:
        candidate_id = request.args.get('candidate_id', None)
        if not candidate_id:
            return generic_json_response(
                                     success=False,
                                     status_code = 400,
                                     message="Required parameters not provided.")

        candidate = Candidate.query.get(candidate_id)
        if not candidate:
            return generic_json_response(
                                     success=False,
                                     status_code = 404,
                                     message="Candidate not found.")
        
        # Deleting user after rejection
        db.session.delete(candidate)
        db.session.commit()
        return generic_json_response(
                                     success=True,
                                     status_code = 200,
                                     message="Candidate deleted successfully.")

    except Exception as err:
            return generic_json_response(
                                     success=False,
                                     status_code = 500,
                                     message="Internal server error",
                                     error= str(err) 
                                     )


@interview_bp.route("/candidate-stage", methods=["GET", "POST"])
def candidate_stage_update():
    """
    GET: Fetch interview stage feedback/status for a candidate
    POST: Update interview stage feedback/status for a candidate
    """
    try:
        if request.method == "POST":
            data = request.get_json()

            candidate_id = data.get("candidate_id", None)
            stage = data.get("stage", None)  # Expected values: "L1", L2", "HR", "JD"
            feedback = data.get("feedback", None)
            status = data.get("status", None)
            final_average_score = data.get("final_average_score" ,None)

            # Validate required fields
            if not candidate_id or not stage or not feedback or not status:
                return generic_json_response(
                    success=False,
                    status_code=400,
                    message="Missing required parameters."
                )

            # Find candidate
            candidate = Candidate.query.get(candidate_id)
            if not candidate:
                return generic_json_response(
                    success=False,
                    status_code=404,
                    message="Candidate not found."
                )

            # Update stage-wise data 
            # Enforce stage order and interview date presence
            if stage.upper() == "L1":
                if not candidate.l1_date:
                    return generic_json_response(
                        success=False, 
                        status_code=400, 
                        message="L1 interview not scheduled.")
                
                candidate.l1_feedback = feedback
                candidate.l1_status = status.upper()
            
            elif stage.upper() == "L2":
                if not candidate.l1_status:
                    return generic_json_response(
                        success=False, 
                        status_code=400, 
                        message="L1 feedback/status must be submitted before L2.")
                
                if not candidate.l2_date:
                    return generic_json_response(
                        success=False, 
                        status_code=400, 
                        message="L2 interview not scheduled.")
                
                candidate.l2_feedback = feedback
                candidate.l2_status = status.upper()
            
            elif stage.upper() == "HR":
                if not candidate.l2_status:
                    return generic_json_response(
                        success=False, 
                        status_code=400, 
                        message="L2 feedback/status must be submitted before HR.")
                
                if not candidate.hr_date:
                    return generic_json_response(
                        success=False, 
                        status_code=400, 
                        message="HR interview not scheduled.")
                
                candidate.hr_feedback = feedback
                candidate.hr_status = status.upper()
            
            elif stage.upper() == "JD":
                if not candidate.hr_status:
                    return generic_json_response(
                        success=False, 
                        status_code=400, 
                        message="HR feedback/status must be submitted before final decision.")
                
                if not final_average_score:
                    return generic_json_response(
                        success=False, 
                        status_code=400, 
                        message="Final average score is required.")
                
                candidate.final_decision = status.upper()
                candidate.final_average_score = final_average_score
            
            else:
                return generic_json_response(
                    success=False, 
                    status_code=400, 
                    message="Invalid stage provided.")
            

            db.session.commit()

            return generic_json_response(
                success=True,
                status_code=200,
                message="Feedback registered successfully."
            )


        if request.method == "GET":
            candidates = Candidate.query.filter(
            (Candidate.l1_date.isnot(None)) |
            (Candidate.l2_date.isnot(None)) |
            (Candidate.hr_date.isnot(None))
            ).all()

            if not candidates:
                return generic_json_response(
                    success=True,
                    status_code=200,
                    message="No candidates with interview dates found.",
                    data=[]
                )

            response_data = []
            for candidate in candidates:
                response_data.append({
                    "candidate_id": candidate.candidate_id,
                    "candidate_name": candidate.candidate_name,
                    "l1_feedback": candidate.l1_feedback,
                    "l1_status": candidate.l1_status,
                    "l1_date": candidate.l1_date,
                    "l2_feedback": candidate.l2_feedback,
                    "l2_status": candidate.l2_status,
                    "l2_date": candidate.l2_date,
                    "hr_feedback": candidate.hr_feedback,
                    "hr_status": candidate.hr_status,
                    "hr_date": candidate.hr_date,
                    "final_average_score" : candidate.final_average_score,
                    "final_decision": candidate.final_decision,
                    "candidate_status": candidate.candidate_status
                })
            
            return generic_json_response(
                success=True,
                status_code=200,
                message="Candidates with interview stages fetched successfully.",
                data=response_data
            )
            
    except Exception as err:
            return generic_json_response(
                success=False,
                status_code=500,
                message="Internal server error",
                error=str(err)
            )
    

@interview_bp.route("/candidate_documents_status" , methods = ["GET", "POST"])
def candidate_documents_update():
    try:
        if request.method == "POST":

            data = request.get_json()

            candidate_id = data.get("candidate_id", None)
            offer_letter_status = data.get("offer_letter_status", None)  
            bgv_status = data.get("bgv_status", None)
            loi_status = data.get("loi_status", None)
            additional_stages = data.get("additional_stages", None)

            # Validate required fields
            if not candidate_id or not offer_letter_status or not bgv_status or not loi_status or not additional_stages:
                return generic_json_response(
                    success=False,
                    status_code=400,
                    message="Missing required parameters."
                )

            # Find candidate
            candidate = Candidate.query.get(candidate_id)
            if not candidate:
                return generic_json_response(
                    success=False,
                    status_code=404,
                    message="Candidate not found."
                    )

             # Update only if provided

            if offer_letter_status is not None:
                candidate.offer_letter_status = offer_letter_status
            
            if bgv_status is not None:
                candidate.bgv_status = bgv_status
            
            if loi_status is not None:
                candidate.loi_status = loi_status

            if additional_stages is not None:
                candidate.additional_stages = additional_stages

            db.session.commit()

            return generic_json_response(
                success=True,
                status_code=200,
                message="Candidate documents status updated."
            )


        if request.method == "GET":
            candidate_id = request.args.get("candidate_id", None)

            if not candidate_id:
                return generic_json_response(
                    success=False,
                    status_code=400,
                    message= "Candidate ID is required."
                )
            
            candidate = Candidate.query.get(candidate_id)
            if not candidate:
                return generic_json_response(
                    success=False,
                    status_code = 404,
                    message="Candidate not found."
                )
            
            document_status_data = {
                    "candidate_id": candidate.candidate_id,
                    "candidate_name": candidate.candidate_name,                
                    "offer_letter_status": candidate.offer_letter_status,
                    "bgv_status": candidate.bgv_status,
                    "loi_status": candidate.loi_status,
                    "additional_stages": candidate.additional_stages
                    }
            
            return generic_json_response(
                success=True,
                status_code=200,
                message="Candidate document status fetched successfully.",
                data=document_status_data
            )
            
    except Exception as err:
            return generic_json_response(
                success=False,
                status_code=500,
                message="Internal server error",
                error=str(err)
            )


JITSI_DOMAIN = "meet.jit.si"

def generate_unique_room_name(length=16):
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))

@interview_bp.route('/generate-meeting-link', methods=['POST'])
def generate_meeting_link():
    data = request.get_json()
    candidate_id = data.get("candidate_id")
    # round_type is optional now, only candidate_id is required
    if not candidate_id:
        return jsonify({"success": False, "message": "candidate_id required"}), 400

    room_name = generate_unique_room_name()
    jitsi_url = f"https://{JITSI_DOMAIN}/{room_name}"

    candidate = Candidate.query.get(candidate_id)
    if not candidate:
        return jsonify({"success": False, "message": "Candidate not found"}), 404

    candidate.interview_link = jitsi_url
    db.session.commit()

    return jsonify({
        "success": True,
        "meeting_url": jitsi_url,
        "candidate_name": candidate.candidate_name
    })

@interview_bp.route("/complete-recruitment", methods=["POST"])
def complete_recruitment():
    try:
        data = request.get_json()
        candidate_id = data.get("candidate_id", None)

        if not candidate_id:
            return generic_json_response(
                success=False,
                status_code=400,
                message="Candidate ID is required."
            )

        candidate = Candidate.query.get(candidate_id)
        if not candidate:
            return generic_json_response(
                success=False,
                status_code=404,
                message="Candidate not found."
            )

        # Check all required conditions are met
        required_fields = [
            candidate.l1_status,
            candidate.l2_status,
            candidate.hr_status,
            candidate.final_decision,
            candidate.offer_letter_status,
            candidate.bgv_status,
            candidate.loi_status,
            candidate.additional_stages
        ]

        if not all(required_fields):
            return generic_json_response(
                success=False,
                status_code=400,
                message="All interview and document stages must be completed."
            )

        candidate.recruitment_completed = True
        candidate.candidate_status = "HIRED"
        db.session.commit()

        return generic_json_response(
            success=True,
            status_code=200,
            message="Candidate recruitment marked as completed."
        )

    except Exception as err:
        return generic_json_response(
            success=False,
            status_code=500,
            message="Internal server error",
            error=str(err)
        )



