import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      images: []
    };
    this.imageUpload = this.imageUpload.bind(this);
    this.imageRemove = this.imageRemove.bind(this);
  }

  imageUpload(e) {
    const { REACT_APP_CLIENT_ID } = process.env;
    const formData = new FormData();
    formData.append("type", "file");
    formData.append("image", e.target.files[0]);
    this.setState({ loading: true });
    fetch("https://api.imgur.com/3/upload.json", {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Client-ID ${REACT_APP_CLIENT_ID}`
      },
      body: formData
    })
      .then(result => result.json())
      .then(data => {
        this.setState({ loading: false });
        if (!data.success) return alert("실패");
        this.setState({ images: [...this.state.images, data.data] });
      });
  }

  imageRemove(deletehash) {
    const { REACT_APP_CLIENT_ID } = process.env;
    this.setState({ loading: true });
    fetch(`https://api.imgur.com/3/image/${deletehash}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Client-ID ${REACT_APP_CLIENT_ID}`
      }
    })
      .then(result => result.json())
      .then(data => {
        this.setState({ loading: false });
        if (!data.success) return alert("실패");
        this.setState({
          images: this.state.images.filter(i => i.deletehash !== deletehash)
        });
      });
  }

  render() {
    const { images, loading } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          {loading ? "true" : "false"}
          length : {images.length}
          <div>
            {images.length > 0
              ? images.map(i => {
                  return (
                    <>
                      <img
                        src={i.link}
                        onClick={() => this.imageRemove(i.deletehash)}
                      />
                    </>
                  );
                })
              : ""}
          </div>
          <form>
            <input
              type="file"
              className="input-image"
              onChange={this.imageUpload}
            />
          </form>
        </header>
      </div>
    );
  }
}

export default App;
