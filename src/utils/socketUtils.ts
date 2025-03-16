import { io } from '../index';


export const emitToAll = (event: string, data: any) => {
  io.emit(event, data);
};


export const emitToClient = (socketId: string, event: string, data: any) => {
  io.to(socketId).emit(event, data);
};



