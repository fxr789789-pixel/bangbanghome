import type { Order, Profile, ServiceProvider, ServiceRequest } from "./types";

export const currentProfile: Profile = {
  id: "profile_demo_user",
  phone: "13800008888",
  nickname: "林小满",
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
    skills: ["水电维修", "灯具安装", "门锁调试"],
    bio: "8 年社区维修经验，工具齐全，响应快，适合晚间急修和小件安装。",
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
    skills: ["收纳整理", "深度保洁", "陪诊协助"],
    bio: "细致可靠，擅长家庭整理和医院陪诊，服务记录稳定。",
    priceLabel: "¥68/小时",
    rating: 4.8,
    creditScore: 97,
    providerEnabled: true,
    isAcceptingOrders: true,
    qualificationVerified: false
  },
  {
    id: "provider_yu",
    nickname: "俞护师",
    avatarUrl: "俞",
    gender: "female",
    city: "杭州",
    skills: ["老人护理", "康复陪护", "取药陪同"],
    bio: "持证护理员，支持跨区预约，擅长术后陪护和康复提醒。",
    priceLabel: "¥128/小时",
    rating: 4.95,
    creditScore: 99,
    providerEnabled: true,
    isAcceptingOrders: false,
    qualificationVerified: true
  },
  {
    id: "provider_luo",
    nickname: "罗同学",
    avatarUrl: "罗",
    gender: "male",
    city: "上海",
    skills: ["跑腿代办", "数码协助", "陪聊天"],
    bio: "沟通耐心，熟悉同城路线，可帮取送文件、设置手机和线上陪伴。",
    priceLabel: "¥39 起",
    rating: 4.7,
    creditScore: 94,
    providerEnabled: true,
    isAcceptingOrders: true,
    qualificationVerified: false
  }
];

export const initialRequests: ServiceRequest[] = [
  {
    id: "request_cleaning",
    title: "周六上午两小时深度收纳",
    description: "衣柜换季整理，需要自带基础收纳工具，希望女性师傅优先。",
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
    description: "老式水龙头接口漏水，希望今晚处理，需要有维修经验。",
    address: "上海市静安区南京西路 1266 号",
    appointmentAt: "今天 19:30",
    budget: 120,
    genderRequirement: "any",
    qualificationRequired: true,
    imageCount: 2,
    status: "open"
  },
  {
    id: "request_chat",
    title: "晚上线上陪聊半小时",
    description: "想找人轻松聊聊天，普通生活话题即可，不涉及违规内容。",
    address: "上海市浦东新区世纪大道附近",
    appointmentAt: "今天 21:00",
    budget: 45,
    genderRequirement: "any",
    qualificationRequired: false,
    imageCount: 0,
    status: "open"
  }
];

export const initialOrder: Order = {
  id: "order_demo_001",
  requestTitle: "厨房水龙头漏水维修",
  customerName: "林小满",
  providerName: "陈师傅",
  status: "pending",
  amount: 100,
  platformFeeRate: 0.1
};
