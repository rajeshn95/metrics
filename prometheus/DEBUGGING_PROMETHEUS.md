# Debugging Prometheus Target DOWN Issue

This document explains how to debug and resolve the issue where a Prometheus target (Node.js app) shows as DOWN with a connection refused error. It includes all steps, commands, and reasoning used in the process.

---

## Problem Statement

- **Prometheus dashboard showed:**
  - Target: `nodejs-app (0/1 up)`
  - Endpoint: `http://localhost:3010/metrics`
  - State: `DOWN`
  - Error: `dial tcp [::1]:3010: connect: connection refused`

## Step-by-Step Debugging Process

### 1. Check if the Node.js app is running on port 3010

```sh
lsof -i :3010 | cat
```

- **Result:** No Node.js process was listening on port 3010.

### 2. Test the /metrics endpoint from the host

```sh
curl -v http://localhost:3010/metrics
```

- **Result:** The endpoint was accessible and returned metrics, confirming the app was running (either on host or in Docker).

### 3. Check if the Node.js app is running as a process

```sh
ps aux | grep node
```

- **Result:** No relevant Node.js process running directly on the host (app was running in Docker).

### 4. Check if Docker is listening on port 3010

```sh
lsof -i :3010 | cat
```

- **Result:** Docker was listening on port 3010, indicating the app was running in a container.

### 5. List running Docker containers

```sh
docker ps | cat
```

- **Result:** Found containers for Node.js app, Prometheus, and Grafana.

### 6. Check Node.js app container logs

```sh
docker logs docker-nodejs-app-1 --tail 50 | cat
```

- **Result:** Node.js app was running and exposing metrics at `http://localhost:3010/metrics`.

### 7. Test /metrics endpoint from the host again

```sh
curl -v http://localhost:3010/metrics
```

- **Result:** Still accessible from the host.

### 8. Update Prometheus config to use Docker container name

- **Edit `prometheus/prometheus.yml`:**
  ```yaml
  scrape_configs:
    - job_name: "nodejs-app"
      static_configs:
        - targets: ["nodejs-app:3010"]
  ```
- **Reason:** `localhost` inside the Prometheus container does not refer to the Node.js app container. Use the container name for Docker networking.

### 9. Test connectivity from Prometheus container to Node.js app container

```sh
docker exec docker-prometheus-1 wget --spider http://nodejs-app:3010/metrics
```

- **Result:** `remote file exists` (connectivity confirmed).

### 10. Restart Prometheus container

```sh
docker restart docker-prometheus-1
```

- **Reason:** To reload the configuration and clear any cached state.

### 11. Wait for Prometheus to restart

```sh
sleep 10
```

### 12. Refresh Prometheus dashboard

- The target should now show as UP and healthy.

---

## Key Learnings

- **Do not use `localhost` for inter-container communication in Docker.** Use the container name instead.
- **Use `host.docker.internal` only if the service is running on the host, not in a container.**
- **Always confirm connectivity from inside the Prometheus container.**
- **Restart Prometheus after config changes.**

---

## Summary of Commands Used

```
lsof -i :3010 | cat
curl -v http://localhost:3010/metrics
ps aux | grep node
docker ps | cat
docker logs docker-nodejs-app-1 --tail 50 | cat
docker exec docker-prometheus-1 wget --spider http://nodejs-app:3010/metrics
docker restart docker-prometheus-1
sleep 10
```

---

## Troubleshooting Checklist

- [ ] Is the Node.js app running and exposing `/metrics`?
- [ ] Is the app running in Docker? Use the container name in Prometheus config.
- [ ] Can Prometheus container reach the app container?
- [ ] Did you restart Prometheus after config changes?

---

_Keep this file updated with any new troubleshooting steps or issues encountered!_
