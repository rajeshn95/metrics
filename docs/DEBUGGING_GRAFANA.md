# Debugging Grafana Dashboard Provisioning: "Dashboard title cannot be empty"

## Problem

When starting Grafana with dashboard provisioning, the following error appeared repeatedly in the logs:

```
failed to load dashboard from ... error="Dashboard title cannot be empty"
```

## Symptoms

- Dashboards were not visible in Grafana.
- The error above appeared for each dashboard JSON file.

## Investigation Steps

1. **Checked Dashboard JSON Structure:**
   - The dashboard files were structured as `{ "dashboard": { ... } }` (i.e., all dashboard properties nested under a `dashboard` key).
2. **Compared with Grafana's Expected Format:**
   - Grafana expects dashboard JSON files to have properties like `title`, `panels`, etc. at the root level, not nested under `dashboard`.
   - Example from Grafana UI import:
     ```json
     {
       "title": "Example Dashboard",
       "uid": "example-dashboard",
       "panels": [...]
     }
     ```
3. **Checked for UID:**
   - Adding a `uid` field is recommended for uniqueness and upgrades.
4. **Verified File Mounting and Permissions:**
   - Confirmed the files were present and readable inside the Grafana container.
5. **Restarted Grafana After Each Change:**
   - Used `docker compose restart grafana` to reload dashboards after edits.

## Commands Used During Debugging

Below are the key commands used, with explanations:

```bash
# List running containers and their status
cd docker && docker compose ps

# View the last 20 lines of Grafana logs (to check for errors)
docker compose logs grafana --tail=20

# Restart the Grafana container (to reload dashboards after changes)
docker compose restart grafana

# Wait and then check logs again (to confirm provisioning status)
sleep 10 && docker compose logs grafana --tail=20

# Check if dashboard files are present inside the Grafana container
docker exec docker-grafana-1 ls -la /var/lib/grafana/dashboards/

# View the first 10 lines of a dashboard file inside the container (to verify content)
docker exec docker-grafana-1 head -10 /var/lib/grafana/dashboards/alerts-dashboard.json

# Use curl to check if Grafana is running and responding
curl -s http://localhost:3000/api/health

# Find all dashboard JSON files and preview their content (from host)
find grafana/dashboards -name "*.json" -exec echo "=== {} ===" \; -exec head -5 {} \;
```

## Root Cause

- **Incorrect JSON structure:** The dashboard files were wrapped in a `dashboard` key, so Grafana could not find the `title` at the root level.

## Solution

1. **Remove the outer `dashboard` key:** Move all dashboard properties to the root of the JSON file.
2. **Add a `uid` field:** Ensure each dashboard has a unique `uid`.
3. **Restart Grafana:**
   ```bash
   docker compose restart grafana
   ```
4. **Check logs:** Confirm the absence of the error and the presence of `finished to provision dashboards`.

## Example Fixed Dashboard JSON

```json
{
  "uid": "alerts-dashboard",
  "title": "Node.js Alerts & Thresholds",
  "panels": [...],
  ...
}
```

## Result

- Dashboards loaded successfully.
- No more "Dashboard title cannot be empty" errors in the logs.

---

**Tip:**

- Always use the root-level structure for dashboard JSON files when provisioning in Grafana.
- Add a `uid` for each dashboard for best practices.
