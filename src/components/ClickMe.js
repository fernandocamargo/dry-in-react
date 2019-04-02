import React from "react";

import GenericButton from "components/GenericButton";

const ClickMe = () => (
  <GenericButton onClick={() => window.alert("closePage();")}>
    {({ Button, style }) => (
      <Button style={{ ...style, background: "blue" }}>ClickMe</Button>
    )}
  </GenericButton>
);

export default ClickMe;
