export type RealnameStatus = "pending" | "verified" | "rejected";
export type Gender = "female" | "male" | "any";
export type OrderStatus =
  | "pending"
  | "accepted"
  | "processing"
  | "completed"
  | "cancelled"
  | "dispute";

export type Profile = {
  id: string;
  phone: string;
  nickname: string;
  avatarUrl: string;
  gender: Exclude<Gender, "any">;
  city: string;
  role: "user" | "provider" | "admin";
  realnameStatus: RealnameStatus;
  providerEnabled: boolean;
  isAcceptingOrders: boolean;
  creditScore: number;
};

export type ServiceProvider = {
  id: string;
  nickname: string;
  avatarUrl: string;
  gender: Exclude<Gender, "any">;
  city: string;
  skills: string[];
  bio: string;
  priceLabel: string;
  rating: number;
  creditScore: number;
  providerEnabled: boolean;
  isAcceptingOrders: boolean;
  qualificationVerified: boolean;
};

export type ServiceRequest = {
  id: string;
  title: string;
  description: string;
  address: string;
  appointmentAt: string;
  budget: number;
  genderRequirement: Gender;
  qualificationRequired: boolean;
  imageCount: number;
  status: "open" | "matched" | "closed";
};

export type Order = {
  id: string;
  requestTitle: string;
  customerName: string;
  providerName: string;
  status: OrderStatus;
  amount: number;
  platformFeeRate: number;
};
