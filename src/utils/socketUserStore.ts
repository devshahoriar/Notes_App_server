type SocketUser = {
  socketId: string
  name: string
  userId: string
  email: string
}

const socketUserStore = new Map<string, SocketUser>()

const getUserBySocketId = (socketId: string): SocketUser | undefined => {
  return socketUserStore.get(socketId)
}

const getUserByUserId = (userId: string): SocketUser | undefined => {
  for (const user of socketUserStore.values()) {
    if (user.userId === userId) {
      return user
    }
  }
  return undefined
}

const addUser = (
  socketId: string,
  userId: string,
  name: string,
  email: string
): void => {
  if (getUserByUserId(userId)) {
    return
  }
  socketUserStore.set(socketId, {
    socketId,
    userId,
    name,
    email,
  })
}

const removeUser = (socketId: string): boolean => {
  return socketUserStore.delete(socketId)
}

const getAllUsers = (): SocketUser[] => {
  return Array.from(socketUserStore.values())
}

export {
  addUser,
  getUserBySocketId,
  getUserByUserId,
  removeUser,
  getAllUsers,
  type SocketUser,
}
