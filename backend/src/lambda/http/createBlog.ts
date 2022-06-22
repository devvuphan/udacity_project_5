import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateBlogRequest } from '../../requests/CreateBlogRequest'
import { getUserId } from '../utils';
import { createBlog } from '../../businessLogic/blogs'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    
    const newBlog: CreateBlogRequest = JSON.parse(event.body)

    const newItem = await createBlog(getUserId(event), newBlog);

    return {
      statusCode: 201,
      body: JSON.stringify({item: newItem})
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
