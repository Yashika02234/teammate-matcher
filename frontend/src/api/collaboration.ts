import apiClient from './client';

export interface CollaborationRequestCreate {
  request_type: 'teammate' | 'project_join';
  receiver_id: string;
  project_id?: string;
  message?: string;
}

export interface CollaborationRequestOut extends CollaborationRequestCreate {
  request_id: string;
  sender_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface RoomOut {
  room_id: string;
  members: string[];
  project_id?: string;
  created_at: string;
}

export interface MessageCreate {
  text: string;
}

export interface MessageOut extends MessageCreate {
  message_id: string;
  room_id: string;
  sender_id: string;
  timestamp: string;
}

// -------------------------------------------------------------
// REST Calls
// -------------------------------------------------------------

// Requests
export async function createRequest(data: CollaborationRequestCreate): Promise<CollaborationRequestOut> {
  const { data: res } = await apiClient.post<CollaborationRequestOut>('/requests', data);
  return res;
}

export async function getIncomingRequests(): Promise<CollaborationRequestOut[]> {
  const { data: res } = await apiClient.get<CollaborationRequestOut[]>('/requests/incoming');
  return res;
}

export async function getSentRequests(): Promise<CollaborationRequestOut[]> {
  const { data: res } = await apiClient.get<CollaborationRequestOut[]>('/requests/sent');
  return res;
}

export async function acceptRequest(reqId: string): Promise<{ message: string, room_id: string }> {
  const { data: res } = await apiClient.patch<{ message: string, room_id: string }>(`/requests/${reqId}/accept`);
  return res;
}

export async function rejectRequest(reqId: string): Promise<{ message: string }> {
  const { data: res } = await apiClient.patch<{ message: string }>(`/requests/${reqId}/reject`);
  return res;
}

// Rooms
export async function getRooms(): Promise<RoomOut[]> {
  const { data: res } = await apiClient.get<RoomOut[]>('/rooms');
  return res;
}

export async function getRoomDetails(roomId: string): Promise<RoomOut> {
  const { data: res } = await apiClient.get<RoomOut>(`/rooms/${roomId}`);
  return res;
}

// Messages
export async function getRoomMessages(roomId: string): Promise<MessageOut[]> {
  const { data: res } = await apiClient.get<MessageOut[]>(`/rooms/${roomId}/messages`);
  return res;
}

export async function sendMessage(roomId: string, text: string): Promise<MessageOut> {
  const { data: res } = await apiClient.post<MessageOut>(`/rooms/${roomId}/messages`, { text });
  return res;
}
