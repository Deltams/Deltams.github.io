import React, { Component } from "react";
import { Container } from "react-bootstrap";
import Markdown from "react-markdown";
import READMEPath from "./README.md";

export default class Documentation extends Component {
  constructor(props) {
    super(props);

    this.state = { documentation: null };
  }

  componentDidMount() {
    fetch(READMEPath)
      .then((response) => response.text())
      .then((text) => {
        console.log(text);
        this.setState({ documentation: text });
      });
  }

  render() {
    return (
      <div>
        <h1>Documentation</h1>
        <Container
          className="justify-content-center align-items-center"
          style={{ height: "110vh", marginTop:"15px" }}
        >
          <Markdown>{this.state.documentation}</Markdown>
        </Container>
      </div>
    );
  }
}
