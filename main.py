import os
import json
import asyncio
from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
import anthropic
import uvicorn

app = FastAPI(title="Solar Operations Automation Platform")

# Mount static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Initialize Claude client
anthropic_client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

def load_json(path, default=None):
    """Safely load JSON data with fallback"""
    try:
        with open(path) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return default if default is not None else []

@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Main dashboard with proposal generator and operations overview"""
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/generate-proposal")
async def generate_proposal(
    customer_name: str = Form(...),
    address: str = Form(...),
    annual_usage: str = Form(...),
    roof_size: str = Form(...),
    roof_direction: str = Form(...),
    shading: str = Form(...),
    financing_type: str = Form(...),
    monthly_budget: str = Form(...)
):
    """Generate AI-powered solar proposal"""
    try:
        # Prepare customer data for AI
        customer_data = {
            "name": customer_name,
            "address": address,
            "annual_usage_kwh": annual_usage,
            "roof_size_sqft": roof_size,
            "roof_direction": roof_direction,
            "shading_level": shading,
            "financing_preference": financing_type,
            "monthly_budget": monthly_budget
        }
        
        # Load template data for context
        templates_data = load_json("data/proposal_templates.json", {})
        jurisdictions = load_json("data/jurisdictions.json", [])
        
        system_prompt = """You are an expert solar proposal generator. Create a comprehensive, professional solar proposal based on customer data.

Include these sections:
1. System Size Calculation (based on usage and roof specs)
2. Energy Offset Percentage 
3. Financing Options (match customer preference)
4. Installation Timeline
5. Permit Requirements (based on location)
6. ROI Projections and Savings
7. Equipment Specifications

Use realistic pricing:
- Residential systems: $2.50-3.50 per watt installed
- Average system size: 6-12kW for residential
- Federal tax credit: 30%
- Typical payback: 6-10 years

Format as professional proposal with clear sections and specific numbers."""

        user_content = f"""Generate a solar proposal for:
Customer: {customer_name}
Address: {address}
Annual Usage: {annual_usage} kWh
Roof: {roof_size} sq ft, {roof_direction} facing
Shading: {shading}
Financing: {financing_type}
Budget: ${monthly_budget}/month

Include specific system sizing, costs, timeline, and savings projections."""

        message = anthropic_client.messages.create(
            model=os.environ.get("ANTHROPIC_MODEL", "claude-3-haiku-20240307"),
            max_tokens=2000,
            system=system_prompt,
            messages=[{"role": "user", "content": user_content}]
        )
        
        return {"proposal": message.content[0].text, "success": True}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Proposal generation failed: {str(e)}")

@app.post("/analyze-project")
async def analyze_project(
    project_type: str = Form(...),
    location: str = Form(...),
    system_size: str = Form(...),
    install_date: str = Form(...)
):
    """AI analysis of project requirements and permits"""
    try:
        system_prompt = """You are a solar project operations expert. Analyze project requirements and provide:

1. Permit Requirements (building, electrical, interconnection)
2. Inspection Timeline
3. Potential Challenges
4. Recommended Next Steps
5. Municipal Requirements
6. Utility Interconnection Process

Be specific about timelines, required documents, and potential issues."""

        user_content = f"""Analyze this solar project:
Type: {project_type}
Location: {location}
System Size: {system_size}
Planned Install: {install_date}

Provide permit requirements, timeline, and operational recommendations."""

        message = anthropic_client.messages.create(
            model=os.environ.get("ANTHROPIC_MODEL", "claude-3-haiku-20240307"),
            max_tokens=1500,
            system=system_prompt,
            messages=[{"role": "user", "content": user_content}]
        )
        
        return {"analysis": message.content[0].text, "success": True}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Project analysis failed: {str(e)}")

@app.get("/api/customers")
async def get_customers():
    """Get customer list for CRM demo"""
    customers = load_json("data/customers.json", [])
    return {"customers": customers}

@app.get("/api/projects") 
async def get_projects():
    """Get project pipeline data"""
    projects = load_json("data/projects.json", [])
    return {"projects": projects}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)