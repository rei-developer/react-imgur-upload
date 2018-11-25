import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      images: []
    }
    this.imageUpload = this.imageUpload.bind(this)
    this.imageRemove = this.imageRemove.bind(this)
  }

  imageUpload = async (e) => {
    this.setState({ loading: true })
    let files = []
    for (const file of e.target.files)
      files.push(file)
    await this.imageUploadToImgur(files)
  }

  imageUploadToImgur = async (files, index = 0) => {
    const { REACT_APP_CLIENT_ID } = process.env
    const formData = new FormData()
    formData.append('type', 'file')
    formData.append('image', files[index])
    const response = await fetch('https://api.imgur.com/3/upload.json', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Client-ID ${REACT_APP_CLIENT_ID}`
      },
      body: formData
    })
    const data = await response.json()
    if (data.success) {
      console.log(`${index}번째 이미지 업로드 성공!`)
      this.setState({ images: [...this.state.images, { link: data.data.link, deletehash: data.data.deletehash }] })
    } else {
      console.log(`${index}번째 이미지 업로드 실패...`)
    }
    if (index === files.length - 1) return this.setState({ loading: false })
    await this.imageUploadToImgur(files, index + 1)
  }

  imageRemove = async (deletehash) => {
    const { REACT_APP_CLIENT_ID } = process.env
    this.setState({ loading: true })
    const response = await fetch(`https://api.imgur.com/3/image/${deletehash}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: `Client-ID ${REACT_APP_CLIENT_ID}`
      }
    })
    const data = await response.json()
    this.setState({ loading: false })
    if (!data.success) return console.log('이미지 삭제 실패...')
    this.setState({ images: this.state.images.filter(i => i.deletehash !== deletehash) })
  }

  imageRemoveAll = async () => {
    const { REACT_APP_CLIENT_ID } = process.env
    this.setState({ loading: true })
    const promise = this.state.images.map((item) => {
      return fetch(`https://api.imgur.com/3/image/${item.deletehash}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          Authorization: `Client-ID ${REACT_APP_CLIENT_ID}`
        }
      })
        .then(() => {
          return item.deletehash
        })
    })
    Promise.all(promise)
      .then(data => {
        data.map(deletehash => this.setState({ images: this.state.images.filter(i => i.deletehash !== deletehash) }))
      })
      .then(() => {
        this.setState({ loading: false })
      })
  }

  render() {
    const { images, loading } = this.state
    return (
      <div className='App'>
        <header className='App-header'>
          <img src={logo} className='App-logo' alt='logo' />
          {loading ? 'true' : 'false'}
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
                )
              })
              : ''}
          </div>
          <form>
            <input
              type='file'
              multiple='multiple'
              className='input-image'
              onChange={this.imageUpload}
            />
          </form>
          <button onClick={this.imageRemoveAll}>이미지 전부 삭제</button>
        </header>
      </div>
    )
  }
}

export default App