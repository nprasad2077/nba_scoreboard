# React Scoreboard

## Importing and using SVG files

Import SVGs as react components

```javascript
import { ReactComponent as HawksLogo } from "./assets/nba-logos/eastern/atlanta-hawks.svg";

function App() {
  return <HawksLogo width="100" height="100" />;
}
```

If you want to customize vite-plugin-svgr behavior, you can pass options to the svgr() function:

```javascript
svgr({
  svgo: true, // Enable SVGO optimization
  svgoConfig: {
    plugins: [{ removeViewBox: false }], // Example: Keep the `viewBox` attribute
  },
  titleProp: true, // Add a `title` attribute
  ref: true, // Add a ref to the SVG
});
```
