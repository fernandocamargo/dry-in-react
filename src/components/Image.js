import React, { useState, useEffect, useCallback } from "react";

import GenericButton from "components/GenericButton";

const URL = "https://www.placecage.com/gif/180/180";

const createImage = src => Object.assign(new Image(), { src });

export default () => {
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => setLoading(false), []);

  useEffect(() => createImage(URL).addEventListener("load", load, true), []);

  return (
    <GenericButton>
      {useCallback(
        ({ track, style }) =>
          loading ? (
            <span style={style}>Loading image...</span>
          ) : (
            <input
              type="image"
              src={URL}
              alt="Image as button"
              onClick={track(() => window.alert("clickImage();"))}
              onMouseOver={track(() => window.alert("mouseOverImage();"))}
              onMouseOut={track(() => window.alert("mouseOutImage();"))}
            />
          ),
        [loading]
      )}
    </GenericButton>
  );
};
