import React from "react";

import GenericButton from "components/GenericButton";
import Button from "components/Button";
import ClickMe from "components/ClickMe";
import CloseModal from "components/CloseModal";
import Image from "components/Image";

export default () => (
  <div>
    <GenericButton onClick={() => window.alert("nonCustomized();")}>
      Simple as possible
    </GenericButton>
    <Button />
    <ClickMe />
    <CloseModal active={false} />
    <Image />
  </div>
);
