/* eslint-disable no-unused-vars */

/* eslint-disable @typescript-eslint/no-unused-vars */
import * as TagService from './tags.service'
import prismaMock from 'lib/__mocks__/prisma'
import randomColor from 'randomcolor'
import { beforeEach, describe, vi } from 'vitest'

vi.mock('lib/prisma')
vi.mock('randomcolor', () => ({
  default: vi.fn(() => '#ffffff')
}))

describe('tags.service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })
})
