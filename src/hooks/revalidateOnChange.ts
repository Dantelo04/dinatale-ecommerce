import { revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

export const revalidateCollectionAfterChange =
  (...tags: string[]): CollectionAfterChangeHook =>
  ({ doc, collection }) => {
    revalidateTag(collection.slug)
    tags.forEach((tag) => revalidateTag(tag))
    return doc
  }

export const revalidateCollectionAfterDelete =
  (...tags: string[]): CollectionAfterDeleteHook =>
  ({ doc, collection }) => {
    revalidateTag(collection.slug)
    tags.forEach((tag) => revalidateTag(tag))
    return doc
  }

export const revalidateGlobalAfterChange =
  (...tags: string[]): GlobalAfterChangeHook =>
  ({ doc, global }) => {
    revalidateTag(global.slug)
    tags.forEach((tag) => revalidateTag(tag))
    return doc
  }
