# Dashboard User Guide

Complete guide to using the AgentProbe Community Dashboard for analyzing CLI tool testing data and community insights.

## Overview

The AgentProbe Community Dashboard provides interactive visualizations and analytics for community-submitted CLI tool testing data. Access the dashboard at:

**🌐 https://dashboard.agentprobe.dev**

## Dashboard Navigation

### Home Page - Overview & Trends

The home page provides a high-level view of community activity and trends.

#### Stats Overview Cards
- **Total Results**: Number of test submissions from the community
- **Success Rate**: Overall success percentage across all tools and scenarios  
- **Active Tools**: Number of different CLI tools being tested
- **Recent Activity**: Latest submissions and updates

#### Success Rate Trends Chart
Interactive time-series chart showing:
- Community-wide success rates over time
- Hover for detailed metrics at specific dates
- Trend lines indicating performance improvements/regressions
- Responsive design that works on mobile and desktop

#### Recent Activity Feed
Real-time updates showing:
- Latest test submissions
- New tools added to the community
- Significant performance changes
- Community milestones

### Leaderboard Page - Tool Performance Rankings

Compare performance across different CLI tools.

**🔗 https://dashboard.agentprobe.dev/leaderboard/**

#### Features

**Performance Rankings Table**:
- Tools sorted by success rate (highest first)
- Total runs as tiebreaker for similar success rates
- Minimum 3 runs required for leaderboard inclusion
- Real-time updates as new data arrives

**Sortable Columns**:
- **Tool Name**: CLI tool identifier
- **Success Rate**: Percentage of successful test runs
- **Total Runs**: Number of test submissions
- **Average Duration**: Mean execution time in seconds

**Interactive Features**:
- Click column headers to sort data
- Responsive design for mobile viewing
- Export data in CSV/JSON formats

#### Understanding the Rankings

**Success Rate Calculation**:
```
Success Rate = Successful Runs ÷ Total Runs × 100%
```

**Ranking Algorithm**:
1. Primary sort: Success rate (descending)
2. Tiebreaker: Total runs (descending)
3. Minimum threshold: 3+ runs for inclusion

**Performance Indicators**:
- 🟢 **90%+**: Excellent performance
- 🟡 **70-89%**: Good performance
- 🟠 **50-69%**: Fair performance  
- 🔴 **<50%**: Needs improvement

### Scenarios Page - Difficulty Analysis

Analyze performance patterns across different testing scenarios.

**🔗 https://dashboard.agentprobe.dev/scenarios/**

#### Scenario Difficulty Ranking

**Difficulty Score Algorithm** (0-100 scale):
- **Success Rate** (40% weight): Lower success = higher difficulty
- **Average Duration** (30% weight): Longer time = higher difficulty
- **Friction Points** (20% weight): More issues = higher difficulty
- **Test Volume** (10% weight): More tests = more reliable score

**Difficulty Categories**:
- 🔴 **80-100**: Very High Difficulty
- 🟠 **60-79**: High Difficulty
- 🟡 **40-59**: Medium Difficulty
- 🟢 **20-39**: Low Difficulty
- ⚪ **0-19**: Very Low Difficulty

#### Scenario Insights

**Performance Metrics**:
- **Average Success Rate**: Success percentage for this scenario
- **Total Runs**: Number of tests performed
- **Average Duration**: Mean execution time
- **Tools Tested**: Number of different tools tested on this scenario

**Common Scenarios**:
- `file-operations`: Basic file manipulation tasks
- `code-generation`: Creating code files and projects
- `data-analysis`: Processing and analyzing data
- `debugging`: Identifying and fixing issues
- `system-admin`: System administration tasks

## Dashboard Features

### Data Export

Export community data for further analysis:

**Export Options**:
- **CSV Format**: Spreadsheet-compatible data
- **JSON Format**: Structured data for programming
- **Chart Images**: Save visualizations as PNG files

**Export Process**:
1. Navigate to the page with data you want to export
2. Click the "Export" button (usually in the top-right)
3. Select your preferred format
4. Download will start automatically

### Real-time Updates

The dashboard automatically refreshes data to show:
- New test submissions as they arrive
- Updated success rates and rankings
- Fresh statistics and trends
- Community growth metrics

**Update Frequency**:
- Stats cards: Every 30 seconds
- Charts: Every 60 seconds  
- Leaderboard: Every 2 minutes
- Scenario data: Every 5 minutes

### Mobile Responsiveness

The dashboard is optimized for all devices:

**Mobile Features**:
- Touch-friendly navigation
- Responsive charts that scale to screen size
- Collapsible sections for better mobile layout
- Thumb-friendly button sizes

**Desktop Features**:
- Full-width charts for detailed analysis
- Hover interactions and tooltips
- Keyboard navigation support
- Multi-column layouts

## Interpreting the Data

### Understanding Success Rates

**High Success Rates (90%+)**:
- Tool is well-suited for the scenarios tested
- Good user experience and reliability
- May indicate easier scenarios or mature tooling

**Low Success Rates (<70%)**:
- Tool may need improvements
- Scenarios might be particularly challenging
- Could indicate new or experimental tools

**Factors Affecting Success Rates**:
- Tool maturity and development stage
- Scenario complexity and requirements
- User experience and documentation quality
- Technical limitations or bugs

### Analyzing Trends

**Positive Trends**:
- Increasing success rates over time
- Growing number of test submissions
- New tools joining the community

**Concerning Trends**:
- Declining success rates
- Stagnant or decreasing activity
- Tools dropping out of testing

**Seasonal Patterns**:
- Weekday vs. weekend activity differences
- Monthly development cycles
- Conference and release impacts

### Friction Point Analysis

Common friction points indicate areas for improvement:

**Technical Issues**:
- `slow-response`: Performance optimization needed
- `authentication`: Login/access problems
- `setup-complexity`: Installation difficulties

**User Experience Issues**:
- `unclear-instructions`: Documentation needs improvement
- `too-many-steps`: Workflow simplification needed
- `error-messages`: Better error handling required

**Integration Issues**:
- `api-limitations`: API improvements needed
- `compatibility`: Platform support gaps
- `configuration`: Setup complexity

## Best Practices for Data Interpretation

### Statistical Significance

**Minimum Data Requirements**:
- At least 5-10 test runs for meaningful statistics
- Multiple tools tested for fair comparison
- Recent data (within last 30 days) for current relevance

**Confidence Levels**:
- 50+ runs: High confidence in metrics
- 20-50 runs: Good confidence with some variance
- 5-20 runs: Fair confidence, trends may be noisy
- <5 runs: Low confidence, treat as preliminary

### Comparative Analysis

**Fair Comparisons**:
- Compare tools tested on similar scenarios
- Consider tool maturity and development stage
- Account for different use cases and target audiences
- Look at trends over time, not just point-in-time data

**Avoid Bias**:
- Don't assume higher success rate = better tool
- Consider scenario complexity and appropriateness
- Account for community size and testing volume
- Look for sustained performance, not temporary spikes

### Using Data for Improvement

**For Tool Developers**:
- Identify common failure patterns
- Focus on scenarios with lowest success rates
- Monitor performance trends after updates
- Learn from high-performing tools

**For Users**:
- Choose tools based on relevant scenarios
- Consider both success rate and your specific needs
- Look for tools with active improvement trends
- Contribute test results to help the community

## Troubleshooting

### Dashboard Loading Issues

**Slow Loading**:
- Check your internet connection
- Try refreshing the page
- Clear browser cache if problems persist

**Data Not Updating**:
- Refresh the page manually
- Check if you're viewing cached content
- Try opening in an incognito/private window

**Chart Rendering Problems**:
- Ensure JavaScript is enabled
- Try a different browser
- Check if ad blockers are interfering

### Mobile Issues

**Charts Too Small**:
- Rotate device to landscape mode
- Use pinch-to-zoom for detailed viewing
- Switch to desktop for complex analysis

**Touch Navigation**:
- Tap charts to see detailed tooltips
- Swipe to scroll through data tables
- Use two-finger scroll in chart areas

### Browser Compatibility

**Supported Browsers**:
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required Features**:
- JavaScript enabled
- Modern CSS support
- WebGL for advanced charts (optional)

## Getting Help

**Documentation**:
- Complete API reference: `/docs/api/`
- Development guides: `/docs/developer/`
- User guides: `/docs/user-guides/`

**Community Support**:
- GitHub repository for bug reports
- Community forums for discussions
- Email support for urgent issues

**Feedback**:
We welcome feedback on dashboard usability and feature requests. Help us make the community tools better for everyone!

---

*Dashboard updated continuously with community contributions* 🚀