import React from "react";

import Activable from "components/Activable";

const Simple = ({ active }) => (
  <Activable onClick={() => window.alert("openCart();")} active={active}>
    {({ Button, style }) => (
      <Button style={{ ...style, background: "green" }}>Button</Button>
    )}
  </Activable>
);

export default Simple;
