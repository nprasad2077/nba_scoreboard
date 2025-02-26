# NBA Scoreboard Project Guidelines

## Build & Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint checks

## Test Commands
- `node test/test.js` - Run basic WebSocket test
- `docker run -i --rm -v ${PWD}:/scripts -e FRONTEND_URL=<url> grafana/k6 run /scripts/frontend-test.js` - Frontend test with k6
- `docker run -i --rm -v ${PWD}:/scripts -e BACKEND_URL=<url> -e WS_URL=<ws-url> grafana/k6 run /scripts/ws-test.js` - Backend test with k6

## Code Style Guidelines
- Use React functional components with hooks
- Import organization: React imports first, then libraries, local components, styles
- Use PropTypes for component props validation
- Follow responsive design practices with useMediaQuery
- Use environment variables for configuration (import.meta.env.VITE_*)
- Use consistent error handling with try/catch
- Use proper React hooks dependency arrays
- Follow camelCase for variables/functions, PascalCase for components
- Use Tailwind CSS with MUI component library for UI