import type { Order, Profile, ServiceProvider, ServiceRequest } from "./types";

export const currentProfile: Profile = {
  id: "profile_demo_user",
  phone: "13800008888",
  nickname: "林小雨",
  avatarUrl: "林",
  gender: "female",
  city: "上海",
  role: "user",
  realnameStatus: "pending",
  providerEnabled: true,
  isAcceptingOrders: true,
  creditScore: 96
};

export const providers: ServiceProvider[] = [
  {
    id: "provider_chen",
    nickname: "陈师傅",
    avatarUrl: "陈",
    gender: "male",
    city: "上海",
    skills: ["水电维修", "灯具安装"],
    bio: "8 年社区维修经验，工具齐全，响应快。",
    priceLabel: "¥89 起",
    rating: 4.9,
    creditScore: 98,
    providerEnabled: true,
    isAcceptingOrders: true,
    qualificationVerified: true
  },
  {
    id: "provider_meng",
    nickname: "孟阿姨",
    avatarUrl: "孟",
    gender: "female",
    city: "上海",
    skills: ["收纳整理", "陪诊协助"],
    bio: "细致可靠，擅长家庭整理和医院陪诊。",
    priceLabel: "¥68/小时",
    rating: 4.8,
    creditScore: 97,
    providerEnabled: true,
    isAcceptingOrders: true,
    qualificationVerified: false
  },
  {
    id: "provider_yu",
    nickname: "俞护理",
    avatarUrl: "俞",
    gender: "female",
    city: "杭州",
    skills: ["老人护理", "康复陪护"],
    bio: "持证护理员，支持跨区预约。",
    priceLabel: "¥128/小时",
    rating: 4.95,
    creditScore: 99,
    providerEnabled: true,
    isAcceptingOrders: false,
    qualificationVerified: true
  }
];

export const initialRequests: ServiceRequest[] = [
  {
    id: "request_cleaning",
    title: "周六上午两小时深度收纳",
    description: "衣柜换季整理，需自带基础收纳工具。",
    address: "上海市徐汇区漕溪北路 88 号",
    appointmentAt: "明天 10:00",
    budget: 160,
    genderRequirement: "female",
    qualificationRequired: false,
    imageCount: 3,
    status: "open"
  },
  {
    id: "request_repair",
    title: "厨房水龙头漏水维修",
    description: "老式水龙头接口漏水，希望今晚处理。",
    address: "上海市静安区南京西路 1266 号",
    appointmentAt: "今天 19:30",
    budget: 120,
    genderRequirement: "any",
    qualificationRequired: true,
    imageCount: 2,
    status: "open"
  }
];

export const initialOrder: Order = {
  id: "order_demo_001",
  requestTitle: "厨房水龙头漏水维修",
  customerName: "林小雨",
  providerName: "陈师傅",
  status: "pending",
  amount: 100,
  platformFeeRate: 0.1
};
