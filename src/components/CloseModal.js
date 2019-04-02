import React from "react";
import { bool } from "prop-types";

import GenericButton from "components/GenericButton";

const CloseModal = ({ active }) => (
  <GenericButton onClick={() => window.alert("closeModal();")}>
    {({ Button, style }) => (
      <Button
        style={{
          ...style,
          fontSize: `${parseInt(style.fontSize, 10) / 2}px`,
          background: "orange"
        }}
        disabled={!active}
      >
        Close Modal
      </Button>
    )}
  </GenericButton>
);

CloseModal.propTypes = {
  active: bool
};

CloseModal.defaultProps = {
  active: true
};

export default CloseModal;
