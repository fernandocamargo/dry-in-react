import React, { useState, useEffect } from "react";

import GenericButton from "components/GenericButton";

const URL = "https://www.placecage.com/gif/180/180";

const createImage = src => Object.assign(new Image(), { src });

const Input = () => {
  const [loading, setLoading] = useState(true);
  const load = () => setLoading(false);

  useEffect(() => createImage(URL).addEventListener("load", load, true), []);

  return (
    <GenericButton>
      {({ track, style }) =>
        loading ? (
          <p style={{ ...style, border: "none", cursor: "default" }}>
            Loading image...
          </p>
        ) : (
          <input
            type="image"
            src={URL}
            alt="Image as button"
            onClick={track(() => window.alert("clickImage();"))}
            onMouseOver={track(() => "mouseOverImage();")}
            onMouseOut={track(() => "mouseOutImage();")}
            style={{ ...style, padding: "0" }}
          />
        )
      }
    </GenericButton>
  );
};

export default Input;
