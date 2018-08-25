# container-carousel

This is the source code for the NPM package, 'container-carousel'. This NPM package contains a single exported component named `Carousel`, which renders a carousel - or horizontally spanning slider for content - to the virtual DOM. Children nodes to this component are rendered side-by-side and can be viewed by swiping between them via touch or mouse or using the arrow keys.

#### Usage:

```javascript
import * as React from 'react';
import { Carousel } from 'container-carousel';

export const App = props => {
  return (
    <Carousel>
      <p>Slide 1</p>
      <p>Slide 2</p>
      <p>Slide 3</p>
    </Carousel>
  );
};
```
