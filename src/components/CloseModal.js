import React from "react";

import Activable from "components/Activable";

const CloseModal = ({ active }) => (
  <Activable onClick={() => window.alert("closeModal();")} active={active}>
    {({ Button, style }) => (
      <Button
        style={{
          ...style,
          fontSize: `${parseInt(style.fontSize, 10) / 2}px`,
          background: "orange"
        }}
      >
        Close Modal
      </Button>
    )}
  </Activable>
);

export default CloseModal;
