import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { BlogItem } from '../models/BlogItem'
import { UpdateBlogRequest } from '../requests/UpdateBlogRequest'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('BlogsAccess')

export class BlogsAccess {
    constructor(
      private readonly docClient: DocumentClient = createDynamoDBClient(),
      private readonly blogsTable = process.env.BLOGS_TABLE
    ) {}
  
    async getBlogItem(userId: string, blogId: string): Promise<BlogItem> {
      return (
        await this.docClient
          .get({
            TableName: this.blogsTable,
            Key: {
              userId,
              blogId
            }
          })
          .promise()
      ).Item as BlogItem
    }
  
    async getAllBlogs(userId: string): Promise<BlogItem[]> {
      logger.info('Getting all blogs')
      const result = await this.docClient
        .query({
          TableName: this.blogsTable,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId
          }
        })
        .promise()
  
      return result.Items as BlogItem[]
    }
  
    async createBlog(blogItem: BlogItem): Promise<BlogItem> {
      logger.info('Create a new blog')
      await this.docClient
        .put({
          TableName: this.blogsTable,
          Item: blogItem
        })
        .promise()
      return blogItem
    }
  
    async updateBlogItem(userId: string, blogId: string, blogUpdate: UpdateBlogRequest) {
      logger.info(`Updating blog ${blogId} with ${JSON.stringify(blogUpdate)}`)
      await this.docClient
        .update({
          TableName: this.blogsTable,
          Key: {
            userId,
            blogId
          },
          UpdateExpression: 'set #title = :title, content = :content',
          ExpressionAttributeNames: {
            '#title': 'title'
          },
          ExpressionAttributeValues: {
            ':title': blogUpdate.title,
            ':content': blogUpdate.content
          }
        })
        .promise()
    }
  
    async deleteBlogItem(userId: string, blogId: string) {
      logger.info(`deleting blog ${blogId}`)
      await this.docClient
        .delete({
          TableName: this.blogsTable,
          Key: {
            userId,
            blogId
          }
        })
        .promise()
    }
  
    async updateAttachmentUrl(userId: string, blogId: string, newUrl: string) {
      logger.info(
        `Updating ${newUrl} attachment URL for blog ${blogId} in table ${this.blogsTable}`
      )
  
      await this.docClient
        .update({
          TableName: this.blogsTable,
          Key: {
            userId,
            blogId
          },
          UpdateExpression: 'set attachmentUrl = :attachmentUrl',
          ExpressionAttributeValues: {
            ':attachmentUrl': newUrl
          }
        })
        .promise()
    }
  }
  
  function createDynamoDBClient(): DocumentClient {
    if (process.env.IS_OFFLINE) {
      logger.info('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
  }
  