import React, { createElement } from "react";
import { bool } from "prop-types";

import GenericButton from "components/GenericButton";

const identify = component =>
  Object.assign(component, { displayName: "Custom(Activable)" });

const Activable = ({ onClick, children, active }) => (
  <GenericButton onClick={onClick} disabled={!active}>
    {props => createElement(identify(children), props)}
  </GenericButton>
);

Activable.propTypes = {
  active: bool
};

Activable.defaultProps = {
  active: true
};

export default Activable;
