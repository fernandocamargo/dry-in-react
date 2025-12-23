# DRY in React: A Study in Composability Over Configuration

## 📖 Start Here

**Before reading this:** Please read Swizec Teller's original article:

### [**"DRY is a footgun, remember to YAGNI"**](https://swizec.com/blog/dry-is-a-footgun-remember-to-yagni/)

This codebase is a response to that article. Understanding Swizec's argument is essential context for the counter-thesis presented here.

---

## Thesis

The problem with [DRY (Don't Repeat Yourself)](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) isn't the principle itself, but the approach. Instead of anticipating flexibility through configuration props, **expose internal primitives for composition**.

---

## Context: The DRY Footgun

In his article, Swizec identifies a critical problem with premature abstraction. He describes how a generic button component evolves:

> "You start with a simple button component. Then you need a blue one. Then a green one. Then one that's disabled sometimes. Then one that's only disabled when some other state is true. Then..."

The pattern he describes is familiar to anyone who's worked in a large [React](https://react.dev/) codebase: a component starts simple, accumulates props to handle edge cases, and eventually becomes a configuration nightmare:

```jsx
// The anti-pattern Swizec warns against
<GenericButton
  variant="primary"
  size="large"
  disabled={!isActive}
  color="green"
  onClick={handleClick}
  showLoader={isLoading}
  iconPosition="left"
  // ... 15 more props
/>
```

Swizec's conclusion:

> **DRY leads to bloated abstractions. Use YAGNI instead—don't abstract until patterns genuinely emerge.**

([YAGNI: "You Aren't Gonna Need It"](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it))

---

## The Problem with This Conclusion

Swizec is right about the symptom, but the diagnosis misses something crucial. The issue isn't DRY itself—it's **configuration-based abstraction**.

When you try to make a component flexible by adding props for every scenario, you're making a flawed assumption:

**You can predict what flexibility points your consumers will need.**

You can't.

This codebase demonstrates an alternative approach: **don't predict flexibility—provide composability.**

---

## Two Approaches to Abstraction

Let's make this concrete. Imagine you need buttons with different colors and behaviors.

### ❌ Configuration-Based DRY (The Footgun)

```javascript
// Attempt to predict all variations
const GenericButton = ({
  variant,
  color,
  size,
  disabled,
  loading,
  onClick,
  children
}) => {
  const styles = {
    backgroundColor: color === 'primary' ? 'blue' : color === 'danger' ? 'red' : 'gray',
    fontSize: size === 'large' ? '18px' : '14px',
    opacity: disabled ? 0.5 : 1,
    // ... more conditional styling
  };

  return (
    <button
      style={styles}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};
```

**Why this fails:**
1. Every new variation requires modifying the component
2. Props proliferate as you discover edge cases
3. The component becomes brittle—changing one case risks breaking others
4. Consumers are constrained by your predictions

### ✅ Composition-Based DRY (This Codebase)

```javascript
import { createElement, useCallback } from 'react';

// Expose internal primitives for composition
const GenericButton = ({ children, onClick, ...enhancement }) => {
  const track = callback =>
    useCallback(
      (...params) => console.log(callback.toString()) || callback(...params),
      [callback]
    );

  const style = {
    border: "1px solid black",
    fontSize: "14px",
    padding: "10px",
    cursor: "pointer"
  };

  const Button = props => (
    <button
      onClick={track(onClick)}
      style={style}
      {...props}
      {...enhancement}
    />
  );

  // The key: expose pieces for composition
  const pieces = { Button, track, style };

  const isComponent = object => typeof object === "function";

  return isComponent(children)
    ? createElement(children, pieces)  // Pass pieces to function child
    : <Button>{children}</Button>;
};
```

**Why this succeeds:**
1. `GenericButton` solves **one problem**: a tracked, styled button primitive
2. Internal pieces (`Button`, `track`, `style`) are **explicitly exposed**
3. Consumers compose what they need without `GenericButton` knowing about their use cases
4. No props proliferation—flexibility comes from composition, not configuration

**Note:** The key mechanism is using [`createElement`](https://react.dev/reference/react/createElement) to invoke the function child with pieces: `createElement(children, pieces)`. This is what enables the [render props pattern](https://legacy.reactjs.org/docs/render-props.html).

---

## The Pattern: Render Props for Primitive Exposure

The critical insight is in how `GenericButton` handles children using the [Render Props pattern](https://legacy.reactjs.org/docs/render-props.html):

```javascript
const isComponent = object => typeof object === "function";

return isComponent(children)
  ? createElement(children, pieces)  // Advanced: pass primitives for composition
  : <Button>{children}</Button>;     // Simple: just render a button
```

This dual consumption pattern enables:

### Basic Usage (No Composition)
```jsx
<GenericButton onClick={() => alert('clicked')}>
  Click Me
</GenericButton>
```

### Advanced Usage (Compose Primitives)
```jsx
<GenericButton onClick={() => alert('clicked')}>
  {({ Button, style, track }) => (
    <Button style={{ ...style, background: 'green' }}>
      Custom Button
    </Button>
  )}
</GenericButton>
```

The consumer decides the complexity level. `GenericButton` doesn't predict it.

---

## Case Study: Progressive Enhancement

Let's trace how different components consume `GenericButton` with varying levels of composition.

### Level 1: Direct Primitive Usage (`ClickMe.js`)

```javascript
import { createElement } from 'react';
import GenericButton from './GenericButton';

const ClickMe = () => (
  <GenericButton onClick={() => alert("closePage()")}>
    {({ Button, style }) => (
      <Button style={{ ...style, background: "blue" }}>
        ClickMe
      </Button>
    )}
  </GenericButton>
);

export default ClickMe;
```

**What's happening:**
- Receives `Button` and `style` from `GenericButton`
- Spreads base styles and overrides `background`
- Reuses tracking and base button logic without reimplementation

### Level 2: Layered Composition (`Activable.js`)

```javascript
import { createElement } from 'react';
import GenericButton from './GenericButton';

const identify = component =>
  Object.assign(component, { displayName: "Custom(GenericButton)" });

const Activable = ({ onClick, children, active }) => (
  <GenericButton onClick={onClick} disabled={!active}>
    {pieces => createElement(identify(children), pieces)}
  </GenericButton>
);

export default Activable;
```

**What's happening:**
- Wraps `GenericButton` to add activation state behavior
- Acts as a **composition middleware**—receives pieces from `GenericButton` and forwards them
- Uses `createElement(identify(children), pieces)` to invoke the child function with pieces
- Uses `identify` to set component `displayName` for [React DevTools](https://react.dev/learn/react-developer-tools)
- Doesn't know what children will do with pieces
- Single responsibility: map `active` prop to `disabled` state

### Level 3: Complex Composition with Side Effects (`Input.js`)

```javascript
import { createElement, useState, useEffect } from 'react';
import GenericButton from './GenericButton';

const URL = "https://placekitten.com/300/300";

const createImage = src => {
  const img = new Image();
  img.src = src;
  return img;
};

const Input = () => {
  const [loading, setLoading] = useState(true);
  const load = () => setLoading(false);

  useEffect(() => {
    createImage(URL).addEventListener("load", load, true);
  }, []);

  return (
    <GenericButton>
      {({ track, style }) =>
        loading ? (
          <p style={{ ...style, border: "none", cursor: "default" }}>
            Loading image...
          </p>
        ) : (
          <input
            type="image"
            src={URL}
            alt="Image as button"
            onClick={track(() => alert("clickImage()"))}
            onMouseOver={track(() => console.log("mouseOverImage()"))}
            onMouseOut={track(() => console.log("mouseOutImage()"))}
            style={{ ...style, padding: "0" }}
          />
        )
      }
    </GenericButton>
  );
};

export default Input;
```

**What's happening:**
- Uses only `track` and `style` pieces (ignores `Button`)
- Renders completely different elements (`<p>` or `<input>`)
- Demonstrates that pieces are **à la carte**—use what you need
- `GenericButton` never anticipated this use case, yet it works perfectly
- Uses [React Hooks](https://react.dev/reference/react) ([`useState`](https://react.dev/reference/react/useState), [`useEffect`](https://react.dev/reference/react/useEffect), [`useCallback`](https://react.dev/reference/react/useCallback)) for state management

---

## The Technical Contract

Let's formalize what makes this pattern work.

### Type Signature (Conceptual)

```typescript
// GenericButton's pieces contract
type ButtonPieces = {
  Button: React.ComponentType<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  track: <T extends (...args: any[]) => any>(callback: T) => T;
  style: React.CSSProperties;
};

// GenericButton accepts either:
// 1. ReactNode (simple usage)
// 2. Function receiving pieces (composition usage)
type GenericButtonProps = {
  onClick: () => void;
  children: React.ReactNode | ((pieces: ButtonPieces) => React.ReactNode);
} & React.HTMLAttributes<HTMLButtonElement>;
```

### The Inversion of Control

Traditional configuration-based components force **the component** to control how consumers use it:

```jsx
// Component controls the consumer
<GenericButton variant="primary" />  // Consumer limited to predefined variants
```

Composition-based components invert this ([Inversion of Control](https://kentcdodds.com/blog/inversion-of-control)):

```jsx
// Consumer controls the composition
<GenericButton>
  {({ Button, style }) => /* Consumer decides what to render */}
</GenericButton>
```

This is true [**Dependency Inversion**](https://en.wikipedia.org/wiki/Dependency_inversion_principle) at the component level.

---

## Why This Defeats the Footgun

Let's revisit Swizec's concern: as requirements evolve, configuration-based components become unmaintainable.

### Scenario: New Requirement Arrives

**Requirement:** "We need a button that shows an image after loading."

#### Configuration Approach (Breaks Down)

```jsx
// Now GenericButton needs to know about images and loading states
<GenericButton
  variant="image-loader"
  imageUrl="..."
  showLoadingText={true}
  loadingText="Loading image..."
  onImageLoad={...}
/>
```

Every new requirement modifies `GenericButton`. This is the footgun Swizec warns about:

> "Every time you need a variation, you modify the shared component. It grows. It becomes complex. Eventually it's easier to duplicate than to use."

#### Composition Approach (Scales Naturally)

```jsx
// GenericButton doesn't change at all
<GenericButton>
  {({ track, style }) =>
    loading ? (
      <p style={style}>Loading...</p>
    ) : (
      <input
        type="image"
        src={imageUrl}
        onClick={track(onClick)}
      />
    )
  }
</GenericButton>
```

The requirement is handled **at the consumer level** using exposed primitives. `GenericButton` remains untouched.

---

## Swizec's Requirements: Solved Without Modification

Let's directly address every requirement Swizec mentions. The key insight: **GenericButton never changes**—all variations are handled by consumers composing primitives.

### Requirement 1: "A blue button"

**Configuration approach** (modifies GenericButton):
```jsx
// Add color prop to GenericButton
<GenericButton color="blue">Click Me</GenericButton>
```

**Composition approach** (GenericButton unchanged):
```jsx
<GenericButton onClick={handleClick}>
  {({ Button, style }) => (
    <Button style={{ ...style, background: "blue" }}>
      Click Me
    </Button>
  )}
</GenericButton>
```

**See implementation:** `src/components/ClickMe.js`

---

### Requirement 2: "A green button"

**Configuration approach** (adds to GenericButton):
```jsx
// Now GenericButton needs to handle both blue and green
<GenericButton color="green">Click Me</GenericButton>
```

**Composition approach** (GenericButton unchanged):
```jsx
<GenericButton onClick={handleClick}>
  {({ Button, style }) => (
    <Button style={{ ...style, background: "green" }}>
      Click Me
    </Button>
  )}
</GenericButton>
```

**See implementation:** `src/components/Simple.js`

---

### Requirement 3: "Disabled sometimes"

**Configuration approach** (adds disabled prop):
```jsx
<GenericButton color="blue" disabled={true}>Click Me</GenericButton>
```

**Composition approach** (GenericButton unchanged):
```jsx
<GenericButton onClick={handleClick}>
  {({ Button, style }) => (
    <Button disabled style={{ ...style, background: "blue" }}>
      Click Me
    </Button>
  )}
</GenericButton>
```

**Note:** Through `...enhancement`, any consumer can already pass `disabled` without GenericButton knowing.

---

### Requirement 4: "Disabled when some other state is true"

**Configuration approach** (adds conditional logic):
```jsx
// GenericButton now needs to understand your business logic
<GenericButton color="blue" disabled={!isActive}>Click Me</GenericButton>
```

**Composition approach** (GenericButton unchanged):
```jsx
<GenericButton onClick={handleClick} disabled={!isActive}>
  {({ Button, style }) => (
    <Button style={{ ...style, background: "blue" }}>
      Click Me
    </Button>
  )}
</GenericButton>
```

**See implementation:** `src/components/Activable.js` (wraps GenericButton to add activation behavior)

---

### Requirement 5: "Different sizes"

**Configuration approach** (adds size variants):
```jsx
// GenericButton now needs size mapping logic
<GenericButton color="blue" size="large">Click Me</GenericButton>
```

**Composition approach** (GenericButton unchanged):
```jsx
<GenericButton onClick={handleClick}>
  {({ Button, style }) => (
    <Button style={{ ...style, background: "blue", fontSize: "18px", padding: "15px" }}>
      Click Me
    </Button>
  )}
</GenericButton>
```

---

### Requirement 6: "Show loader while loading"

**Configuration approach** (adds loading state):
```jsx
// GenericButton now manages loading UI
<GenericButton color="blue" showLoader={isLoading}>Click Me</GenericButton>
```

**Composition approach** (GenericButton unchanged):
```jsx
<GenericButton onClick={handleClick}>
  {({ Button, style }) =>
    isLoading ? (
      <Button disabled style={{ ...style, background: "blue" }}>
        Loading...
      </Button>
    ) : (
      <Button style={{ ...style, background: "blue" }}>
        Click Me
      </Button>
    )
  }
</GenericButton>
```

**See implementation:** `src/components/Input.js` (demonstrates loading state with image)

---

### Requirement 7: "Icon with text"

**Configuration approach** (adds icon support):
```jsx
// GenericButton now needs icon rendering logic
<GenericButton
  color="blue"
  icon={<SaveIcon />}
  iconPosition="left"
>
  Save
</GenericButton>
```

**Composition approach** (GenericButton unchanged):
```jsx
<GenericButton onClick={handleClick}>
  {({ Button, style }) => (
    <Button style={{ ...style, background: "blue" }}>
      <SaveIcon /> Save
    </Button>
  )}
</GenericButton>
```

---

### Requirement 8: "Completely different element (not a button)"

**Configuration approach** (breaks down):
```jsx
// GenericButton can't handle this—it's fundamentally about <button>
// You'd need a new component or hacky as="input" prop
```

**Composition approach** (GenericButton unchanged):
```jsx
<GenericButton>
  {({ track, style }) => (
    <input
      type="image"
      src={imageUrl}
      onClick={track(handleClick)}
      style={{ ...style, padding: "0" }}
    />
  )}
</GenericButton>
```

**See implementation:** `src/components/Input.js` (uses `<input type="image">` instead of `<button>`)

---

### The Pattern: Zero Modifications

Notice what happened across all 8 requirements:

| Requirement | Configuration Approach | Composition Approach | GenericButton Modified? |
|-------------|----------------------|---------------------|------------------------|
| Blue button | Added `color` prop | Composed with `style` | ❌ No |
| Green button | Extended `color` prop | Composed with `style` | ❌ No |
| Disabled | Added `disabled` prop | Used `...enhancement` | ❌ No |
| Conditional disabled | Added conditional logic | Consumer handles logic | ❌ No |
| Different sizes | Added `size` prop | Composed with `style` | ❌ No |
| Loading state | Added `showLoader` prop | Consumer handles state | ❌ No |
| Icons | Added `icon`, `iconPosition` | Composed children | ❌ No |
| Different element | Can't handle / needs refactor | Composed with `track`, `style` | ❌ No |

**Configuration approach:** 7 prop additions, 1 impossible case, GenericButton grows with every requirement.

**Composition approach:** 0 modifications to GenericButton, all cases handled, including the "impossible" one.

---

## Key Patterns Used

### 1. Render Props for Piece Exposure

```javascript
const pieces = { Button, track, style };
const isComponent = object => typeof object === "function";

return isComponent(children)
  ? createElement(children, pieces)  // Invoke function child with pieces
  : <Button>{children}</Button>;
```

**Why:** Allows dual consumption (simple JSX or advanced composition).

**The key:** Using [`createElement(children, pieces)`](https://react.dev/reference/react/createElement) instead of `children(pieces)` allows passing pieces as props to the child function, enabling the render props pattern.

**Reference:** [React Render Props documentation](https://legacy.reactjs.org/docs/render-props.html)

### 2. Component Identification for Debugging

```javascript
const identify = component =>
  Object.assign(component, { displayName: "Custom(GenericButton)" });
```

**Why:** [React DevTools](https://react.dev/learn/react-developer-tools) shows meaningful names for dynamically created components.

**Reference:** [`displayName` for debugging](https://legacy.reactjs.org/docs/react-component.html#displayname)

### 3. Enhancement Props via Rest/Spread

```javascript
const GenericButton = ({ children, onClick, ...enhancement }) => {
  const Button = props => (
    <button {...props} {...enhancement} />
  );
};
```

**Why:** Consumers can override any prop (e.g., `disabled`, `style`) without `GenericButton` needing to know about them.

**Reference:** [Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax), [Rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters)

### 4. Utility Exposure (Not Just Components)

```javascript
const pieces = { Button, track, style };
```

**Why:** `track` is a utility function exposed as a primitive. Consumers can wrap their own callbacks, even on elements that aren't `Button`.

### 5. Progressive Enhancement

```jsx
// Simple usage (non-function child)
<GenericButton onClick={handler}>Click Me</GenericButton>

// Advanced usage (function child)
<GenericButton onClick={handler}>
  {pieces => /* custom composition */}
</GenericButton>
```

**Why:** Beginners use simple syntax. Advanced users access primitives when needed.

---

## The Counter-Argument to YAGNI

Swizec's article recommends YAGNI: don't abstract until patterns emerge from duplicated code.

> "The best time to generalize code is **never**. The second best time is after you've written the same code 3+ times and deeply understand the pattern."

This codebase agrees with YAGNI but adds a nuance:

**When you do abstract, abstract primitives, not configurations.**

The difference:

```javascript
// Configuration abstraction (YAGNI says: wait for duplication)
const GenericButton = ({ variant, size, color }) => { /* ... */ };

// Primitive abstraction (this codebase says: expose pieces early)
const GenericButton = ({ children }) => {
  const pieces = { Button, track, style };
  const isComponent = object => typeof object === "function";
  return isComponent(children)
    ? createElement(children, pieces)
    : <Button>{children}</Button>;
};
```

**Why primitive abstraction is safe:**
1. `GenericButton` doesn't predict use cases (no `variant`, `size`, `color` props)
2. It provides **tools** (Button, track, style) not **solutions** (variants)
3. Adding a new use case **never requires changing GenericButton**
4. Composition is pay-as-you-go—simple cases stay simple

---

## Running the Demo

This project uses [Create React App](https://create-react-app.dev/) with React 16.8+ (Hooks support).

### Setup

With [npm](https://www.npmjs.com/):
```bash
npm install
npm start
```

Or with [Yarn](https://yarnpkg.com/):
```bash
yarn install
yarn start
```

### What to Observe

Open the browser console and interact with buttons. Notice:

1. **Tracking in action**: Every button click logs the callback to console
2. **Composition variety**: Some buttons use `Button`, some use `<input>`, some use `<p>`
3. **Style inheritance**: Each button spreads base styles and customizes as needed
4. **Activation behavior**: Toggle button enables/disables other buttons via shared state

### Code to Explore

| File | Demonstrates |
|------|-------------|
| `src/components/GenericButton.js` | Primitive exposure pattern |
| `src/components/Activable.js` | Middleware composition layer |
| `src/components/Input.js` | Complex composition with side effects |
| `src/components/Simple.js` | Style override composition |
| `src/components/CloseModal.js` | Style transformation composition |

---

## Conclusion: The Real Lesson

Swizec's article is right that **premature abstraction is dangerous**. Where it stops short is in recognizing that **the danger is in how you abstract, not whether you abstract.**

The configuration-based approach fails because it assumes you can predict flexibility needs:

```jsx
// This requires predicting the future
<GenericButton variant="?" size="?" color="?" disabled="?" />
```

The composition-based approach succeeds because it makes no predictions:

```jsx
// This provides tools for consumers to solve their own problems
<GenericButton>
  {({ Button, style, track }) => /* consumer decides */}
</GenericButton>
```

**The thesis:** DRY is not a footgun. Trying to anticipate flexibility through configuration is the footgun. The solution is to expose internal primitives for composition, allowing consumers to build their own solutions from your tools.

This codebase is a proof: you can have reusable components without prop explosion, brittle abstractions, or maintenance nightmares.

---

## Further Reading

### The Original Argument
- [Swizec: "DRY is a footgun, remember to YAGNI"](https://swizec.com/blog/dry-is-a-footgun-remember-to-yagni/) - The article this challenges

### Design Principles
- [DRY (Don't Repeat Yourself)](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) - Wikipedia
- [YAGNI (You Aren't Gonna Need It)](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it) - Wikipedia
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID) - Including Dependency Inversion

### React Patterns
- [React Documentation](https://react.dev/) - Official React docs
- [`React.createElement`](https://react.dev/reference/react/createElement) - Creating elements without JSX
- [React Hooks](https://react.dev/reference/react) - useState, useEffect, useCallback
- [Render Props](https://legacy.reactjs.org/docs/render-props.html) - Official pattern documentation
- [`displayName`](https://legacy.reactjs.org/docs/react-component.html#displayname) - Component naming for debugging
- [Kent C. Dodds: "Inversion of Control"](https://kentcdodds.com/blog/inversion-of-control) - Related composition patterns
- [Michael Jackson: "Never Write Another HoC"](https://www.youtube.com/watch?v=BcVAq3YFiuc) - Render props vs Higher-Order Components

### JavaScript Fundamentals
- [Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) - MDN
- [Rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters) - MDN

### Tools
- [Create React App](https://create-react-app.dev/) - Zero-config React setup
- [React DevTools](https://react.dev/learn/react-developer-tools) - Browser debugging extension
- [Mermaid](https://mermaid.js.org/) - Diagram rendering (used in architecture diagram)

---

**Built with:** [React](https://react.dev/) 16.8.6, [Create React App](https://create-react-app.dev/) 2.1.8

**License:** MIT
