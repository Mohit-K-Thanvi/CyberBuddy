from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import random

router = APIRouter(prefix="/training", tags=["Security Training"])

class QuizAnswer(BaseModel):
    question_id: int
    user_answer: str  # "phishing" or "legitimate"

class QuizSubmission(BaseModel):
    answers: List[QuizAnswer]

# --- PHISHING QUIZ DATABASE ---
QUIZ_QUESTIONS = [
    {
        "id": 1,
        "type": "email",
        "sender": "security@amaz0n-support.com",
        "subject": "Your account has been compromised!",
        "body": "Dear Customer, We detected unusual activity. Click here to verify your identity immediately or your account will be suspended.",
        "correct_answer": "phishing",
        "explanation": "The sender domain 'amaz0n-support.com' uses a zero instead of 'o'. Real Amazon emails come from @amazon.com."
    },
    {
        "id": 2,
        "type": "email",
        "sender": "noreply@github.com",
        "subject": "Your repository has a new star",
        "body": "Hey! Someone just starred your repository CyberBuddy. Keep up the great work!",
        "correct_answer": "legitimate",
        "explanation": "This is from the official github.com domain with no urgency or suspicious links."
    },
    {
        "id": 3,
        "type": "email",
        "sender": "helpdesk@paypa1.com",
        "subject": "URGENT: Confirm your PayPal transaction",
        "body": "You sent $499.99 to electronics-store@gmail.com. If this wasn't you, click here to cancel NOW!",
        "correct_answer": "phishing",
        "explanation": "The domain 'paypa1.com' uses the number 1 instead of letter L. Classic typosquatting attack."
    },
    {
        "id": 4,
        "type": "email",
        "sender": "no-reply@linkedin.com",
        "subject": "You appeared in 5 searches this week",
        "body": "Hi, Your profile was viewed by recruiters from Google and Microsoft. See who's looking at your profile.",
        "correct_answer": "legitimate",
        "explanation": "LinkedIn sends these weekly digests from their official domain. No suspicious urgency."
    },
    {
        "id": 5,
        "type": "email",
        "sender": "admin@microsofft-security.com",
        "subject": "Your Microsoft 365 subscription expires TODAY",
        "body": "Your subscription will be cancelled in 2 hours. Enter your credit card details to renew instantly.",
        "correct_answer": "phishing",
        "explanation": "The domain has 'microsofft' (double F) and asks for credit card via email. Microsoft never does this."
    },
    {
        "id": 6,
        "type": "url",
        "url": "https://google.com/search?q=weather",
        "context": "A link in a trusted friend's message",
        "correct_answer": "legitimate",
        "explanation": "This is the official Google search URL with no suspicious parameters."
    },
    {
        "id": 7,
        "type": "url",
        "url": "https://login-facebook.security-check.com/verify",
        "context": "A link claiming your Facebook account needs verification",
        "correct_answer": "phishing",
        "explanation": "The real domain is 'security-check.com', not Facebook. This is a subdomain attack."
    },
    {
        "id": 8,
        "type": "email",
        "sender": "hr@yourcompany.com",
        "subject": "Updated Holiday Schedule 2024",
        "body": "Hi Team, Please find the updated holiday schedule attached. Reach out if you have questions.",
        "correct_answer": "legitimate",
        "explanation": "Internal company email with no urgency, links, or requests for credentials."
    },
]

@router.get("/quiz")
async def get_quiz():
    """Get a randomized phishing quiz (5 questions)."""
    questions = random.sample(QUIZ_QUESTIONS, min(5, len(QUIZ_QUESTIONS)))
    
    # Remove answers before sending to client
    safe_questions = []
    for q in questions:
        safe_q = {k: v for k, v in q.items() if k not in ["correct_answer", "explanation"]}
        safe_questions.append(safe_q)
    
    return {"questions": safe_questions}

@router.post("/quiz/submit")
async def submit_quiz(submission: QuizSubmission):
    """Grade the quiz and return results with explanations."""
    
    question_map = {q["id"]: q for q in QUIZ_QUESTIONS}
    
    results = []
    correct_count = 0
    
    for answer in submission.answers:
        question = question_map.get(answer.question_id)
        if not question:
            continue
            
        is_correct = answer.user_answer.lower() == question["correct_answer"]
        if is_correct:
            correct_count += 1
            
        results.append({
            "question_id": answer.question_id,
            "user_answer": answer.user_answer,
            "correct_answer": question["correct_answer"],
            "is_correct": is_correct,
            "explanation": question["explanation"]
        })
    
    total = len(submission.answers)
    score_percent = round((correct_count / total) * 100, 1) if total > 0 else 0
    
    # Determine grade
    if score_percent >= 80:
        grade = "A"
        message = "🛡️ Excellent! You're a phishing detection expert!"
    elif score_percent >= 60:
        grade = "B"
        message = "👍 Good job! A few more tips and you'll be unstoppable."
    elif score_percent >= 40:
        grade = "C"
        message = "⚠️ Be careful! Attackers could trick you. Review the explanations."
    else:
        grade = "F"
        message = "🚨 High Risk! You need more training. Study the red flags carefully."
    
    return {
        "correct": correct_count,
        "total": total,
        "score_percent": score_percent,
        "grade": grade,
        "message": message,
        "results": results
    }
