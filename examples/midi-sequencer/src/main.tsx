import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Wrapper from "./Wrapper";
import { WithMidi } from "./WithMidi";

ReactDOM.render(
  <React.StrictMode>
    <WithMidi>
      <Wrapper />
    </WithMidi>
  </React.StrictMode>,
  document.getElementById("root")
);
