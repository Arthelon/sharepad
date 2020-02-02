import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import EditorContainer from "./components/EditorContainer";
import Landing from "./components/Landing";
// programId="tb8s3OaA"

function App() {
    return (
        <Router>
            <Switch>
                <Route exact path="/">
                    <Landing />
                </Route>
                <Route path="/program/:programId">
                    <EditorContainer />;
                </Route>
            </Switch>
        </Router>
    );
}
export default App;
