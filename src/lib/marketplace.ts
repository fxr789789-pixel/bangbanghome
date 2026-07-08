import { initialRequests, providers as mockProviders } from "./mock-data";
import type { Database } from "./database.types";
import { supabase } from "./supabase";
import type { Gender, ServiceProvider, ServiceRequest } from "./types";

type RequestRow = Database["public"]["Tables"]["requests"]["Row"];
type ProfileRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "nickname" | "avatar_url" | "gender" | "city" | "provider_enabled" | "is_accepting_orders" | "credit_score"
>;
type ServiceRow = Pick<
  Database["public"]["Tables"]["services"]["Row"],
  "provider_id" | "title" | "description" | "category" | "city" | "price_amount" | "price_unit" | "qualification_verified" | "active"
>;

export type MarketplaceSnapshot = {
  requests: ServiceRequest[];
  providers: ServiceProvider[];
  source: "supabase" | "mock";
};

export async function loadMarketplaceSnapshot(): Promise<MarketplaceSnapshot> {
  if (!supabase) {
    return mockSnapshot();
  }

  const [requestsResult, profilesResult, servicesResult] = await Promise.all([
    supabase
      .from("requests")
      .select("id,title,description,service_address,appointment_at,budget_amount,preferred_gender,qualification_required,status,images")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("profiles")
      .select("id,nickname,avatar_url,gender,city,provider_enabled,is_accepting_orders,credit_score")
      .eq("provider_enabled", true)
      .limit(50),
    supabase
      .from("services")
      .select("provider_id,title,description,category,city,price_amount,price_unit,qualification_verified,active")
      .eq("active", true)
      .limit(100)
  ]);

  if (requestsResult.error || profilesResult.error || servicesResult.error) {
    return mockSnapshot();
  }

  const requestRows = (requestsResult.data ?? []) as RequestRow[];
  const profileRows = (profilesResult.data ?? []) as ProfileRow[];
  const serviceRows = (servicesResult.data ?? []) as ServiceRow[];

  const requests = requestRows.map((request): ServiceRequest => ({
    id: request.id,
    title: request.title,
    description: request.description,
    address: request.service_address,
    appointmentAt: request.appointment_at ? formatAppointment(request.appointment_at) : "待协商",
    budget: Number(request.budget_amount),
    genderRequirement: mapGender(request.preferred_gender),
    qualificationRequired: request.qualification_required,
    imageCount: request.images.length,
    status: request.status === "matched" ? "matched" : request.status === "closed" ? "closed" : "open"
  }));

  const serviceByProvider = new Map<string, ServiceRow[]>();
  for (const service of serviceRows) {
    serviceByProvider.set(service.provider_id, [...(serviceByProvider.get(service.provider_id) ?? []), service]);
  }

  const providers = profileRows.map((profile): ServiceProvider => {
    const services = serviceByProvider.get(profile.id) ?? [];
    const firstService = services[0];
    const nickname = profile.nickname || "帮帮师傅";

    return {
      id: profile.id,
      nickname,
      avatarUrl: profile.avatar_url || nickname.slice(0, 1),
      gender: profile.gender === "male" ? "male" : "female",
      city: profile.city || firstService?.city || "同城",
      skills: services.length > 0 ? services.map((service) => service.title) : ["生活服务"],
      bio: firstService?.description || "已通过平台基础审核，可提供同城服务。",
      priceLabel: firstService ? `¥${Number(firstService.price_amount)}/${firstService.price_unit}` : "价格面议",
      rating: 4.8,
      creditScore: profile.credit_score,
      providerEnabled: profile.provider_enabled,
      isAcceptingOrders: profile.is_accepting_orders,
      qualificationVerified: services.some((service) => service.qualification_verified)
    };
  });

  if (requests.length === 0 && providers.length === 0) {
    return mockSnapshot();
  }

  return {
    requests: requests.length > 0 ? requests : initialRequests,
    providers: providers.length > 0 ? providers : mockProviders,
    source: "supabase"
  };
}

function mockSnapshot(): MarketplaceSnapshot {
  return {
    requests: initialRequests,
    providers: mockProviders,
    source: "mock"
  };
}

function mapGender(gender: "female" | "male" | "unknown" | null): Gender {
  if (gender === "female" || gender === "male") {
    return gender;
  }

  return "any";
}

function formatAppointment(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
