// Tab navigation
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
    
    // Load data if needed
    if (tabName === 'operations') {
        loadProjects();
    } else if (tabName === 'crm') {
        loadCustomers();
    }
}

// Proposal generation
async function generateProposal(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const resultsDiv = document.getElementById('proposal-results');
    const generateBtn = document.getElementById('generate-btn');
    
    // Show loading state
    generateBtn.disabled = true;
    generateBtn.classList.add('loading');
    generateBtn.textContent = 'Generating Proposal...';
    resultsDiv.innerHTML = '<p class="placeholder">AI is analyzing customer data and generating proposal...</p>';
    
    try {
        const response = await fetch('/generate-proposal', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            resultsDiv.innerHTML = data.proposal;
            resultsDiv.style.color = '#333';
        } else {
            resultsDiv.innerHTML = '<p style="color: red;">Error generating proposal. Please try again.</p>';
        }
    } catch (error) {
        resultsDiv.innerHTML = '<p style="color: red;">Network error. Please check your connection and try again.</p>';
    } finally {
        // Reset button
        generateBtn.disabled = false;
        generateBtn.classList.remove('loading');
        generateBtn.textContent = 'Generate AI Proposal';
    }
}

// Project analysis
async function analyzeProject(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const resultsDiv = document.getElementById('analysis-results');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Analyzing...';
    resultsDiv.innerHTML = '<p class="placeholder">AI is analyzing project requirements...</p>';
    
    try {
        const response = await fetch('/analyze-project', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            resultsDiv.innerHTML = data.analysis;
            resultsDiv.style.color = '#333';
        } else {
            resultsDiv.innerHTML = '<p style="color: red;">Error analyzing project. Please try again.</p>';
        }
    } catch (error) {
        resultsDiv.innerHTML = '<p style="color: red;">Network error. Please check your connection and try again.</p>';
    } finally {
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Analyze Project';
    }
}

// Load projects for operations tab
async function loadProjects() {
    try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        const projectList = document.getElementById('project-list');
        
        if (data.projects && data.projects.length > 0) {
            projectList.innerHTML = data.projects.map(project => `
                <div class="project-item">
                    <h4>${project.customer_name || 'Customer #' + project.customer_id}</h4>
                    <p><strong>System Size:</strong> ${project.system_size_kw}kW</p>
                    <p><strong>Value:</strong> $${project.value?.toLocaleString() || 'TBD'}</p>
                    <p><strong>Timeline:</strong> ${project.timeline || 'TBD'}</p>
                    <span class="project-status status-${project.status?.toLowerCase() || 'proposal'}">${project.status || 'Proposal'}</span>
                </div>
            `).join('');
        } else {
            projectList.innerHTML = '<p>No projects found. Check back soon!</p>';
        }
    } catch (error) {
        document.getElementById('project-list').innerHTML = '<p>Error loading projects.</p>';
    }
}

// Load customers for CRM tab
async function loadCustomers() {
    try {
        const response = await fetch('/api/customers');
        const data = await response.json();
        const customerList = document.getElementById('customer-list');
        
        if (data.customers && data.customers.length > 0) {
            customerList.innerHTML = data.customers.map(customer => `
                <div class="customer-item">
                    <h4>${customer.name}</h4>
                    <p><strong>Address:</strong> ${customer.address}</p>
                    <p><strong>Usage:</strong> ${customer.annual_usage_kwh?.toLocaleString() || 'N/A'} kWh/year</p>
                    <p><strong>Lead Source:</strong> ${customer.lead_source || 'Direct'}</p>
                    <p><strong>Lead Cost:</strong> $${customer.lead_cost || '18'}</p>
                    <span class="customer-status status-${customer.status?.toLowerCase() || 'lead'}">${customer.status || 'Lead'}</span>
                </div>
            `).join('');
        } else {
            customerList.innerHTML = '<p>No customers found. Check back soon!</p>';
        }
    } catch (error) {
        document.getElementById('customer-list').innerHTML = '<p>Error loading customers.</p>';
    }
}

// Set default install date to next month
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.querySelector('input[name="install_date"]');
    if (dateInput) {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        dateInput.value = nextMonth.toISOString().split('T')[0];
    }
});