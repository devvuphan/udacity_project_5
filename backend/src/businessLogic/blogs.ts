import { BlogsAccess } from '../dataLayer/blogsAcess'
import { AttachmentUtils } from '../fileStorage/attachmentUtils';
import { BlogItem } from '../models/BlogItem'
import { CreateBlogRequest } from '../requests/CreateBlogRequest'
import { UpdateBlogRequest } from '../requests/UpdateBlogRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

const logger = createLogger('blogs')

const blogsAccess = new BlogsAccess()
const attachmentUtil = new AttachmentUtils()

export async function getBlogs(userId: string) {
  logger.info(`Retrieving all blogs for user ${userId}`, { userId })
  return await blogsAccess.getAllBlogs(userId)
}

export async function createBlog(
  userId: string,
  createBlogRequest: CreateBlogRequest
): Promise<BlogItem> {
  const blogId = uuid.v4()

  const newItem: BlogItem = {
    userId,
    blogId,
    createdAt: new Date().toISOString(),
    attachmentUrl: null,
    ...createBlogRequest
  }

  await blogsAccess.createBlog(newItem)

  return newItem
}

async function checkBlog(userId: string, blogId: string) {
  const existItem = await blogsAccess.getBlogItem(userId, blogId)
  if (!existItem) {
    throw new createError.NotFound(`Blog with id: ${blogId} not found`)
  }

  if (existItem.userId !== userId) {
    throw new createError.BadRequest('User not authorized to update item')
  }
}

export async function updateBlog(
  userId: string,
  blogId: string,
  updateRequest: UpdateBlogRequest
) {
  await checkBlog(userId, blogId)

  blogsAccess.updateBlogItem(userId, blogId, updateRequest)
}

export async function deleteBlog(userId: string, blogId: string) {
  await checkBlog(userId, blogId)

  blogsAccess.deleteBlogItem(userId, blogId)
}

export async function updateAttachmentUrl(
  userId: string,
  blogId: string,
  attachmentId: string
) {
  await checkBlog(userId, blogId)

  const url = await attachmentUtil.getAttachmentUrl(attachmentId)

  await blogsAccess.updateAttachmentUrl(userId, blogId, url)
}

export async function generateAttachmentUrl(id: string): Promise<string> {
  return await attachmentUtil.getUploadUrl(id)
}
