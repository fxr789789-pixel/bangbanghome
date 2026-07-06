export type UserRole = "consumer" | "provider" | "hybrid";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location?: string;
  avatarUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface ServiceListing {
  id: string;
  title: string;
  categoryId: string;
  providerId: string;
  price: string;
  thumbnailUrl?: string;
}
