import React, { useCallback } from "react";

import GenericButton from "components/GenericButton";

export default () => (
  <GenericButton onClick={() => window.alert("closePage();")}>
    {useCallback(
      ({ Button, style }) => (
        <Button style={{ ...style, background: "blue" }}>ClickMe</Button>
      ),
      []
    )}
  </GenericButton>
);
