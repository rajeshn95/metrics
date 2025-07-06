// JavaScript moved from index.html
// All event handlers are now added via addEventListener

const SERVER_URL = "http://localhost:3010";
let loadTestRunning = false;
let testResults = [];
let totalRequests = 0;
let successfulRequests = 0;
let totalResponseTime = 0;

// Check server status on page load
window.onload = function () {
  checkServerStatus();
  setInterval(checkServerStatus, 10000); // Check every 10 seconds
};

async function checkServerStatus() {
  try {
    const response = await fetch(`${SERVER_URL}/health`);
    if (response.ok) {
      document.getElementById("statusIndicator").className =
        "status-indicator status-online";
      document.getElementById("statusText").textContent = "Server is online";
      document.getElementById("statsGrid").style.display = "grid";
    } else {
      throw new Error("Server not responding");
    }
  } catch (error) {
    document.getElementById("statusIndicator").className =
      "status-indicator status-offline";
    document.getElementById("statusText").textContent = "Server is offline";
    document.getElementById("statsGrid").style.display = "none";
  }
}

function addEventListeners() {
  // Individual API buttons by ID
  const apiButtons = [
    { id: "fastApiBtn", endpoint: "/api/fast" },
    { id: "mediumApiBtn", endpoint: "/api/medium" },
    { id: "slowApiBtn", endpoint: "/api/slow" },
    { id: "unreliableApiBtn", endpoint: "/api/unreliable" },
    { id: "cpuApiBtn", endpoint: "/api/cpu-intensive" },
    { id: "memoryApiBtn", endpoint: "/api/memory-intensive" },
  ];
  apiButtons.forEach(({ id, endpoint }) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener("click", () => testAPI(endpoint, btn));
    }
  });

  // Load test buttons
  const startBtn = document.getElementById("startLoadTestBtn");
  if (startBtn) startBtn.addEventListener("click", startLoadTest);
  const stopBtn = document.getElementById("stopLoadTestBtn");
  if (stopBtn) stopBtn.addEventListener("click", stopLoadTest);
  const clearBtn = document.getElementById("clearResultsBtn");
  if (clearBtn) clearBtn.addEventListener("click", clearResults);

  // Metrics refresh
  const metricsBtn = document.getElementById("refreshMetricsBtn");
  if (metricsBtn) metricsBtn.addEventListener("click", fetchMetrics);
}

document.addEventListener("DOMContentLoaded", addEventListeners);

async function testAPI(endpoint, button) {
  const startTime = Date.now();
  const originalText = button.textContent;
  try {
    button.textContent = "Testing...";
    button.disabled = true;
    const response = await fetch(`${SERVER_URL}${endpoint}`);
    const endTime = Date.now();
    const duration = endTime - startTime;
    const result = await response.json();
    addResult({
      endpoint: endpoint,
      status: response.status,
      duration: duration,
      success: response.ok,
      data: result,
    });
    updateStats();
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    addResult({
      endpoint: endpoint,
      status: "ERROR",
      duration: duration,
      success: false,
      error: error.message,
    });
    updateStats();
  } finally {
    button.textContent = originalText;
    button.disabled = false;
  }
}

async function startLoadTest() {
  if (loadTestRunning) {
    alert("Load test is already running!");
    return;
  }
  const endpoint = document.getElementById("endpointSelect").value;
  const concurrentUsers = parseInt(
    document.getElementById("concurrentUsers").value
  );
  const requestsPerUser = parseInt(
    document.getElementById("requestsPerUser").value
  );
  const delay = parseInt(document.getElementById("delayBetweenRequests").value);
  loadTestRunning = true;
  const startBtn = document.getElementById("startLoadTestBtn");
  startBtn.textContent = "🔄 Running...";
  startBtn.disabled = true;
  addResult({
    endpoint: "LOAD TEST",
    status: "STARTED",
    duration: 0,
    success: true,
    data: `Starting load test: ${concurrentUsers} users, ${requestsPerUser} requests each, ${delay}ms delay`,
  });
  const promises = [];
  for (let user = 0; user < concurrentUsers; user++) {
    promises.push(runUserLoadTest(user, endpoint, requestsPerUser, delay));
  }
  try {
    await Promise.all(promises);
    addResult({
      endpoint: "LOAD TEST",
      status: "COMPLETED",
      duration: 0,
      success: true,
      data: `Load test completed: ${
        concurrentUsers * requestsPerUser
      } total requests`,
    });
  } catch (error) {
    addResult({
      endpoint: "LOAD TEST",
      status: "ERROR",
      duration: 0,
      success: false,
      error: error.message,
    });
  }
  loadTestRunning = false;
  startBtn.textContent = "🚀 Start Load Test";
  startBtn.disabled = false;
}

async function runUserLoadTest(userId, endpoint, requestsPerUser, delay) {
  for (let i = 0; i < requestsPerUser; i++) {
    if (!loadTestRunning) break;
    const startTime = Date.now();
    try {
      const response = await fetch(`${SERVER_URL}${endpoint}`);
      const endTime = Date.now();
      const duration = endTime - startTime;
      addResult({
        endpoint: `${endpoint} (User ${userId + 1})`,
        status: response.status,
        duration: duration,
        success: response.ok,
        data: `Request ${i + 1}/${requestsPerUser}`,
      });
      updateStats();
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      addResult({
        endpoint: `${endpoint} (User ${userId + 1})`,
        status: "ERROR",
        duration: duration,
        success: false,
        error: error.message,
      });
      updateStats();
    }
    if (delay > 0 && i < requestsPerUser - 1) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

function stopLoadTest() {
  loadTestRunning = false;
  addResult({
    endpoint: "LOAD TEST",
    status: "STOPPED",
    duration: 0,
    success: true,
    data: "Load test stopped by user",
  });
}

function addResult(result) {
  testResults.push(result);
  totalRequests++;
  if (result.success) successfulRequests++;
  if (result.duration) totalResponseTime += result.duration;
  const resultsDiv = document.getElementById("results");
  const resultItem = document.createElement("div");
  resultItem.className = `result-item ${result.success ? "success" : "error"}`;
  const timestamp = new Date().toLocaleTimeString();
  const statusText = result.success ? "✅ Success" : "❌ Error";
  resultItem.innerHTML = `
        <h4>${result.endpoint} - ${statusText}</h4>
        <p><strong>Time:</strong> ${timestamp} | <strong>Duration:</strong> ${
    result.duration
  }ms | <strong>Status:</strong> ${result.status}</p>
        ${
          result.data
            ? `<p><strong>Data:</strong> ${JSON.stringify(result.data)}</p>`
            : ""
        }
        ${result.error ? `<p><strong>Error:</strong> ${result.error}</p>` : ""}
    `;
  resultsDiv.appendChild(resultItem);
  resultsDiv.scrollTop = resultsDiv.scrollHeight;
}

function updateStats() {
  document.getElementById("totalRequests").textContent = totalRequests;
  document.getElementById("avgResponseTime").textContent =
    totalRequests > 0
      ? Math.round(totalResponseTime / totalRequests) + "ms"
      : "0ms";
  document.getElementById("successRate").textContent =
    totalRequests > 0
      ? Math.round((successfulRequests / totalRequests) * 100) + "%"
      : "0%";
}

function clearResults() {
  testResults = [];
  totalRequests = 0;
  successfulRequests = 0;
  totalResponseTime = 0;
  document.getElementById("results").innerHTML = "";
  updateStats();
}

async function fetchMetrics() {
  try {
    const response = await fetch(`${SERVER_URL}/metrics`);
    const metrics = await response.text();
    document.getElementById("metricsDisplay").textContent = metrics;
  } catch (error) {
    document.getElementById(
      "metricsDisplay"
    ).textContent = `Error fetching metrics: ${error.message}`;
  }
}
