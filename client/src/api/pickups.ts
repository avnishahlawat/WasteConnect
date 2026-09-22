import { api } from '../lib/axios';
import type { ApiResponse, PickupRequest, PickupEvent } from '../types';

export interface CreatePickupDto {
  wasteCategory: string;
  estimatedQuantity: number;
  unit: 'kg' | 'bags' | 'liters' | 'items';
  address: string;
  coordinates: [number, number];
  serviceArea: string;
  preferredDate: string;
  timeSlot: 'MORNING' | 'AFTERNOON' | 'EVENING';
  notes?: string;
  photos?: string[];
}

export interface FeedbackDto {
  rating: number;
  punctualityRating?: number;
  professionalismRating?: number;
  qualityRating?: number;
  comment?: string;
}

export const pickupsApi = {
  // Citizen
  requestPickup: (data: CreatePickupDto) =>
    api.post<ApiResponse<PickupRequest>>('/citizen/pickups', data),

  getCitizenPickups: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<PickupRequest[]>>('/citizen/pickups', { params }),

  getPickupDetail: (id: string) =>
    api.get<ApiResponse<{ pickup: PickupRequest; events: PickupEvent[]; feedback?: unknown }>>(`/citizen/pickups/${id}`),

  cancelPickup: (id: string, reason?: string) =>
    api.put<ApiResponse<PickupRequest>>(`/citizen/pickups/${id}/cancel`, { reason }),

  submitFeedback: (id: string, data: FeedbackDto) =>
    api.post<ApiResponse<unknown>>(`/citizen/pickups/${id}/feedback`, data),

  // Collector
  getAvailablePickups: (params?: { serviceArea?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<PickupRequest[]>>('/collector/available-pickups', { params }),

  getCollectorPickups: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<PickupRequest[]>>('/collector/pickups', { params }),

  acceptPickup: (id: string) =>
    api.post<ApiResponse<PickupRequest>>(`/collector/pickups/${id}/accept`),

  startPickup: (id: string) =>
    api.post<ApiResponse<PickupRequest>>(`/collector/pickups/${id}/start`),

  completePickup: (id: string, data: { actualQuantity: number; collectorNotes?: string }) =>
    api.post<ApiResponse<PickupRequest>>(`/collector/pickups/${id}/complete`, data),

  updateAvailability: (availability: string) =>
    api.put<ApiResponse<unknown>>('/collector/availability', { availability }),

  getCollectorHistory: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<PickupRequest[]>>('/collector/history', { params }),

  // AI assistant preview
  classifyWasteAi: (description: string) =>
    api.post<ApiResponse<{ predictedCategory: string; confidence: number; suggestedAction?: string; disposalGuidance?: string; explanation: string }>>(
      '/citizen/ai/classify-waste',
      { description }
    ),
};
