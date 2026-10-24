import { apiClient, handleApiError } from "@/lib/api-client";
import type { Lead, LeadListItem, LeadStatus, PaginatedResponse } from "@/types/api";

export interface LeadListParams {
  skip?: number;
  limit?: number;
  status?: LeadStatus | "all";
  source?: string;
}

export interface LeadUpdatePayload {
  status?: LeadStatus;
  notes?: string;
  itinerary_sent?: boolean;
}

export const leadService = {
  async list(params: LeadListParams = {}): Promise<PaginatedResponse<LeadListItem>> {
    try {
      const { status, source, ...rest } = params;
      const apiParams: Record<string, any> = { ...rest };
      if (status && status !== "all") {
        apiParams.status = status;
      }
      if (source) {
        apiParams.source = source;
      }

      const response = await apiClient.get<PaginatedResponse<LeadListItem>>(
        "/api/v1/leads",
        { params: apiParams }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getById(id: number): Promise<Lead> {
    try {
      const response = await apiClient.get<Lead>(`/api/v1/leads/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async update(id: number, data: LeadUpdatePayload): Promise<Lead> {
    try {
      const response = await apiClient.put<Lead>(`/api/v1/leads/${id}`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async markItinerarySent(id: number): Promise<Lead> {
    try {
      const response = await apiClient.patch<Lead>(
        `/api/v1/leads/${id}/itinerary-sent`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/v1/leads/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

