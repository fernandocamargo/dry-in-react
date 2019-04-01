import React, { useCallback } from "react";
import { bool } from "prop-types";

import GenericButton from "components/GenericButton";

const CloseModal = ({ active }) => (
  <GenericButton onClick={() => window.alert("closeModal();")}>
    {useCallback(
      ({ Button, style }) => (
        <Button
          style={{
            ...style,
            fontSize: style.fontSize / 2,
            background: "green"
          }}
          disabled={!active}
        >
          Close Modal
        </Button>
      ),
      []
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
