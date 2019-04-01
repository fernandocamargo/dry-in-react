import React, { useCallback } from "react";
import { bool } from "prop-types";

import GenericButton from "components/GenericButton";

const Button = ({ active }) => (
  <GenericButton onClick={() => window.alert("openCart();")}>
    {useCallback(
      ({ Button, style }) => (
        <Button style={{ ...style, background: "green" }} disabled={!active}>
          Button
        </Button>
      ),
      []
    )}
  </GenericButton>
);

Button.propTypes = {
  active: bool
};

Button.defaultProps = {
  active: true
};

export default Button;
