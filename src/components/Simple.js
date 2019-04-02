import React from "react";
import { bool } from "prop-types";

import GenericButton from "components/GenericButton";

const Simple = ({ active }) => {
  const Customization = ({ Button, style }) => (
    <Button style={{ ...style, background: "green" }} disabled={!active}>
      Button
    </Button>
  );

  return (
    <GenericButton onClick={() => window.alert("openCart();")}>
      {Customization}
    </GenericButton>
  );
};

Simple.propTypes = {
  active: bool
};

Simple.defaultProps = {
  active: true
};

export default Simple;
