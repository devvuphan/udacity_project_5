import dateFormat from 'dateformat'
import { History } from 'history'
import * as React from 'react'
import {
  Button,
  List,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createBlog, deleteBlog, getBlogs } from '../api/blogs-api'
import Auth from '../auth/Auth'
import { Blog } from '../types/Blog'

interface BlogsProps {
  auth: Auth
  history: History
}

interface BlogsState {
  blogs: Blog[]
  newBlogTitle: string
  newBlogContent: string
  loadingBlogs: boolean
}

export class Blogs extends React.PureComponent<BlogsProps, BlogsState> {
  state: BlogsState = {
    blogs: [],
    newBlogTitle: '',
    newBlogContent: '',
    loadingBlogs: true
  }

  handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBlogTitle: event.target.value })
  }

  handleContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBlogContent: event.target.value })
  }

  onEditButtonClick = (blogId: string) => {
    this.props.history.push(`/blogs/${blogId}/edit`)
  }

  // = async (event: React.ChangeEvent<HTMLButtonElement>) =>
  onBlogCreate = async () => {
    try {

      if (!this.state.newBlogTitle.trim()) {
        alert('Blog creation failed. Please input Blog title')
        return
      }

      if (!this.state.newBlogContent.trim()) {
        alert('Blog creation failed. Please input Blog content')
        return
      }

      const newBlog = await createBlog(this.props.auth.getIdToken(), {
        title: this.state.newBlogTitle,
        content: this.state.newBlogContent
      })
      this.setState({
        blogs: [...this.state.blogs, newBlog],
        newBlogTitle: '',
        newBlogContent: ''
      })
    } catch {
      alert('Blog creation failed')
    }
  }

  onBlogDelete = async (blogId: string) => {
    try {
      await deleteBlog(this.props.auth.getIdToken(), blogId)
      this.setState({
        blogs: this.state.blogs.filter(blog => blog.blogId !== blogId)
      })
    } catch {
      alert('Blog deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const blogs = await getBlogs(this.props.auth.getIdToken())
      this.setState({
        blogs,
        loadingBlogs: false
      })
    } catch (e) {
      alert(`Failed to fetch blogs`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1" style = {{marginTop: 20}}>Create a blog</Header>

        {this.renderCreateBlogInput()}

        <Header as="h1" style = {{marginTop: 40}}>Your blogs</Header>

        {this.renderBlogs()}
      </div>
    )
  }

  renderCreateBlogInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            fluid
            actionPosition="left"
            placeholder="New blog title"
            onChange={this.handleTitleChange}
          />
          <Input
            fluid
            actionPosition="left"
            placeholder="New blog content"
            style={{marginTop: 10}}
            onChange={this.handleContentChange}
          />

          <Button onClick={() => this.onBlogCreate()} size="huge" color="olive" style={{marginTop: 10}}>
            <Icon name="add" />
            Add new blog
          </Button>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderBlogs() {
    if (this.state.loadingBlogs) {
      return this.renderLoading()
    }

    return this.renderBlogsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Blogs
        </Loader>
      </Grid.Row>
    )
  }

  renderBlogsList() {
    return (
      <List>
        {this.state.blogs.map((blog, pos) => {
            return (
              <div key={blog.blogId} style={{marginTop: 20}}>
                {blog.attachmentUrl && (
                    <Image src={blog.attachmentUrl} size="small" wrapped />
                  )}
                <div style={{marginTop: 10}}>
                  <h3>{blog.title}</h3>
                </div>
                <div style={{marginTop: 10}}>
                  {blog.content}
                </div>
                <div key={blog.blogId} style={{marginTop: 10}}>
                  <Button
                    icon
                    color="blue"
                    onClick={() => this.onEditButtonClick(blog.blogId)}
                  >
                    <Icon name="pencil" />
                  </Button>
                  <Button
                    icon
                    color="red"
                    style={{marginTop: 10}}
                    onClick={() => this.onBlogDelete(blog.blogId)}
                  >
                    <Icon name="delete" />
                  </Button>
                </div>
                <Divider />
              </div>
            )
          })}
    </List>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
