import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

// Re-instantiate in development to catch schema/type updates instantly
const prisma = prismaClientSingleton()

export { prisma }
export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma