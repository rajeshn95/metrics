# Contributing to Prometheus, Grafana & OpenTelemetry Learning Project

Thank you for your interest in contributing to this learning project! This project is designed to help developers learn modern application monitoring and observability practices. We welcome contributions from the community.

## 🤝 How to Contribute

### Types of Contributions We Welcome

- **Documentation Improvements** - Better explanations, examples, or guides
- **New Learning Content** - Additional tutorials, best practices, or use cases
- **Code Enhancements** - Better metrics, dashboards, or monitoring examples
- **Bug Fixes** - Issues with the monitoring stack or examples
- **Feature Requests** - New monitoring scenarios or tools
- **Translation** - Help make this project accessible to more developers

### Areas for Contribution

#### 📚 Documentation

- Improve existing learning guides
- Add new troubleshooting scenarios
- Create additional PromQL/LogQL examples
- Enhance dashboard explanations

#### 🛠️ Code & Configuration

- Add new API endpoints for testing
- Create additional Grafana dashboards
- Improve Prometheus configuration
- Enhance OpenTelemetry instrumentation

#### 🧪 Testing & Examples

- Add new load testing scenarios
- Create additional monitoring examples
- Improve K6 test scripts
- Add more realistic production scenarios

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- Basic knowledge of Node.js
- Familiarity with monitoring concepts (or willingness to learn)

### Development Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/your-username/metrics.git
   cd metrics
   ```

2. **Start the Stack**

   ```bash
   docker compose up --build
   ```

3. **Access Services**

   - Web Dashboard: http://localhost:3010
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3000 (admin/admin)
   - Loki: http://localhost:3100
   - Jaeger: http://localhost:16686

4. **Test Your Changes**

   ```bash
   # Test the application
   cd server
   npm install
   npm start

   # Run load tests
   node load-test.js normal
   ```

## 📝 Contribution Guidelines

### Code Style

- **JavaScript/Node.js**: Follow standard ES6+ practices
- **Configuration Files**: Use consistent formatting and comments
- **Documentation**: Write clear, educational content
- **Comments**: Explain complex monitoring concepts

### Documentation Standards

- **Learning Focus**: Always explain the "why" behind monitoring decisions
- **Examples**: Include practical, real-world examples
- **Progressive Learning**: Start simple, build complexity gradually
- **Troubleshooting**: Include common issues and solutions

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add new API endpoint for error rate testing
docs: improve PromQL query explanations
fix: resolve Grafana dashboard loading issue
test: add stress testing scenario for memory monitoring
```

### Pull Request Process

1. **Create a Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**

   - Follow the coding standards
   - Test your changes thoroughly
   - Update documentation if needed

3. **Test Your Changes**

   - Ensure the monitoring stack starts correctly
   - Verify metrics are being collected
   - Check that dashboards work properly

4. **Submit a Pull Request**
   - Provide a clear description of your changes
   - Include screenshots for UI changes
   - Reference any related issues

## 🎯 Learning-Focused Contributions

### What Makes a Great Contribution

- **Educational Value**: Helps others learn monitoring concepts
- **Practical Examples**: Real-world scenarios and use cases
- **Clear Explanations**: Step-by-step guidance for beginners
- **Best Practices**: Industry-standard monitoring patterns

### Example Contribution Ideas

#### For Beginners

- Add comments explaining PromQL queries
- Create simple dashboard tutorials
- Document common troubleshooting steps

#### For Intermediate Contributors

- Add new monitoring scenarios
- Create advanced PromQL examples
- Improve OpenTelemetry instrumentation

#### For Advanced Contributors

- Add production-ready configurations
- Create comprehensive monitoring strategies
- Implement advanced alerting rules

## 🐛 Reporting Issues

### Before Reporting

1. Check existing issues for duplicates
2. Try the troubleshooting guides in `docs/`
3. Test with the latest version

### Issue Template

```
**Description**
Brief description of the issue

**Steps to Reproduce**
1. Start the stack: `docker compose up`
2. Access: http://localhost:3010
3. Observe: [describe what happens]

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., macOS, Linux, Windows]
- Docker version: [e.g., 20.10.0]
- Node.js version: [if applicable]

**Additional Context**
Screenshots, logs, or other relevant information
```

## 📚 Learning Resources

### Before Contributing

- Read the learning guides in `docs/`
- Understand basic Prometheus concepts
- Familiarize yourself with Grafana dashboards
- Learn about OpenTelemetry basics

### Useful References

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/latest/)

## 🏷️ Labels

We use labels to categorize issues and pull requests:

- `good first issue` - Great for new contributors
- `documentation` - Documentation improvements
- `enhancement` - New features or improvements
- `bug` - Something isn't working
- `help wanted` - Extra attention needed
- `learning` - Educational content or examples

## 🤝 Community Guidelines

### Be Respectful

- Treat all contributors with respect
- Provide constructive feedback
- Help others learn and grow

### Be Patient

- Learning monitoring takes time
- Everyone starts somewhere
- Ask questions when you need help

### Be Helpful

- Share your knowledge
- Help others understand concepts
- Contribute to the learning community

## 📞 Getting Help

- **Issues**: Use GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Documentation**: Check the guides in `docs/` first

## 🎉 Recognition

Contributors will be recognized in:

- The project README
- Release notes
- Community shoutouts

---

**Thank you for contributing to the monitoring and observability learning community!** 🎉📊

Your contributions help make monitoring and observability more accessible to developers worldwide.
