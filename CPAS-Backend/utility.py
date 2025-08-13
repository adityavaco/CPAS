# from google.oauth2 import service_account
# from googleapiclient.discovery import build
# import datetime
# import uuid

from flask import jsonify
import csv


def read_csv_data(file_path):
    data = []
    try:
        with open(file_path, mode='r', newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)  # Reads as list of dictionaries
            for row in reader:
                data.append(row)
        return data
    except FileNotFoundError:
        print(f"File not found: {file_path}")
        return []
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return []
    

def generic_json_response(success = True, status_code = 200, message ='', data=[], error=[]):
    response_body = {'success':  success, 'status_code' : status_code, 'message' : message, 'data' : data, 'error' : error }
    return jsonify(response_body), status_code



# class GoogleMeetScheduler:
#     def __init__(self, service_account_file: str, calendar_id: str):
#         self.service_account_file = service_account_file
#         self.calendar_id = calendar_id
#         self.scopes = ['https://www.googleapis.com/auth/calendar']
#         self.credentials = service_account.Credentials.from_service_account_file(
#             self.service_account_file, scopes=self.scopes)
#         self.service = build('calendar', 'v3', credentials=self.credentials)

#     def create_meeting(self, summary: str, description: str, start_datetime: str, end_datetime: str, attendee_email: str = None):
#         """
#         Create a Google Calendar event (no Meet link for personal Gmail).

#         :param summary: Title of the event
#         :param description: Event description
#         :param start_datetime: Start in ISO format (e.g., '2025-07-30T15:00:00+05:30')
#         :param end_datetime: End in ISO format (e.g., '2025-07-30T15:30:00+05:30')
#         :param attendee_email: Optional participant email
#         :return: Event link or ID
#         """

#         event = {
#             'summary': summary,
#             'description': description,
#             'start': {
#                 'dateTime': start_datetime,
#                 'timeZone': 'Asia/Kolkata',
#             },
#             'end': {
#                 'dateTime': end_datetime,
#                 'timeZone': 'Asia/Kolkata',
#             },
#         }

#         if attendee_email:
#             event['attendees'] = [{'email': attendee_email}]

#         created_event = self.service.events().insert(
#             calendarId=self.calendar_id,
#             body=event
#         ).execute()

#         return created_event.get('htmlLink')  # returns event view link


# if __name__ == "__main__":
#     scheduler = GoogleMeetScheduler('cpas-project-467504-0b6631d717dd.json', 'info2nitikadhalla@gmail.com')
#     event_link = scheduler.create_meeting(
#         summary='Interview with Candidate',
#         description='Discussion on technical fit.',
#         start_datetime='2025-07-30T15:00:00+05:30',
#         end_datetime='2025-07-30T15:30:00+05:30',
#     )
#     print("Event Link:", event_link)