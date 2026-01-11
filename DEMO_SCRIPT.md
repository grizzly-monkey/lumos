# NightWatch Demo Script

## 1. Introduction (1 minute)

- **Goal:** Showcase NightWatch's ability to autonomously detect, diagnose, and resolve a common database issue.
- **Scenario:** A sudden spike in slow queries is degrading application performance.
- **Key Features to Highlight:**
  - Real-time monitoring
  - AI-powered root cause analysis
  - Automated, safe remediation
  - Human-in-the-loop for high-risk actions

## 2. The "Normal" State (30 seconds)

- Show the dashboard in its "healthy" state.
- Point out the key metrics: low CPU, stable connections, zero slow queries.
- Explain that NightWatch is constantly monitoring these metrics against learned baselines.

## 3. Triggering the Incident (1 minute)

- Click the "Run Slow Query Demo" button.
- **Narrate what's happening behind the scenes:**
  - "We're now simulating a traffic spike that causes a specific, un-indexed query to run frequently."
  - "This will cause a cascade of issues: CPU will spike, and the number of slow queries will jump."
- **On the frontend:**
  - Point to the "Activity Feed" to show the "Demo Started" event.
  - Watch the metrics cards and charts start to change, reflecting the anomaly.

## 4. Detection & Diagnosis (1.5 minutes)

- **Detection:**
  - A new "Critical Incident" card will appear.
  - "NightWatch's monitoring engine has just detected a deviation from the baseline."
- **Diagnosis (The "Magic"):**
  - The "Activity Feed" will show the agent's thought process:
    - "Analyzing incident..."
    - "Fetching similar past incidents..."
    - "Found 3 similar incidents. All were resolved by adding an index."
    - "AI analysis complete. Recommended action: `create_index`."
  - **Explain the AI's role:** "The Gemini model analyzed the symptoms and compared them to a vector database of past resolved incidents. It concluded with 95% confidence that a missing index is the root cause."

## 5. Remediation & Resolution (1 minute)

- **Action:**
  - The "Activity Feed" will show:
    - "Action confidence (95%) exceeds threshold (85%). Executing automatically."
    - "Executing action: `create_index` on `users.email`..."
    - "Action successful. Execution time: 150ms."
- **Resolution:**
  - Watch the metrics on the dashboard return to normal. CPU usage will drop, and slow queries will go to zero.
  - The incident card will move to the "Resolved" section.
  - The database status indicator will turn green again.

## 6. Conclusion (30 seconds)

- **Recap:** "In just a few minutes, NightWatch automatically detected a critical issue, diagnosed the root cause using AI, and safely resolved it without any human intervention."
- **Final thought:** "This frees up DBA time to focus on proactive improvements rather than firefighting."
