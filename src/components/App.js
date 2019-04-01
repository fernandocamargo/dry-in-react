import React from "react";

import Button from "components/Button";
import ClickMe from "components/ClickMe";
import CloseModal from "components/CloseModal";
import Image from "components/Image";

export default () => (
  <div>
    <Button />
    <ClickMe />
    <CloseModal active={false} />
    <Image />
  </div>
);
