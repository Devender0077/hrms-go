# Lottie Animations for HRMS

This directory contains Lottie JSON animation files from IconScout for the HRMS application.

## Directory Structure

```
src/assets/lottie/
├── README.md
├── login.json
├── dashboard.json
├── employee.json
├── recruitment.json
├── payroll.json
├── attendance.json
├── leave.json
├── settings.json
├── task.json
├── asset.json
├── report.json
├── goal.json
└── expense.json
```

## How to Use

### 1. Download Lottie Files from IconScout

1. Go to [IconScout](https://iconscout.com/)
2. Search for business/HR related animations
3. Download the JSON files for each module
4. Save them in this directory with the corresponding names

### 2. Import and Use in Components

```tsx
import { LoginLottieIllustration } from '../components/common/LottieIllustration';
import loginAnimation from '../assets/lottie/login.json';

// In your component
<LoginLottieIllustration 
  animationData={loginAnimation}
  className="w-full h-full"
/>
```

### 3. Replace SVG Illustrations

To replace the current SVG illustrations with Lottie animations:

1. Import the Lottie component
2. Import the animation JSON file
3. Replace the SVG illustration with the Lottie component

Example:
```tsx
// Before (SVG)
import { LoginIllustration } from './HRIllustrations';
<LoginIllustration className="w-full h-full" />

// After (Lottie)
import { LoginLottieIllustration } from './LottieIllustration';
import loginAnimation from '../assets/lottie/login.json';
<LoginLottieIllustration 
  animationData={loginAnimation}
  className="w-full h-full"
/>
```

## Recommended IconScout Searches

For each HRMS module, search for these terms on IconScout:

- **Login**: "login", "authentication", "security", "user access"
- **Dashboard**: "dashboard", "analytics", "data visualization", "charts"
- **Employee**: "team", "people", "staff", "employees", "workforce"
- **Recruitment**: "hiring", "interview", "job search", "candidates"
- **Payroll**: "money", "salary", "payment", "finance", "calculator"
- **Attendance**: "clock", "time tracking", "schedule", "calendar"
- **Leave**: "vacation", "time off", "holiday", "break"
- **Settings**: "settings", "configuration", "gear", "preferences"
- **Task**: "tasks", "todo", "project management", "checklist"
- **Asset**: "assets", "equipment", "inventory", "devices"
- **Report**: "reports", "analytics", "data", "charts"
- **Goal**: "goals", "target", "achievement", "progress"
- **Expense**: "expenses", "receipts", "money", "billing"

## Animation Guidelines

- **File Size**: Keep animations under 500KB for optimal performance
- **Duration**: 2-5 seconds loop duration works best
- **Colors**: Match your brand colors or use neutral colors
- **Style**: Choose consistent illustration style across all animations
- **Resolution**: 400x300px or similar aspect ratio

## Performance Tips

1. **Lazy Loading**: Load animations only when needed
2. **Caching**: Cache animation data to avoid re-downloading
3. **Compression**: Use compressed JSON files when possible
4. **Fallback**: Always provide SVG fallback for slow connections

## Integration Steps

1. Download all required Lottie files from IconScout
2. Place them in this directory with proper naming
3. Update the HeroSection component to use Lottie animations
4. Test performance and adjust animation speeds if needed
5. Add loading states for better user experience

## Troubleshooting

- **Animation not loading**: Check file path and JSON validity
- **Performance issues**: Reduce animation complexity or file size
- **Browser compatibility**: Ensure Lottie library supports target browsers
- **Mobile optimization**: Test on mobile devices and adjust accordingly
