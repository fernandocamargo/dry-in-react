import React, { Fragment } from "react";

import GenericButton from "components/GenericButton";
import Simple from "components/Simple";
import ClickMe from "components/ClickMe";
import CloseModal from "components/CloseModal";
import Input from "components/Input";

const App = () => (
  <Fragment>
    <GenericButton onClick={() => window.alert("nonCustomized();")}>
      Non-customized
    </GenericButton>
    <Simple />
    <ClickMe />
    <CloseModal active={false} />
    <Input />
  </Fragment>
);

export default App;
