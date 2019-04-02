import React, { useCallback, createElement } from "react";
import { oneOfType, node, func } from "prop-types";

const isComponent = object => typeof object === "function";

const identify = component =>
  Object.assign(component, { displayName: "Custom(GenericButton)" });

const stringify = callback =>
  String(callback)
    .replace(/\r?\n|\r/g, "")
    .replace(/\s+/g, " ");

const print = string =>
  console.log(
    `Your callback %c${string}%c was triggered`,
    "background-color: red; color: white; font-weight: bold; padding: 5px;",
    "background-color: inherit; color: inherit; font-weight: inherit; padding: inherit;"
  );

const track = callback =>
  useCallback(
    (...params) => print(stringify(callback)) || callback(...params),
    [callback]
  );

const style = {
  border: "solid 1px black",
  borderRadius: "5px",
  cursor: "pointer",
  display: "block",
  fontSize: "20px",
  margin: "20px 0",
  padding: "10px"
};

const GenericButton = ({ children, onClick, ...enhancement }) => {
  const Button = props => (
    <button
      onClick={track(onClick)}
      style={style}
      {...props}
      {...enhancement}
    />
  );
  const pieces = { Button, track, style };

  return isComponent(children)
    ? createElement(identify(children), pieces)
    : createElement(Button, { children });
};

GenericButton.propTypes = {
  children: oneOfType([node, func]).isRequired,
  onClick: func
};

export default GenericButton;
