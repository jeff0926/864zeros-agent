# Task Breakdown AI

An AI-powered mobile app that breaks down complex tasks into actionable, time-bound steps with smart prioritization and progress tracking.

## Features

- **Natural Language Task Input**: Describe tasks in plain English
- **AI-Powered Breakdown**: GPT-4 automatically creates actionable subtasks
- **Progress Tracking**: Visual progress bars and completion metrics
- **Cross-Platform**: Runs on both iOS and Android
- **Real-time Sync**: Data synchronized via Supabase

## Tech Stack

- **Frontend**: React Native 0.72.6 with TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **AI**: OpenAI GPT-4 API
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation v6
- **Icons**: Feather Icons

## Prerequisites

- Node.js >= 16
- React Native development environment
- OpenAI API key
- Supabase project

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd task-breakdown-ai
npm install
```

### 2. Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the following variables:
- `OPENAI_API_KEY`: Your OpenAI API key
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

### 3. Supabase Setup

1. Create a new Supabase project
2. Run the SQL script in `supabase-setup.sql` in your Supabase SQL editor
3. Enable Authentication in your Supabase project
4. Configure your authentication providers as needed

### 4. iOS Setup (if targeting iOS)

```bash
cd ios
pod install
cd ..
```

### 5. Run the Application

For Android:
```bash
npx react-native run-android
```

For iOS:
```bash
npx react-native run-ios
```

## Project Structure

```
src/
├── components/       # Reusable UI components
├── contexts/        # React contexts (Theme, etc.)
├── navigation/      # Navigation configuration
├── screens/         # App screens
├── services/        # API and service integrations
├── store/          # Redux store and slices
└── types/          # TypeScript type definitions
```

## Key Components

### AI Service (`src/services/aiService.ts`)
Handles OpenAI GPT-4 integration for task breakdown generation.

### Supabase Service (`src/services/supabaseService.ts`)
Manages all database operations including tasks, subtasks, and user data.

### Task Management (`src/store/slices/tasksSlice.ts`)
Redux slice handling task state management and async operations.

## API Integration

### OpenAI
- Model: GPT-4
- Purpose: Breaking down complex tasks into actionable subtasks
- Fallback: Basic breakdown when API fails

### Supabase
- Authentication: User registration and login
- Database: PostgreSQL with Row Level Security
- Real-time: Live updates for task changes

## Database Schema

### Tables
- `users`: User profiles and preferences
- `tasks`: Main tasks with status and metadata
- `subtasks`: AI-generated actionable steps

### Key Features
- Row Level Security (RLS) for data privacy
- Foreign key constraints for data integrity
- Indexes for performance optimization

## Development Guidelines

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Consistent naming conventions

### State Management
- Redux Toolkit for global state
- Local state for component-specific data
- Async thunks for API calls

### Error Handling
- Try-catch blocks for async operations
- User-friendly error messages
- Graceful fallbacks for AI service failures

## Testing

Run tests with:
```bash
npm test
```

## Deployment

### Android
1. Generate signed APK or AAB
2. Upload to Google Play Store

### iOS
1. Build for release in Xcode
2. Upload to App Store Connect

## Performance Considerations

- Lazy loading for large task lists
- Optimized re-renders with React.memo
- Efficient state updates with normalized data
- Image optimization and caching

## Future Enhancements

- [ ] Calendar integration
- [ ] Team collaboration features
- [ ] Voice input for task creation
- [ ] Advanced analytics and insights
- [ ] Offline mode support
- [ ] Push notifications
- [ ] Habit tracking integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting guide

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx react-native start --reset-cache`
2. **iOS build failures**: Clean build folder and reinstall pods
3. **Android build issues**: Clean gradle cache
4. **Environment variables not loading**: Check babel.config.js plugin configuration

### Performance Issues

- Enable Hermes engine for better performance
- Use FlatList for large lists
- Implement proper loading states
- Optimize images and assets