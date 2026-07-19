import os
import sys
import json
import random
import argparse
from faker import Faker
from dotenv import load_dotenv

# Try to import ReportLab
try:
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
except ImportError:
    print("ReportLab is required. Please install it using: pip install reportlab")
    sys.exit(1)

# Try to import Google GenAI
try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False

fake = Faker()

# Load API keys from backend .env
backend_env = os.path.join("backend", "RecruitmentPlatform.API", ".env")
if os.path.exists(backend_env):
    load_dotenv(backend_env)
else:
    load_dotenv() # Fallback to root .env

api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GeminiSettings__ApiKey")
if HAS_GEMINI and api_key:
    genai.configure(api_key=api_key)
    print("Gemini API key loaded. AI expansion enabled.")
else:
    print("Gemini API key not found. Using local generator template.")
    HAS_GEMINI = False

def query_gemini_for_cv(input_data):
    """Call Gemini to expand simple information into a highly professional resume JSON structure."""
    prompt = f"""
    Generate a highly professional, realistic resume in JSON format.
    Cohesively expand the details below. Make the professional summary and job descriptions sound outstanding. Include metrics/accomplishments for the experiences (e.g. 'Improved efficiency by 25%').

    Input:
    Name: {input_data.get('name', 'Random Candidate')}
    Role: {input_data.get('role', 'Software Engineer')}
    Skills: {input_data.get('skills', 'Python, SQL')}
    Location: {input_data.get('location', 'San Francisco, CA')}
    Experiences summary: {input_data.get('experiences', '2 years as engineer')}
    Education: {input_data.get('education', 'B.S. CS')}

    Return ONLY a valid JSON object matching the structure below. Do not wrap in markdown ```json ... ``` blocks, return raw text:
    {{
      "personal_info": {{
        "full_name": "...",
        "email": "...",
        "phone": "...",
        "location": "...",
        "linkedin": "linkedin.com/in/...",
        "github": "github.com/..."
      }},
      "summary": "...",
      "skills": ["Skill 1", "Skill 2", ...],
      "experience": [
        {{
          "job_title": "...",
          "company": "...",
          "duration": "...",
          "description": "Describe roles & achievements separated by \\n"
        }}
      ],
      "education": [
        {{
          "degree": "...",
          "university": "...",
          "grad_year": "..."
        }}
      ]
    }}
    """
    try:
        model = genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-1.5-flash"))
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean markdown code blocks
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        return json.loads(text)
    except Exception as e:
        print(f"Gemini generation failed: {e}. Falling back to default generation.")
        return generate_fallback_cv(input_data)

def generate_fallback_cv(input_data):
    """Generate resume JSON locally if Gemini is unavailable or errors out."""
    name = input_data.get('name') or fake.name()
    role = input_data.get('role') or fake.job()
    skills_list = [s.strip() for s in input_data.get('skills', '').split(',') if s.strip()] or ['Python', 'SQL', 'Git', 'Agile']
    location = input_data.get('location') or f"{fake.city()}, {fake.country()}"
    education_input = input_data.get('education') or "B.Sc. Computer Science at State University"
    
    cv = {
        "personal_info": {
            "full_name": name,
            "email": fake.email(),
            "phone": fake.phone_number(),
            "location": location,
            "linkedin": f"linkedin.com/in/{name.lower().replace(' ', '')}",
            "github": f"github.com/{name.lower().replace(' ', '')}"
        },
        "summary": f"Dedicated and detail-oriented {role} with a proven track record of designing, building, and maintaining scalable solutions. Adept at collaborative problem-solving and writing clean, maintainable code.",
        "skills": skills_list,
        "experience": [],
        "education": []
    }
    
    # Generate experiences
    cv["experience"].append({
        "job_title": f"Senior {role}",
        "company": fake.company(),
        "duration": "2024 - Present",
        "description": "Led backend development for high-traffic user portals, improving response rates by 35%.\nCollaborated across cross-functional product and engineering teams to deploy microservices.\nOptimized database queries and schemas, reducing server costs by 15%."
    })
    cv["experience"].append({
        "job_title": role,
        "company": fake.company(),
        "duration": "2021 - 2024",
        "description": "Developed and maintained RESTful APIs servicing over 50k active monthly users.\nCreated automated unit and integration tests to ensure code coverage exceeded 90%.\nWorked closely with UI/UX engineers to implement elegant user interfaces."
    })
    
    # Generate education
    university = f"{fake.city()} University"
    cv["education"].append({
        "degree": education_input,
        "university": university,
        "grad_year": "2021"
    })
    
    return cv

def build_pdf(cv_data, filename="generated_cv.pdf"):
    """Compile the CV JSON data into a beautifully formatted ReportLab PDF document."""
    doc = SimpleDocTemplate(filename, pagesize=letter,
                            rightMargin=40, leftMargin=40,
                            topMargin=45, bottomMargin=40)
    story = []
    styles = getSampleStyleSheet()

    # Colors
    primary_color = colors.HexColor('#0F172A')   # Slate 900
    accent_color = colors.HexColor('#0284C7')    # Sky 600
    text_dark = colors.HexColor('#1E293B')       # Slate 800
    text_muted = colors.HexColor('#64748B')      # Slate 500

    # Custom styles
    title_style = ParagraphStyle(
        'CVTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'CVSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=text_muted,
        spaceAfter=15
    )

    section_header_style = ParagraphStyle(
        'CVSectionHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=accent_color,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'CVBodyText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=text_dark,
        spaceAfter=4
    )

    bold_body_style = ParagraphStyle(
        'CVBoldBodyText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=primary_color,
        spaceAfter=2
    )

    bullet_style = ParagraphStyle(
        'CVBulletText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=text_dark,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=3
    )

    caption_style = ParagraphStyle(
        'CVCaptionText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=12,
        textColor=text_muted,
        spaceAfter=3
    )

    # 1. Header Section
    personal = cv_data["personal_info"]
    story.append(Paragraph(personal["full_name"], title_style))
    
    contact_parts = []
    if personal.get("email"): contact_parts.append(personal["email"])
    if personal.get("phone"): contact_parts.append(personal["phone"])
    if personal.get("location"): contact_parts.append(personal["location"])
    contact_text = "  •  ".join(contact_parts)
    
    socials = []
    if personal.get("linkedin"): socials.append(personal['linkedin'])
    if personal.get("github"): socials.append(personal['github'])
    socials_text = "  •  ".join(socials)
    
    header_info = f"{contact_text}<br/>{socials_text}"
    story.append(Paragraph(header_info, subtitle_style))

    # Decorative Line
    hr = Table([['']], colWidths=[532], rowHeights=[1.5])
    hr.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), accent_color),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(hr)
    story.append(Spacer(1, 10))

    # 2. Professional Summary
    if cv_data.get("summary"):
        story.append(Paragraph("PROFESSIONAL SUMMARY", section_header_style))
        story.append(Paragraph(cv_data["summary"], body_style))

    # 3. Skills Section
    if cv_data.get("skills"):
        story.append(Paragraph("SKILLS & COMPETENCIES", section_header_style))
        skills_text = ", ".join(cv_data["skills"])
        story.append(Paragraph(skills_text, body_style))

    # 4. Experience Section
    if cv_data.get("experience"):
        story.append(Paragraph("PROFESSIONAL EXPERIENCE", section_header_style))
        for exp in cv_data["experience"]:
            # Title & Company
            title_comp = f"<b>{exp['job_title']}</b> — <i>{exp['company']}</i>"
            story.append(Paragraph(title_comp, bold_body_style))
            # Duration
            story.append(Paragraph(exp.get("duration", ""), caption_style))
            
            # Bullet descriptions
            desc_lines = exp["description"].split('\n')
            for line in desc_lines:
                line = line.strip()
                if not line: continue
                # Strip leading bullets if present
                if line.startswith("-") or line.startswith("•"):
                    line = line[1:].strip()
                story.append(Paragraph(f"• {line}", bullet_style))
            story.append(Spacer(1, 4))

    # 5. Education Section
    if cv_data.get("education"):
        story.append(Paragraph("EDUCATION", section_header_style))
        for edu in cv_data["education"]:
            edu_text = f"<b>{edu['degree']}</b> — {edu['university']} (Graduation: {edu['grad_year']})"
            story.append(Paragraph(edu_text, body_style))

    # Build the PDF file
    doc.build(story)

def main():
    parser = argparse.ArgumentParser(description="Generate a professional PDF resume for testing.")
    parser.add_argument("--name", help="Candidate full name")
    parser.add_argument("--role", help="Target professional role")
    parser.add_argument("--skills", help="Key skills (comma separated)")
    parser.add_argument("--location", help="Location (City, Country)")
    parser.add_argument("--experience", dest="experiences", help="Brief experience summary")
    parser.add_argument("--education", help="Degree and university details")
    parser.add_argument("--output", default="generated_cv.pdf", help="Output PDF file name")
    parser.add_argument("--interactive", action="store_true", help="Run in interactive mode")
    
    args = parser.parse_args()
    
    input_data = {}
    if args.interactive or (not args.name and not args.role):
        print("--- CV Generator Tool ---")
        input_data['name'] = input(f"Enter Full Name [{fake.name()}]: ").strip()
        input_data['role'] = input("Enter Role (e.g. Backend Engineer): ").strip()
        input_data['skills'] = input("Enter Skills (comma-separated): ").strip()
        input_data['location'] = input(f"Enter Location (City, Country) [{fake.city()}]: ").strip()
        input_data['experiences'] = input("Brief Experience Summary: ").strip()
        input_data['education'] = input("Education Detail: ").strip()
    else:
        input_data = {
            "name": args.name,
            "role": args.role,
            "skills": args.skills,
            "location": args.location,
            "experiences": args.experiences,
            "education": args.education
        }
    
    # Fill empty inputs with None to let generator handle defaults
    input_data = {k: (v if v else None) for k, v in input_data.items()}
    
    print("\nGenerating CV data...")
    if HAS_GEMINI:
        cv_data = query_gemini_for_cv(input_data)
    else:
        cv_data = generate_fallback_cv(input_data)
        
    print(f"Compiling PDF '{args.output}'...")
    build_pdf(cv_data, args.output)
    print(f"Success! Saved to {os.path.abspath(args.output)}")

if __name__ == "__main__":
    main()
