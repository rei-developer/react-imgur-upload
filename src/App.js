import React from 'react'
import {
  Form,
  FormGroup,
  Label,
  CustomInput,
  Button
} from 'reactstrap'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'

class App extends React.Component {
  state = {
    loading: false,
    images: [],
    selectedImageDeletehash: ''
  }

  imageUpload = async e => {
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
      const name = files[index].name
      console.log(`${index}번째 이미지 (${name}) 업로드 성공!`)
      this.setState({
        images: [
          ...this.state.images,
          {
            name,
            link: data.data.link,
            deletehash: data.data.deletehash
          }
        ],
        selectedImageDeletehash: data.data.deletehash
      })
    } else {
      console.log(`${index}번째 이미지 업로드 실패...`)
    }
    if (index === files.length - 1) return this.setState({ loading: false })
    await this.imageUploadToImgur(files, index + 1)
  }

  imageRemove = async deletehash => {
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

    console.log(this.state.images.filter((item, index) => index === 0)[0].deletehash)

    const newDeletehash = this.state.images.length > 0 ? this.state.images.filter((item, index) => index === 0)[0].deletehash : ''
    this.setState({
      images: this.state.images.filter(i => i.deletehash !== deletehash),
      selectedImageDeletehash: newDeletehash
    })
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

  setselectedImageDeletehash = e => {
    this.setState({ selectedImageDeletehash: e.target.value })
  }

  selectedImageRemove = async () => {
    const { selectedImageDeletehash } = this.state
    if (selectedImageDeletehash === '') return console.log('선택된게 없네?')
    await this.imageRemove(selectedImageDeletehash)
  }

  render() {
    const { images, loading } = this.state
    return (
      <div className='App'>
        loading : {loading ? 'true' : 'false'}
        <br />
        length : {images.length}
        <br />
        <div>
          {images.length > 0
            ? images.map(i => {
              return (
                <img src={i.link} />
              )
            })
            : ''}
        </div>
        <br />
        <Form>
          <FormGroup>
            <Label for='fileBrowser'>File (Up to 10MB)</Label>
            <CustomInput
              type='file'
              multiple='multiple'
              id='fileBrowser'
              label='이곳에 이미지를 올려보세요!'
              onChange={this.imageUpload}
            />
          </FormGroup>
          {images.length > 0 ? (
            <>
              <FormGroup>
                <Label for='filesList'>Custom Multiple Select</Label>
                <CustomInput
                  type='select'
                  id='filesList'
                  value={this.state.selectedImageDeletehash}
                  onChange={this.setselectedImageDeletehash}
                >
                  {images.map(i => {
                    return (
                      <option value={i.deletehash}>{i.name}</option>
                    )
                  })}
                </CustomInput>
              </FormGroup>
              <Button
                className='mr-2'
                onClick={this.selectedImageRemove}
              >
                선택 이미지 삭제
              </Button>
            </>
          ) : ''}
          <Button
            color='danger'
            onClick={this.imageRemoveAll}
          >
            이미지 전부 삭제
          </Button>
        </Form>
      </div>
    )
  }
}

export default App