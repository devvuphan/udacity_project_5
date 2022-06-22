import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getBlogs } from '../../businessLogic/blogs'
import { getUserId } from '../utils';

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    
    const todos = await getBlogs(getUserId(event))

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
    }
  })
handler.use(
  cors({
    credentials: true
  })
)
