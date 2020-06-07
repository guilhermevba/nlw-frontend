import React from "react";
import { Route, BrowserRouter } from "react-router-dom";
import Home from "./pages/home";
import CreatePoint from "./pages/createPoint";

const Routes = () => (
  <BrowserRouter>
    <Route component={Home} exact path="/" />
    <Route component={CreatePoint} path="/create-point" />
  </BrowserRouter>
);

export default Routes;
