import React, { useCallback, createElement } from "react";
import { oneOfType, node, func } from "prop-types";

const isComponent = object => typeof object === "function";

const stringify = callback =>
  String(callback)
    .replace(/\r?\n|\r/g, "")
    .replace(/\s+/g, " ");

const print = string =>
  console.log(
    `Your callback %c${string}%c was triggered`,
    "background-color: #353740; color: #a6e22e; font-weight: bold; padding: 5px;",
    "background-color: inherit; color: inherit; font-weight: inherit; padding: inherit;"
  );

const track = callback =>
  useCallback(
    (...params) => print(stringify(callback)) || callback(...params),
    [callback]
  );

const GenericButton = ({ children, onClick }) => {
  const style = { fontSize: 20 };
  const Button = useCallback(
    props => <button onClick={track(onClick)} style={style} {...props} />,
    []
  );

  return isComponent(children)
    ? createElement(children, { Button, track, style })
    : createElement(Button, { children });
};

GenericButton.propTypes = {
  children: oneOfType([node, func]).isRequired,
  onClick: func
};

export default GenericButton;