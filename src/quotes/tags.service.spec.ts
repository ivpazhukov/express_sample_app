import * as TagService from './tags.service'
import prismaMock from 'lib/__mocks__/prisma'
import randomColor from 'randomcolor'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('lib/prisma')
vi.mock('randomcolor', () => ({
  default: vi.fn(() => '#ffffff')
}))

describe('tags.service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('upsertTags', () => {
    it('should return a list of tagIds', async () => {
      prismaMock.$transaction.mockResolvedValueOnce([1, 2, 3])
      const tagIds = await TagService.upsertTags(['tag1', 'tag2', 'tag2'])
      expect(tagIds).toStrictEqual([1, 2, 3])
    })

    it('should only create tags that do not already exist', async () => {
      prismaMock.$transaction.mockImplementationOnce(callback =>
        callback(prismaMock)
      )

      // Mock the first invocation of `findMany`
      prismaMock.tag.findMany.mockResolvedValueOnce([
        { id: 1, name: 'tag1', color: '#ffffff' }
      ])

      // Mock the resolved value of `createMany` to avoid invoking the real function
      prismaMock.tag.createMany.mockResolvedValueOnce({ count: 0 })

      await TagService.upsertTags(['tag1', 'tag2', 'tag3'])

      // Ensure that onlt `'tag2'` and `'tag3'` are provided to `createMany`
      expect(prismaMock.tag.createMany).toHaveBeenCalledWith({
        data: [
          { name: 'tag2', color: undefined },
          { name: 'tag3', color: undefined }
        ]
      })
    })

    it('should give new tags random colors', async () => {
      prismaMock.$transaction.mockImplementationOnce(callback =>
        callback(prismaMock)
      )

      prismaMock.tag.findMany.mockResolvedValue([])
      prismaMock.tag.createMany.mockResolvedValueOnce({ count: 3 })

      await TagService.upsertTags(['tag1', 'tag2', 'tag3'])

      expect(randomColor).toHaveBeenCalledTimes(3)
    })

    it('should find and return new tagIds when creating tags', async () => {
      prismaMock.$transaction.mockImplementationOnce(callback =>
        callback(prismaMock)
      )

      // Mock the first invocation of `findMany`
      prismaMock.tag.findMany.mockResolvedValueOnce([
        { id: 1, name: 'tag1', color: '#ffffff' }
      ])

      prismaMock.tag.createMany.mockResolvedValueOnce({ count: 3 })
      prismaMock.tag.findMany.mockResolvedValueOnce([
        { id: 2, name: 'tag2', color: '#ffffff' },
        { id: 3, name: 'tag3', color: '#ffffff' }
      ])

      await TagService.upsertTags(['tag1', 'tag2', 'tag3'])

      expect(prismaMock.$transaction).toHaveReturnedWith([1, 2, 3])
    })

    it('should retunr an empty array if no tags passed', async () => {
      prismaMock.$transaction.mockImplementationOnce(callback =>
        callback(prismaMock)
      )

      prismaMock.tag.findMany.mockResolvedValueOnce([])
      prismaMock.tag.createMany.mockResolvedValueOnce({ count: 0 })
      prismaMock.tag.findMany.mockResolvedValueOnce([])

      await TagService.upsertTags([])

      expect(prismaMock.$transaction).toHaveReturnedWith([])
    })
  })
})
