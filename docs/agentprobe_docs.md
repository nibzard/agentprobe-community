Project Path: docs

Source Tree:

```txt
docs
├── CLI_REFERENCE.md
├── DEVELOPMENT.md
├── GETTING_STARTED.md
├── RESULTS_SHARING.md
├── SCENARIOS.md
└── TROUBLESHOOTING.md

```

`docs/CLI_REFERENCE.md`:

```md
# CLI Reference

Complete reference for all AgentProbe commands and options.

## Global Usage

```bash
agentprobe [COMMAND] [OPTIONS] [ARGUMENTS]
```

**Global Options:**
- `--version` - Show version and exit
- `--help` - Show help message

## Commands Overview

| Command | Purpose | Example |
|---------|---------|---------|
| `test` | Run single scenario | `agentprobe test git --scenario status` |
| `benchmark` | Run multiple scenarios | `agentprobe benchmark git` |
| `report` | Generate result reports | `agentprobe report --format json` |
| `community` | View community data | `agentprobe community stats git` |
| `config` | Manage configuration | `agentprobe config get` |

---

## test

Run a single test scenario against a CLI tool.

### Usage

```bash
agentprobe test TOOL --scenario SCENARIO [OPTIONS]
```

### Arguments

- `TOOL` **(required)** - CLI tool to test (e.g., git, docker, vercel)

### Options

- `--scenario`, `-s` **(required)** - Scenario name to run
- `--work-dir`, `-w` - Working directory for the test
- `--max-turns` - Maximum agent interactions (default: 50)
- `--runs` - Number of times to run scenario (default: 1)
- `--verbose`, `-v` - Show detailed trace of AI conversation
- `--oauth-token-file` - Path to file containing Claude Code OAuth token

### Examples

```bash
# Basic test
agentprobe test git --scenario status

# Test with verbose output
agentprobe test git --scenario status --verbose

# Test in specific directory
agentprobe test git --scenario status --work-dir /path/to/project

# Run scenario multiple times
agentprobe test vercel --scenario deploy --runs 3

# Use custom OAuth token
agentprobe test git --scenario status --oauth-token-file ~/.agentprobe-token
```

### Output

```
╭─────────────────────────── AgentProbe Results ───────────────────────────╮
│ Tool: git | Scenario: status                                             │
│ AX Score: A (2 turns, 60% success rate)                                  │
│                                                                          │
│ Agent Experience Summary:                                                │
│ The agent completed the task perfectly in a single turn...              │
│                                                                          │
│ Duration: 8.2s | Cost: $0.071                                           │
│                                                                          │
│ Use --verbose for full trace analysis                                   │
╰──────────────────────────────────────────────────────────────────────────╯
```

### AX Scores

- **A** - Excellent (90-100% success rate)
- **B** - Good (80-89% success rate)
- **C** - Average (70-79% success rate)
- **D** - Below Average (60-69% success rate)
- **F** - Failed (0-59% success rate)

---

## benchmark

Run multiple test scenarios, optionally across all tools.

### Usage

```bash
# Benchmark specific tool
agentprobe benchmark TOOL [OPTIONS]

# Benchmark all tools
agentprobe benchmark --all [OPTIONS]
```

### Arguments

- `TOOL` - Tool to benchmark (optional if using --all)

### Options

- `--all` - Run benchmarks for all available tools
- `--oauth-token-file` - Path to file containing Claude Code OAuth token

### Examples

```bash
# Benchmark all git scenarios
agentprobe benchmark git

# Benchmark all tools (long-running!)
agentprobe benchmark --all

# Benchmark with custom token
agentprobe benchmark vercel --oauth-token-file ~/.agentprobe-token
```

### Output

Shows aggregate results across all scenarios:

```
╭─── Benchmark Results: git ───╮
│ Scenarios tested: 3          │
│ Overall AX Score: B          │
│ Average duration: 12.4s      │
│ Total cost: $0.21            │
│                              │
│ Individual results:          │
│ • status: A (8.2s)          │
│ • show-log: B (15.1s)       │
│ • commit-changes: C (14.9s)  │
╰──────────────────────────────╯
```

---

## report

Generate reports from test results in various formats.

### Usage

```bash
agentprobe report [OPTIONS]
```

### Options

- `--format`, `-f` - Output format: `text`, `json`, `markdown` (default: text)
- `--output`, `-o` - Output file path (default: stdout)

### Examples

```bash
# Generate text report
agentprobe report

# Generate JSON report
agentprobe report --format json

# Save markdown report to file
agentprobe report --format markdown --output results.md

# Save JSON report to file
agentprobe report --format json --output results.json
```

### Output Formats

**Text** (default):
```
AgentProbe Test Results
=======================
Tool: git, Scenario: status
Score: A, Duration: 8.2s, Cost: $0.071
...
```

**JSON**:
```json
{
  "results": [
    {
      "tool": "git",
      "scenario": "status",
      "score": "A",
      "duration": 8.2,
      "cost": 0.071
    }
  ]
}
```

**Markdown**:
```markdown
# AgentProbe Test Results

## git/status
- **Score**: A
- **Duration**: 8.2s
- **Cost**: $0.071
```

---

## community

View and manage community results and statistics.

### Subcommands

- `stats` - View community statistics
- `show` - Show recent community results

### community stats

View community statistics for tools.

#### Usage

```bash
# All tools leaderboard
agentprobe community stats

# Specific tool stats
agentprobe community stats TOOL
```

#### Examples

```bash
# View overall leaderboard
agentprobe community stats

# View git-specific stats
agentprobe community stats git

# View vercel-specific stats
agentprobe community stats vercel
```

#### Output

```
🏆 Community Tool Leaderboard
┌─────────┬───────────────┬──────────────┬────────────┐
│ Tool    │ Success Rate  │ Avg Duration │ Total Runs │
├─────────┼───────────────┼──────────────┼────────────┤
│ git     │ 94%          │ 8.2s         │ 1,247      │
│ docker  │ 87%          │ 15.4s        │ 832        │
│ vercel  │ 79%          │ 45.7s        │ 1,891      │
└─────────┴───────────────┴──────────────┴────────────┘
```

### community show

Show recent community results for a specific scenario.

#### Usage

```bash
agentprobe community show TOOL SCENARIO [OPTIONS]
```

#### Arguments

- `TOOL` **(required)** - Tool name
- `SCENARIO` **(required)** - Scenario name

#### Options

- `--last` - Number of recent results to show (default: 10)

#### Examples

```bash
# Show recent git status results
agentprobe community show git status

# Show last 20 vercel deploy results
agentprobe community show vercel deploy --last 20
```

#### Output

```
📊 Recent community results for git/status (last 10)
┌────────────┬───────┬──────────┬─────────┐
│ Timestamp  │ Score │ Duration │ Turns   │
├────────────┼───────┼──────────┼─────────┤
│ 2024-01-20 │ A     │ 7.8s     │ 2       │
│ 2024-01-20 │ A     │ 8.1s     │ 2       │
│ 2024-01-19 │ B     │ 12.4s    │ 3       │
└────────────┴───────┴──────────┴─────────┘
```

---

## config

Manage AgentProbe configuration settings.

### Subcommands

- `set` - Set configuration values
- `get` - Get configuration values

### config set

Set a configuration value.

#### Usage

```bash
agentprobe config set KEY VALUE
```

#### Arguments

- `KEY` **(required)** - Configuration key
- `VALUE` **(required)** - Configuration value

#### Configuration Keys

| Key | Purpose | Values |
|-----|---------|--------|
| `sharing.opted_out` | Control community sharing | `true`, `false` |
| `sharing.api_key` | Custom API key | Any valid API key |
| `sharing.api_url` | Custom API URL | Any valid URL |

#### Examples

```bash
# Opt out of community sharing
agentprobe config set sharing.opted_out true

# Set custom API key
agentprobe config set sharing.api_key "your-api-key"

# Set custom API URL (for private deployments)
agentprobe config set sharing.api_url "https://your-api.example.com/v1"

# Re-enable sharing
agentprobe config set sharing.opted_out false
```

### config get

Get configuration values.

#### Usage

```bash
# Get all configuration
agentprobe config get

# Get specific key
agentprobe config get KEY
```

#### Examples

```bash
# Show all configuration
agentprobe config get

# Get sharing status
agentprobe config get sharing.opted_out

# Get API URL
agentprobe config get sharing.api_url
```

#### Output

```
Current configuration:
  sharing.enabled: True (enabled)
  sharing.opted_out: False
  sharing.consent_given: True
  sharing.api_url:
  sharing.api_key: embedded key
  sharing.anonymous_id: 950c455afa7532a5
```

---

## Exit Codes

AgentProbe uses standard exit codes:

- `0` - Success
- `1` - General error
- `2` - Misuse of shell builtins
- `3` - Configuration error
- `4` - Authentication error

---

## Environment Variables

AgentProbe respects these environment variables:

- `CLAUDE_CODE_OAUTH_TOKEN` - Claude Code OAuth token (recommended)
- `ANTHROPIC_API_KEY` - Anthropic API key (fallback)

---

## Available Tools

Current tools with scenarios:

- **git** - Git version control (status, show-log, commit-changes)
- **docker** - Docker containers (run-nginx)
- **gh** - GitHub CLI (create-pr)
- **vercel** - Vercel deployments (deploy, init-project, build-local, etc.)
- **netlify** - Netlify deployments (full-lifecycle, function-lifecycle, etc.)
- **wrangler** - Cloudflare Workers (deploy, dev, init, etc.)

See [Scenarios Guide](SCENARIOS.md) for complete list and details.

---

## Tips

- **Start simple**: Use `test git --scenario status` to verify setup
- **Use verbose**: Add `-v` to see the full AI conversation
- **Multiple runs**: Use `--runs N` to test consistency
- **Benchmarks**: Use `benchmark` to test multiple scenarios at once
- **Community data**: Your results help improve CLI tools for everyone
```

`docs/DEVELOPMENT.md`:

```md
# Development Guide

How to contribute to AgentProbe, set up development environment, and add new features.

## Quick Start for Contributors

### 1. Get the Code
```bash
# Clone the repository
git clone https://github.com/nibzard/agentprobe.git
cd agentprobe

# Set up development environment
uv sync
```

### 2. Test Your Setup
```bash
# Run AgentProbe from source
uv run agentprobe test git --scenario status

# This should work and show "Development mode: True" internally
```

### 3. Make Your First Contribution
- **Add a scenario**: Easiest way to contribute (see [Scenarios Guide](SCENARIOS.md))
- **Fix documentation**: Improve these docs or add examples
- **Report bugs**: Create issues with detailed reproduction steps

## Development Environment

### Prerequisites
- **Python 3.8+** - Check with `python --version`
- **uv** - Install from [docs.astral.sh/uv](https://docs.astral.sh/uv/)
- **Git** - For version control

### Setup
```bash
# Clone and enter directory
git clone https://github.com/nibzard/agentprobe.git
cd agentprobe

# Install dependencies with development extras
uv sync --extra dev

# Verify setup
uv run agentprobe --version
uv run agentprobe test git --scenario status
```

### Project Structure
```
agentprobe/
├── src/agentprobe/           # Main source code
│   ├── scenarios/            # All test scenarios
│   ├── cli.py               # Command-line interface
│   ├── runner.py            # Scenario execution
│   ├── analyzer.py          # Result analysis
│   └── reporter.py          # Output formatting
├── docs/                    # Documentation
├── tests/                   # Test suite
└── CLAUDE.md               # Detailed dev instructions
```

## Contributing Scenarios

**Easiest way to contribute!** Scenarios are simple text files that describe tasks for AI agents.

### Adding New Scenarios

1. **Choose existing tool** or create new tool directory:
   ```bash
   # For existing tool
   ls src/agentprobe/scenarios/git/

   # For new tool
   mkdir src/agentprobe/scenarios/newtool/
   ```

2. **Create scenario file**:
   ```bash
   # Use descriptive name with hyphens
   touch src/agentprobe/scenarios/git/merge-conflict.txt
   ```

3. **Write clear instructions**:
   ```
   Create two branches that modify the same file in different ways.
   Merge them to create a conflict, then resolve the conflict manually.
   Verify the merge was successful and the file contains both changes.
   ```

4. **Test your scenario**:
   ```bash
   # Test multiple times to ensure consistency
   uv run agentprobe test git --scenario merge-conflict --runs 3

   # Use verbose to see AI interpretation
   uv run agentprobe test git --scenario merge-conflict --verbose
   ```

5. **Submit for review**:
   ```bash
   git add src/agentprobe/scenarios/git/merge-conflict.txt
   git commit -m "feat: add git merge-conflict scenario"
   git push origin feature/merge-conflict-scenario
   ```

### Scenario Writing Guidelines

**✅ Good Scenarios**:
- Clear, specific instructions
- Include context and setup
- Define success criteria
- Work across different environments

**❌ Avoid**:
- Vague instructions ("do something with git")
- Hardcoded values that might not exist
- Assumptions about system state
- Multiple tools in one scenario

See [Scenarios Guide](SCENARIOS.md) for detailed examples.

## Code Contributions

### Development Workflow

1. **Create feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and test**:
   ```bash
   # Run tests (when implemented)
   uv run pytest

   # Test your changes
   uv run agentprobe test git --scenario status

   # Format code
   uv run black src/
   uv run ruff check src/
   ```

3. **Commit and push**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/your-feature-name
   ```

4. **Create pull request**:
   - Clear description of changes
   - Include test results
   - Reference any related issues

### Areas for Contribution

#### 🎯 High Impact, Easy
- **New scenarios**: Add test cases for existing tools
- **Documentation**: Improve examples, fix typos
- **Error messages**: Make them more helpful
- **Output formatting**: Improve result display

#### 🚀 Medium Impact, Medium Difficulty
- **New tool support**: Add entire new CLI tools
- **Analysis improvements**: Better success/failure detection
- **Performance**: Faster execution, better caching
- **Reporting**: JSON/markdown output formats

#### 🔬 High Impact, Hard
- **Architecture**: Core improvements to runner/analyzer
- **Community features**: Enhanced statistics and comparisons
- **AI optimization**: Better prompts, fewer API calls
- **Testing framework**: Comprehensive test suite

### Code Style

AgentProbe follows standard Python conventions:

```bash
# Format code
uv run black src/

# Check linting
uv run ruff check src/

# Type checking (if implemented)
uv run mypy src/
```

**Key principles**:
- Simple, readable code
- Clear variable names
- Comprehensive error handling
- Minimal dependencies

## Testing

### Manual Testing
```bash
# Test basic functionality
uv run agentprobe test git --scenario status

# Test different tools
uv run agentprobe test docker --scenario run-nginx
uv run agentprobe test vercel --scenario deploy

# Test benchmarks
uv run agentprobe benchmark git

# Test community features
uv run agentprobe community stats
```

### Automated Testing
```bash
# Run test suite (when implemented)
uv run pytest

# Test specific module
uv run pytest tests/test_scenarios.py

# With coverage
uv run pytest --cov=agentprobe
```

### Integration Testing
```bash
# Test with different Python versions
uv run --python 3.8 agentprobe test git --scenario status
uv run --python 3.11 agentprobe test git --scenario status

# Test installation from package
pip install -e .
agentprobe test git --scenario status
```

## Local Development with Community Backend

If you're working on community features, you'll need the local backend:

### 1. Set Up Local API Server
See [Results Sharing Guide](RESULTS_SHARING.md#local-development-setup) for detailed instructions.

### 2. Configure AgentProbe
```bash
# AgentProbe automatically detects development mode
# Just set up a valid local API key
uv run agentprobe config set sharing.api_key "your-local-dev-key"
```

### 3. Test Community Features
```bash
# Test result sharing
uv run agentprobe test git --scenario status

# Test community commands
uv run agentprobe community stats
```

## Debugging

### Debug Mode
```bash
# Verbose output shows AI conversation
uv run agentprobe test git --scenario status --verbose

# Multiple runs help identify consistency issues
uv run agentprobe test git --scenario status --runs 5
```

### Common Development Issues

**"Development mode not detected"**:
- Ensure you're in the cloned repository
- Use `uv run agentprobe` (not global install)
- Check `.git` directory exists

**"Scenarios not found"**:
- Verify you're running from project root
- Check scenario files exist in `src/agentprobe/scenarios/`

**"Import errors"**:
- Run `uv sync` to ensure dependencies are installed
- Check you're using the right Python environment

### Profiling and Performance

```bash
# Time execution
time uv run agentprobe test git --scenario status

# Profile Python execution (if needed)
python -m cProfile -o profile.out -m agentprobe.cli test git --scenario status
```

## Release Process

For maintainers publishing new versions:

### 1. Prepare Release
```bash
# Update version in pyproject.toml
# Update CHANGELOG (if exists)
# Run final tests
uv run agentprobe benchmark --all
```

### 2. Build and Test
```bash
# Build package
uv build

# Test on TestPyPI first
uv publish --publish-url https://test.pypi.org/legacy/ --token $TESTPYPI_TOKEN

# Test installation
uvx --index-url https://test.pypi.org/simple/ --extra-index-url https://pypi.org/simple/ agentprobe test git --scenario status
```

### 3. Publish to PyPI
```bash
# Only if TestPyPI worked perfectly
uv publish --token $PYPI_TOKEN
```

See [PUBLISHING.md](../PUBLISHING.md) for detailed instructions.

## Contributing Guidelines

### Pull Request Process

1. **Fork repository** and create feature branch
2. **Write clear commit messages**: Use conventional commits
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `test:` for test additions
3. **Test thoroughly**: Multiple scenarios, different environments
4. **Update documentation**: If adding features or changing behavior
5. **Request review**: Tag relevant maintainers

### Issue Reporting

When reporting bugs or requesting features:

**Include**:
- AgentProbe version (`agentprobe --version`)
- Python version (`python --version`)
- Operating system
- Full error message
- Steps to reproduce
- Expected vs actual behavior

**Example**:
```
**Bug**: agentprobe test fails with authentication error

**Environment**:
- AgentProbe: 0.2.1
- Python: 3.11.0
- OS: macOS 14.0

**Steps**:
1. Run `agentprobe test git --scenario status`
2. See error: "Authentication failed"

**Expected**: Test should run successfully
**Actual**: Authentication error despite valid token

**Logs**:
```
[error logs here]
```
```

### Code of Conduct

- **Be respectful**: Treat all contributors with respect
- **Be inclusive**: Welcome contributors of all backgrounds
- **Be helpful**: Provide constructive feedback
- **Be patient**: Not everyone has the same experience level

## Community

### Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Documentation**: Start with [Getting Started](GETTING_STARTED.md)

### Staying Updated

- **Watch repository**: Get notifications for releases
- **Follow releases**: Subscribe to new version announcements
- **Join discussions**: Participate in feature planning

---

**Ready to contribute?** Start with adding a simple scenario for your favorite CLI tool. Every contribution, no matter how small, helps make CLI tools more accessible to AI agents! 🚀

**Technical details**: See [CLAUDE.md](../CLAUDE.md) for detailed architecture and implementation information.
```

`docs/GETTING_STARTED.md`:

```md
# Getting Started with AgentProbe

Get up and running with AgentProbe in under 2 minutes.

## Quick Install

**Recommended**: Use `uvx` for instant access without installation:

```bash
uvx agentprobe test git --scenario status
```

**Alternative methods**:

```bash
# Install globally with pip
pip install agentprobe
agentprobe test git --scenario status

# Install with uv (for development)
uv pip install agentprobe
agentprobe test git --scenario status
```

## Your First Test

Run your first test to see how AI agents handle basic git operations:

```bash
uvx agentprobe test git --scenario status
```

**What happens:**
1. AgentProbe loads the git status scenario
2. Claude analyzes your repository using git commands
3. You get results showing how well the AI performed

## Understanding Your Results

```
╭─────────────────────────── AgentProbe Results ───────────────────────────╮
│ Tool: git | Scenario: status                                             │
│ AX Score: A (2 turns, 60% success rate)                                  │
│                                                                          │
│ Agent Experience Summary:                                                │
│ The agent completed the task perfectly in a single turn using git       │
│ status, which provided all required information clearly.                 │
│                                                                          │
│ Duration: 8.2s | Cost: $0.071                                           │
│                                                                          │
│ Use --verbose for full trace analysis                                   │
╰──────────────────────────────────────────────────────────────────────────╯
```

**Key metrics:**
- **AX Score**: A-F grade (A = excellent, F = failed)
- **Turns**: How many back-and-forth interactions needed
- **Duration**: How long the task took
- **Cost**: API cost for the Claude calls

## Community Comparison

After your test, see how you compare to the community:

```
🌍 Community Comparison for git/status:
✅ Success (matches community average)
⏱️  Duration: 8.2s vs 7.8s avg (average speed)
📊 Based on 13 community runs
```

## Try More Scenarios

**Easy scenarios** (great for learning):
```bash
# Git operations
uvx agentprobe test git --scenario show-log

# Docker basics
uvx agentprobe test docker --scenario run-nginx

# GitHub operations
uvx agentprobe test gh --scenario create-pr
```

**Advanced scenarios** (test complex workflows):
```bash
# Vercel deployment
uvx agentprobe test vercel --scenario deploy

# Netlify full lifecycle
uvx agentprobe test netlify --scenario full-lifecycle

# Cloudflare Workers
uvx agentprobe test wrangler --scenario deploy
```

## Running Multiple Tests

Test multiple scenarios at once:

```bash
# Benchmark all git scenarios
uvx agentprobe benchmark git

# Benchmark everything (warning: takes time!)
uvx agentprobe benchmark --all
```

## Authentication Setup

AgentProbe needs Claude API access. Set up authentication:

```bash
# Method 1: OAuth token (recommended)
export CLAUDE_CODE_OAUTH_TOKEN="your-token-here"

# Method 2: API key (fallback)
export ANTHROPIC_API_KEY="your-api-key-here"
```

**Get your tokens:**
- OAuth token: [Claude Console](https://console.anthropic.com)
- API key: [Anthropic API](https://console.anthropic.com/api-keys)

## First Run Consent

On first use, AgentProbe asks for consent to share anonymous results:

```
🤖 Welcome to AgentProbe!

AgentProbe collects anonymous usage data to improve CLI tools for AI agents.

✓ Data is anonymized and sanitized
✓ No personal information is collected
✓ You can opt out anytime

Share anonymous data to help improve CLI tools? [Y/n]:
```

**Safe to say yes** - helps improve CLI tools for everyone.

## What's Next?

1. **Explore available scenarios**: See [Scenarios Guide](SCENARIOS.md)
2. **Learn all commands**: Check [CLI Reference](CLI_REFERENCE.md)
3. **Having issues?**: Visit [Troubleshooting](TROUBLESHOOTING.md)
4. **Want to contribute?**: Read [Development Guide](DEVELOPMENT.md)

## Quick Tips

- **Start simple**: Use `git --scenario status` to verify everything works
- **Use verbose**: Add `--verbose` to see full AI conversation
- **Check community**: Your results help identify tool usability issues
- **Try benchmarks**: Use `benchmark` command to test multiple scenarios

## Need Help?

```bash
# Get help for any command
uvx agentprobe --help
uvx agentprobe test --help
uvx agentprobe benchmark --help

# Check your configuration
uvx agentprobe config get
```

---

**Ready to test how AI agents interact with your favorite CLI tools?** Start with `uvx agentprobe test git --scenario status` and explore from there! 🚀
```

`docs/RESULTS_SHARING.md`:

```md
# AgentProbe Community Platform

AgentProbe is a community-first platform that automatically collects anonymous usage data to improve CLI tools for AI agents. This document describes how the community sharing system works.

## Overview

The community platform enables:
- 📊 Automatic anonymous submission of test results
- 🌍 Real-time community statistics and comparisons
- 📈 Success rate tracking across tools and scenarios
- 🔍 Common friction point identification
- 🏆 Tool performance leaderboards
- 🤝 Collective insights to improve CLI usability

## How It Works

### Automatic Community Sharing

AgentProbe automatically shares results with the community:

```bash
# All tests automatically contribute to community data
agentprobe test vercel --scenario deploy

# Benchmarks automatically share all results
agentprobe benchmark --all

# View community statistics
agentprobe community stats vercel
```

### First-Run Consent

On your first use, AgentProbe will show a consent dialog:

```
🤖 Welcome to AgentProbe!

AgentProbe collects anonymous usage data to improve CLI tools for AI agents.
This helps identify common friction points and success patterns.

✓ Data is anonymized and sanitized
✓ No personal information is collected
✓ You can opt out anytime

Share anonymous data to help improve CLI tools? [Y/n]:
```

### Community Comparison

After each test, see how your results compare:

```
🌍 Community Comparison for git/status:
✅ Success (matches community average)
⏱️  Duration: 8.7s vs 7.4s avg (average speed)
📊 Based on 15 community runs
```

### Community Commands

Explore community data:

```bash
# View leaderboard of all tools
agentprobe community stats

# View stats for a specific tool
agentprobe community stats git

# View recent results for a scenario
agentprobe community show git status --last 10
```

## Privacy & Security

### Data Sanitization

All submitted data is automatically sanitized to remove:
- 🔑 API keys, tokens, and secrets
- 📧 Email addresses
- 🌐 IP addresses
- 📁 Personal file paths
- 🔐 Authentication headers

### Anonymous Submission

- Each client generates a stable anonymous ID
- No personally identifiable information is collected
- Results are aggregated for privacy protection

### Opt-In by Default with Easy Opt-Out

- **Community sharing is enabled by default** after consent
- Clear consent dialog on first use explains data collection
- **Easy opt-out** anytime with full control over your data
- No API keys or account setup required

## Data Model

### Submitted Data Structure

```json
{
  "run_id": "uuid",
  "timestamp": "2024-01-20T10:30:00Z",
  "tool": "vercel",
  "scenario": "deploy",
  "client_info": {
    "agentprobe_version": "0.1.0",
    "os": "linux",
    "python_version": "3.11.0"
  },
  "execution": {
    "duration": 45.2,
    "total_turns": 8,
    "success": true
  },
  "analysis": {
    "friction_points": ["authentication", "unclear_error"],
    "help_usage_count": 2,
    "recommendations": ["Better error messages needed"]
  }
}
```

## Configuration

### Opt-Out of Sharing

You can opt out of community sharing at any time:

```bash
# Opt out of community data sharing
agentprobe config set sharing.opted_out true

# View current sharing status
agentprobe config get

# Re-enable sharing
agentprobe config set sharing.opted_out false
```

### Advanced Configuration

For advanced users, additional configuration options are available:

```bash
# Override API URL (for testing or private deployments)
agentprobe config set sharing.api_url "https://your-api.example.com/v1"

# Override embedded API key (not recommended)
agentprobe config set sharing.api_key "your-custom-key"
```

### Local Development Setup

If you're running the agentprobe-community backend locally for development:

#### 1. Start Local Backend

```bash
# In your agentprobe-community repository
cd packages/api
pnpm run dev  # Starts server at http://localhost:8787
```

#### 2. Configure AgentProbe for Local Development

AgentProbe automatically detects when running from source and uses `localhost:8787`:

```bash
# From agentprobe source directory (development mode)
uv run agentprobe test git --scenario status
# → Automatically uses http://localhost:8787/api/v1

# From installed package (production mode)
uvx agentprobe test git --scenario status
# → Uses production API: https://agentprobe-community-production.nikola-balic.workers.dev/api/v1
```

#### 3. Set Up Local API Key

Your local development server requires a valid API key. Check your agentprobe-community configuration for:

1. **Database seed files** - Look for pre-configured development API keys
2. **Environment variables** - Check `.env` files for `API_KEY` settings
3. **Admin endpoints** - Use API key management endpoints if available

```bash
# Configure local development API key
agentprobe config set sharing.api_key "your-local-dev-api-key"

# Verify configuration
agentprobe config get
```

#### 4. Authentication Headers

Both local and production servers use the same authentication format:

```bash
# All requests use X-API-Key header (not Authorization: Bearer)
curl -X POST http://localhost:8787/api/v1/results \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

#### 5. Development vs Production Behavior

| Environment | API URL | API Key | Detection |
|-------------|---------|---------|-----------|
| **Development** (`uv run agentprobe`) | `http://localhost:8787/api/v1` | Custom local key | Source directory + `.git` |
| **Production** (`uvx agentprobe`) | `https://agentprobe-community-production.nikola-balic.workers.dev/api/v1` | Embedded community key | Installed package |

#### Troubleshooting Local Development

```bash
# Check if local server is running
curl http://localhost:8787/health

# Test API key validity
curl -H "X-API-Key: your-key" http://localhost:8787/api/v1/results

# Reset to production (clear local overrides)
agentprobe config set sharing.api_key ""
agentprobe config set sharing.api_url ""
```

## Community API

The AgentProbe community runs on a secure, scalable API:

- **Production**: `https://agentprobe-community-production.nikola-balic.workers.dev`
- **Authentication**: Release-specific embedded keys (no user setup required)
- **Rate Limiting**: By anonymous user ID to prevent abuse
- **Data Retention**: Aggregated statistics with privacy protection

### Available Endpoints

- `GET /api/v1/leaderboard` - Tool performance rankings
- `GET /api/v1/stats/tool/{tool}` - Tool-specific statistics
- `GET /api/v1/stats/scenario/{tool}/{scenario}` - Scenario statistics
- `POST /api/v1/results` - Submit test results (automatic)

## Benefits for the Community

By participating, you help:

- **🔍 Identify Pain Points**: Find common CLI usability issues
- **📊 Track Improvements**: See how tool updates affect AI agent success
- **🏆 Compare Tools**: Understand which tools work best for agents
- **🤝 Share Knowledge**: Help other developers choose the right tools
- **🚀 Drive Progress**: Influence CLI tool development with real usage data

## Getting Started

1. **Install AgentProbe**: `uvx agentprobe` or `pip install agentprobe`
2. **Run your first test**: `agentprobe test git --scenario status`
3. **Give consent** when prompted on first run
4. **See community comparison** after your test completes
5. **Explore community data**: `agentprobe community stats`

## Troubleshooting

### Sharing Not Working

```bash
# Check your configuration
agentprobe config get

# Verify you haven't opted out
agentprobe config set sharing.opted_out false

# Test connectivity
agentprobe community stats
```

### Reset Configuration

```bash
# Remove all sharing configuration
rm ~/.agentprobe/sharing.json

# Next run will show consent dialog again
agentprobe test git --scenario status
```

## Contributing

Help improve the AgentProbe community platform:

- **Submit Issues**: Report bugs or request features
- **Share Feedback**: Tell us about your experience
- **Contribute Code**: Improve the CLI or community features
- **Spread the Word**: Help grow the community

**Privacy First**: All contributions must maintain user privacy and data protection standards.
```

`docs/SCENARIOS.md`:

```md
# Scenarios Guide

Everything you need to know about AgentProbe scenarios - what they are, how to use them, and how to create your own.

## What Are Scenarios?

Scenarios are **simple text prompts** that describe tasks for AI agents to perform using CLI tools. They're stored as plain `.txt` files with no special formatting - just the instructions.

**Example scenario** (`git/status.txt`):
```
Check the current status of the git repository and report:
1. The current branch name
2. Whether there are any uncommitted changes
3. Whether the branch is up to date with the remote

Use the git status command and provide a clear summary of the repository state.
```

## Scenario Types

### Simple Scenarios
Single-step tasks that test basic tool usage:

- **git/status** - Check repository status
- **docker/run-nginx** - Run nginx container
- **vercel/deploy** - Deploy application

### Complex Scenarios
Multi-step workflows that test advanced usage:

- **netlify/full-lifecycle** - Create site, deploy, cleanup
- **vercel/domain-setup** - Configure custom domain
- **wrangler/kv-setup** - Set up key-value storage

## Available Scenarios

### Git (git/)
| Scenario | Description | Difficulty |
|----------|-------------|------------|
| `status` | Check repository status | ⭐ Easy |
| `show-log` | Display commit history | ⭐ Easy |
| `commit-changes` | Stage and commit files | ⭐⭐ Medium |

### Docker (docker/)
| Scenario | Description | Difficulty |
|----------|-------------|------------|
| `run-nginx` | Run nginx web server | ⭐ Easy |

### GitHub CLI (gh/)
| Scenario | Description | Difficulty |
|----------|-------------|------------|
| `create-pr` | Create pull request | ⭐⭐ Medium |

### Vercel (vercel/)
| Scenario | Description | Difficulty |
|----------|-------------|------------|
| `deploy` | Deploy to production | ⭐⭐ Medium |
| `init-project` | Initialize new project | ⭐ Easy |
| `build-local` | Build project locally | ⭐ Easy |
| `list-deployments` | List recent deployments | ⭐ Easy |
| `preview-deploy` | Deploy to preview | ⭐⭐ Medium |
| `rollback` | Rollback deployment | ⭐⭐⭐ Hard |
| `domain-setup` | Configure custom domain | ⭐⭐⭐ Hard |
| `env-setup` | Manage environment variables | ⭐⭐ Medium |

### Netlify (netlify/)
| Scenario | Description | Difficulty |
|----------|-------------|------------|
| `full-lifecycle` | Complete site lifecycle | ⭐⭐⭐ Hard |
| `function-lifecycle` | Deploy serverless functions | ⭐⭐⭐ Hard |
| `draft-and-promote` | Draft deploy workflow | ⭐⭐ Medium |
| `advanced-env-management` | Environment variable management | ⭐⭐ Medium |
| `monorepo-deploy` | Deploy from monorepo | ⭐⭐⭐ Hard |

### Cloudflare Workers (wrangler/)
| Scenario | Description | Difficulty |
|----------|-------------|------------|
| `init` | Initialize new Worker | ⭐ Easy |
| `dev` | Start local development | ⭐ Easy |
| `deploy` | Deploy to production | ⭐⭐ Medium |
| `kv-setup` | Set up KV storage | ⭐⭐ Medium |
| `pages-deploy` | Deploy Pages site | ⭐⭐ Medium |
| `secret-manage` | Manage secrets | ⭐⭐ Medium |
| `tail-logs` | View live logs | ⭐ Easy |

## Running Scenarios

### Single Scenario
```bash
# Run specific scenario
agentprobe test git --scenario status

# Run with verbose output to see AI conversation
agentprobe test git --scenario status --verbose

# Run multiple times to test consistency
agentprobe test vercel --scenario deploy --runs 3
```

### Multiple Scenarios
```bash
# Run all scenarios for a tool
agentprobe benchmark git

# Run all scenarios for all tools (long!)
agentprobe benchmark --all
```

## Scenario Structure

### File Organization
```
src/agentprobe/scenarios/
├── git/
│   ├── status.txt
│   ├── show-log.txt
│   └── commit-changes.txt
├── vercel/
│   ├── deploy.txt
│   ├── init-project.txt
│   └── ...
└── docker/
    └── run-nginx.txt
```

### Naming Convention
- **Directory**: Tool name (e.g., `git`, `vercel`, `docker`)
- **File**: Scenario name with `.txt` extension (e.g., `status.txt`, `deploy.txt`)
- **Use hyphens**: For multi-word scenarios (e.g., `commit-changes.txt`)

## Creating Custom Scenarios

### 1. Choose Your Tool
First, decide which CLI tool you want to test:

```bash
# Check if tool directory exists
ls src/agentprobe/scenarios/
```

### 2. Create Scenario File
Create a new `.txt` file in the appropriate tool directory:

```bash
# Example: Create new git scenario
touch src/agentprobe/scenarios/git/my-scenario.txt
```

### 3. Write the Prompt
Write clear, specific instructions in plain English:

**Good scenario**:
```
Create a new branch called 'feature/user-auth' from the current branch.
Switch to this new branch and verify you're on it.
Make sure the branch is ready for development work.
```

**Bad scenario**:
```
Do something with git branches.
```

### 4. Test Your Scenario
```bash
# Test your new scenario
agentprobe test git --scenario my-scenario

# Use verbose to see how AI interprets it
agentprobe test git --scenario my-scenario --verbose
```

## Writing Good Scenarios

### ✅ Best Practices

**Be Specific**: Include exact requirements
```
✅ "Deploy to production and return the deployment URL"
❌ "Deploy the app"
```

**Include Context**: Explain the situation
```
✅ "You have a Next.js app in the current directory. Deploy it to Vercel..."
❌ "Deploy this to Vercel"
```

**Define Success**: Be clear about expected outcomes
```
✅ "Verify the deployment was successful by checking the site's status"
❌ "Make sure it works"
```

**Use Action Words**: Start with verbs
```
✅ "Create", "Deploy", "Configure", "Verify"
❌ "Try to...", "Maybe..."
```

**Number Steps**: For complex scenarios
```
✅ "1. Create a new site
     2. Configure the domain
     3. Deploy the application"
❌ "Create a site and configure it and deploy"
```

### ❌ Common Pitfalls

**Too Vague**: Unclear requirements
```
❌ "Set up the project"
```

**Too Specific**: Hardcoded values that might not exist
```
❌ "Deploy to https://my-specific-domain.com"
```

**Assuming State**: Assuming specific files/configuration exist
```
❌ "Deploy the React app in the 'client' directory"
Better: "Deploy the current directory to production"
```

**Multiple Tools**: Scenarios should focus on one tool
```
❌ "Use git to commit changes, then deploy with vercel"
Better: Create separate git and vercel scenarios
```

## Scenario Examples

### Simple Task (Easy)
```
Check the current working directory and list all files and subdirectories.
Show both hidden and visible files.
```

### Workflow Task (Medium)
```
Initialize a new Git repository in the current directory.
Create an initial commit with all existing files.
Add a remote origin pointing to a GitHub repository (you can use a placeholder URL).
```

### Complex Task (Hard)
```
You need to set up a complete Cloudflare Workers development environment:

1. Initialize a new Worker project called 'api-handler'
2. Configure it to handle HTTP requests
3. Add a KV namespace called 'user-data'
4. Bind the KV namespace to your worker
5. Deploy to production
6. Test the deployment by making a request
7. View the logs to confirm it's working

Make sure each step completes successfully before proceeding to the next.
```

## Modifying Existing Scenarios

### 1. Find the Scenario
```bash
# Find scenario file
find src/agentprobe/scenarios -name "status.txt"
```

### 2. Edit the File
```bash
# Edit with your preferred editor
code src/agentprobe/scenarios/git/status.txt
```

### 3. Test Changes
```bash
# Test modified scenario
agentprobe test git --scenario status --verbose
```

### 4. Compare Results
Run the scenario multiple times to ensure consistent behavior.

## Contributing Scenarios

### New Tool Support
To add a completely new tool:

1. **Create tool directory**: `src/agentprobe/scenarios/newtool/`
2. **Add basic scenario**: Start with simple functionality
3. **Test thoroughly**: Ensure it works across different environments
4. **Document**: Add to this guide

### New Scenarios for Existing Tools
1. **Check existing scenarios**: Avoid duplication
2. **Follow naming conventions**: Use descriptive names
3. **Test on multiple systems**: Different OS, tool versions
4. **Submit for review**: Get feedback on clarity and usefulness

## Troubleshooting Scenarios

### Scenario Not Found
```bash
Error: Scenario 'my-scenario' not found for tool 'git'
```
**Fix**: Check file exists at `src/agentprobe/scenarios/git/my-scenario.txt`

### AI Misunderstands Scenario
**Symptoms**: Unexpected behavior, wrong commands
**Fix**: Make scenario more specific, add context, test with `--verbose`

### Inconsistent Results
**Symptoms**: Sometimes works, sometimes doesn't
**Fix**: Scenario might be too vague or depend on specific system state

### Tool Not Available
**Symptoms**: "Command not found" errors
**Fix**: Ensure the CLI tool is installed and in PATH

## Advanced Tips

### Environment-Specific Scenarios
Some scenarios work better in specific environments:

- **Development**: Use local development servers
- **CI/CD**: Avoid interactive prompts
- **Docker**: Consider containerized environments

### Parameterized Scenarios
While scenarios are static text, you can include placeholders:

```
Create a new branch called 'feature/[random-string]' to avoid conflicts.
```

The AI will typically generate appropriate values.

### Testing Consistency
Run scenarios multiple times to verify consistency:

```bash
# Test 5 times to check consistency
agentprobe test git --scenario status --runs 5
```

---

**Ready to create your own scenarios?** Start simple with basic tool functionality, then build up to complex workflows. Every scenario you create helps the community understand how AI agents interact with CLI tools! 🚀
```

`docs/TROUBLESHOOTING.md`:

```md
# Troubleshooting

Quick solutions for common AgentProbe issues. Listed by problem category with actionable fixes.

## Installation Issues

### "Command not found: agentprobe"

**Problem**: AgentProbe isn't installed or not in PATH.

**Solutions**:
```bash
# Option 1: Use uvx (no installation needed)
uvx agentprobe test git --scenario status

# Option 2: Install with pip
pip install agentprobe

# Option 3: Install with uv
uv pip install agentprobe

# Check if installed
which agentprobe
agentprobe --version
```

### "Package not found" during installation

**Problem**: PyPI package isn't available or network issues.

**Solutions**:
```bash
# Update pip first
pip install --upgrade pip

# Try with verbose output
pip install -v agentprobe

# Use different index
pip install -i https://pypi.org/simple/ agentprobe

# Clear pip cache
pip cache purge
pip install agentprobe
```

## Authentication Issues

### "Authentication failed" or "Invalid API key"

**Problem**: Claude API credentials not set up correctly.

**Solutions**:
```bash
# Check current authentication
echo $CLAUDE_CODE_OAUTH_TOKEN
echo $ANTHROPIC_API_KEY

# Set OAuth token (recommended)
export CLAUDE_CODE_OAUTH_TOKEN="your-token-here"

# Or set API key (fallback)
export ANTHROPIC_API_KEY="your-api-key-here"

# Test authentication
agentprobe test git --scenario status
```

### "Request failed with status 401"

**Problem**: Token/API key is invalid or expired.

**Solutions**:
1. **Get new token**: Visit [Claude Console](https://console.anthropic.com)
2. **Check token format**: Should start with `sk-ant-` (API key) or be a longer OAuth token
3. **Verify in environment**:
   ```bash
   env | grep CLAUDE
   env | grep ANTHROPIC
   ```

### "OAuth token file not found"

**Problem**: Using `--oauth-token-file` with invalid path.

**Solutions**:
```bash
# Check file exists
ls -la ~/.agentprobe-token

# Create token file
echo "your-oauth-token" > ~/.agentprobe-token

# Use absolute path
agentprobe test git --scenario status --oauth-token-file /full/path/to/token

# Or use environment variable instead
export CLAUDE_CODE_OAUTH_TOKEN="your-token"
agentprobe test git --scenario status
```

## Scenario Issues

### "Scenario 'xyz' not found for tool 'abc'"

**Problem**: Scenario doesn't exist or typo in name.

**Solutions**:
```bash
# List available scenarios
ls src/agentprobe/scenarios/git/
find . -name "*.txt" -path "*/scenarios/*"

# Check exact name (no .txt extension needed)
agentprobe test git --scenario status  # ✅ Correct
agentprobe test git --scenario status.txt  # ❌ Wrong

# Check available tools
ls src/agentprobe/scenarios/
```

### AI produces unexpected results

**Problem**: Scenario is unclear or AI misunderstands task.

**Solutions**:
```bash
# Use verbose to see AI conversation
agentprobe test git --scenario status --verbose

# Run multiple times to check consistency
agentprobe test git --scenario status --runs 3

# Try different scenario
agentprobe test git --scenario show-log
```

### "Command not found" during scenario execution

**Problem**: Required CLI tool not installed.

**Solutions**:
```bash
# Install missing tool
# For git:
sudo apt install git  # Ubuntu/Debian
brew install git      # macOS

# For docker:
# Follow Docker installation guide

# For vercel:
npm install -g vercel

# For netlify:
npm install -g netlify-cli

# For gh (GitHub CLI):
brew install gh       # macOS
sudo apt install gh  # Ubuntu

# Verify installation
git --version
docker --version
vercel --version
```

## Network and Connectivity

### "Connection timeout" or "Network error"

**Problem**: Network connectivity issues to Claude API.

**Solutions**:
```bash
# Test internet connectivity
ping google.com

# Test Claude API connectivity
curl -I https://api.anthropic.com

# Check proxy settings
echo $HTTP_PROXY
echo $HTTPS_PROXY

# Bypass proxy temporarily
unset HTTP_PROXY HTTPS_PROXY
agentprobe test git --scenario status
```

### "SSL certificate verification failed"

**Problem**: SSL/TLS certificate issues.

**Solutions**:
```bash
# Update certificates (macOS)
/Applications/Python\ 3.x/Install\ Certificates.command

# Update certificates (Ubuntu/Debian)
sudo apt-get update && sudo apt-get install ca-certificates

# Check system time (wrong time causes SSL issues)
date

# Temporary workaround (not recommended for production)
export PYTHONHTTPSVERIFY=0
```

## Community Sharing Issues

### "Failed to share result: 401"

**Problem**: Community API authentication failed.

**Solutions**:
```bash
# Check sharing configuration
agentprobe config get

# For local development, set up valid local API key
agentprobe config set sharing.api_key "your-local-dev-key"

# For production, clear custom keys to use embedded key
agentprobe config set sharing.api_key ""

# Opt out of sharing if needed
agentprobe config set sharing.opted_out true
```

### "Request URL is missing protocol"

**Problem**: Invalid API URL configuration.

**Solutions**:
```bash
# Clear invalid URL
agentprobe config set sharing.api_url ""

# Check configuration
agentprobe config get

# Test without sharing
agentprobe config set sharing.opted_out true
agentprobe test git --scenario status
```

### Community data not showing

**Problem**: No community comparison after test.

**Solutions**:
```bash
# Check if sharing is enabled
agentprobe config get sharing.opted_out

# Enable sharing
agentprobe config set sharing.opted_out false

# Check network connectivity to community API
curl -I https://agentprobe-community-production.nikola-balic.workers.dev

# Test community commands directly
agentprobe community stats
```

## Performance Issues

### Tests taking too long

**Problem**: Scenarios timing out or running slowly.

**Solutions**:
```bash
# Reduce max turns for faster execution
agentprobe test git --scenario status --max-turns 10

# Check if tool is responding slowly
git status  # Run tool directly to check performance

# Use simpler scenarios first
agentprobe test git --scenario status  # Simple
# Instead of complex scenarios like:
agentprobe test netlify --scenario full-lifecycle  # Complex
```

### High API costs

**Problem**: Tests consuming too many Claude API credits.

**Solutions**:
```bash
# Use fewer runs
agentprobe test git --scenario status --runs 1  # Instead of multiple runs

# Avoid benchmark --all
agentprobe benchmark git  # Single tool
# Instead of:
agentprobe benchmark --all  # All tools (expensive!)

# Check costs in output
# Look for "Cost: $X.XX" in results
```

## Development and Local Setup

### "Development mode not detected"

**Problem**: Running from source but using production settings.

**Check development mode detection**:
```bash
# Should show development vs production mode
python -c "
from src.agentprobe.submission import _is_development_mode
print(f'Development mode: {_is_development_mode()}')
"
```

**Solutions**:
- Ensure you're running from source directory with `.git` folder
- Use `uv run agentprobe` instead of installed version
- Check directory structure matches `src/agentprobe`

### Local API server not working

**Problem**: Local development server rejecting requests.

**Solutions**:
```bash
# Check if local server is running
curl http://localhost:8787/health

# Check API key format (should use X-API-Key header)
curl -H "X-API-Key: your-key" http://localhost:8787/api/v1/results

# Set up proper local development key
agentprobe config set sharing.api_key "your-valid-local-key"
```

## Common Error Messages

### ImportError: No module named 'agentprobe'

**Solutions**:
```bash
# Reinstall package
pip uninstall agentprobe
pip install agentprobe

# Or use uvx (no installation needed)
uvx agentprobe test git --scenario status
```

### "KeyError: 'trace'" or similar data errors

**Solutions**:
```bash
# Clear any cached data
rm -rf ~/.agentprobe/cache/

# Try a simple scenario first
agentprobe test git --scenario status

# Check if specific to one tool/scenario
agentprobe test docker --scenario run-nginx
```

### "FileNotFoundError" for scenarios

**Solutions**:
```bash
# Verify you're in correct directory
pwd
ls src/agentprobe/scenarios/

# Use full path if needed
agentprobe test git --scenario status --work-dir /full/path/to/project
```

## Diagnostic Commands

### Check System Status

```bash
# AgentProbe version and help
agentprobe --version
agentprobe --help

# Python and dependencies
python --version
pip list | grep agentprobe

# Environment variables
env | grep CLAUDE
env | grep ANTHROPIC

# Configuration
agentprobe config get
```

### Test Basic Functionality

```bash
# Simple test that should always work
agentprobe test git --scenario status --verbose

# Test without community sharing
agentprobe config set sharing.opted_out true
agentprobe test git --scenario status

# Test authentication
agentprobe community stats
```

### Debug Network Issues

```bash
# Test API connectivity
curl -I https://api.anthropic.com
curl -I https://agentprobe-community-production.nikola-balic.workers.dev

# Check DNS resolution
nslookup api.anthropic.com

# Test with verbose HTTP
export PYTHONHTTPSVERIFY=0
python -c "
import requests
response = requests.get('https://api.anthropic.com')
print(response.status_code)
"
```

## Getting More Help

### Enable Verbose Output

Always use `--verbose` when troubleshooting:
```bash
agentprobe test git --scenario status --verbose
```

This shows the full AI conversation and helps identify where things go wrong.

### Collect System Information

```bash
# Create a system info report
echo "=== System Info ===" > debug.txt
uname -a >> debug.txt
python --version >> debug.txt
agentprobe --version >> debug.txt
echo "=== Environment ===" >> debug.txt
env | grep -E "(CLAUDE|ANTHROPIC)" >> debug.txt
echo "=== Configuration ===" >> debug.txt
agentprobe config get >> debug.txt
```

### Reset to Clean State

```bash
# Clear all configuration
rm -f ~/.agentprobe/sharing.json

# Clear any caches
rm -rf ~/.agentprobe/cache/

# Reinstall package
pip uninstall agentprobe
pip install agentprobe

# Test basic functionality
agentprobe test git --scenario status
```

---

**Still having issues?**

1. Check [GitHub Issues](https://github.com/nibzard/agentprobe/issues) for similar problems
2. Create a new issue with:
   - Error message (full text)
   - Command you ran
   - System info (OS, Python version)
   - Verbose output (`--verbose`)

**Quick win**: Most issues are solved by ensuring proper authentication setup and using simple scenarios first! 🚀
```