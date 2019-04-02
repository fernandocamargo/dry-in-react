import React, { useState, Fragment } from "react";

import GenericButton from "components/GenericButton";
import Simple from "components/Simple";
import ClickMe from "components/ClickMe";
import CloseModal from "components/CloseModal";
import Input from "components/Input";

const App = () => {
  const [active, setActive] = useState(false);
  const toggleActiveness = () => setActive(current => !current);

  return (
    <Fragment>
      <GenericButton onClick={toggleActiveness}>
        Toggle buttons <strong>activeness</strong>
      </GenericButton>
      <Simple active={active} />
      <ClickMe />
      <CloseModal active={active} />
      <Input />
    </Fragment>
  );
};

export default App;
