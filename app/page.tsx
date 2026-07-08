"use client";

import {
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Eye,
  Gift,
  Heart,
  History,
  Home,
  IdCard,
  ImagePlus,
  LifeBuoy,
  LockKeyhole,
  MapPin,
  Megaphone,
  MessageCircle,
  PackageCheck,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  UserRound,
  UsersRound,
  WalletCards,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BrandLogo, LogoMark } from "@/components/brand-logo";
import { currentProfile, initialOrder, initialRequests, providers } from "@/lib/mock-data";
import { loadMarketplaceSnapshot, type MarketplaceSnapshot } from "@/lib/marketplace";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { Gender, OrderStatus, RealnameStatus, ServiceProvider, ServiceRequest } from "@/lib/types";

type Tab = "home" | "demands" | "masters" | "orders" | "profile";
type VerifyStep = "info" | "face" | "success";
type PanelKind =
  | "feature"
  | "aiPublish"
  | "publishConfirm"
  | "providerDetail"
  | "providerOnboarding"
  | "qualification"
  | "chat"
  | "payment"
  | "refund"
  | "report"
  | "admin";

type Panel = {
  kind: PanelKind;
  title: string;
  detail?: string;
  items?: string[];
  provider?: ServiceProvider;
};

type ServiceCategory = {
  name: string;
  ordinary: string[];
  professional: string[];
};

const serviceCategories: ServiceCategory[] = [
  { name: "家政保洁", ordinary: ["日常保洁", "深度清洁", "收纳整理", "做饭备餐"], professional: [] },
  { name: "维修安装", ordinary: ["家具安装", "灯具安装", "小件维修"], professional: ["电工维修", "燃气维修", "专业家电维修"] },
  { name: "跑腿代办", ordinary: ["取送文件", "代排队", "代买代送", "同城递送"], professional: [] },
  { name: "陪诊护理", ordinary: ["陪诊挂号", "取药陪同", "康复陪护"], professional: ["医疗护理"] },
  { name: "搬家拉货", ordinary: ["小件搬运", "搬家协助", "货物装卸"], professional: ["高空作业"] },
  { name: "学习培训", ordinary: ["作业辅导", "语言陪练", "技能教学"], professional: [] },
  { name: "生活陪伴", ordinary: ["陪聊天", "陪散步", "陪购物", "老人聊天", "线上娱乐陪伴"], professional: [] },
  { name: "宠物照看", ordinary: ["上门喂养", "遛宠陪伴", "宠物清洁"], professional: [] },
  { name: "美容美甲", ordinary: ["美甲", "化妆造型", "形象整理"], professional: [] },
  { name: "运动健身", ordinary: ["陪跑", "拉伸放松", "健身搭子"], professional: ["专业私教"] },
  { name: "数码协助", ordinary: ["手机设置", "电脑清理", "网络调试"], professional: [] },
  { name: "安全开锁", ordinary: [], professional: ["开锁", "换锁", "智能门锁安装"] }
];

const professionalSkills = new Set(serviceCategories.flatMap((category) => category.professional));

const homeBanners = [
  { eyebrow: "新人安心服务", title: "实名师傅，服务留痕", detail: "地址分段展示、订单内沟通、售后可追溯。" },
  { eyebrow: "AI 智能发布", title: "一句话说需求，自动分到类目", detail: "自动推荐预算、时间、资质和筛选条件。" },
  { eyebrow: "看资料再下单", title: "形象照、资质、评价集中查看", detail: "先看真实服务记录，再决定是否预约。" }
];

const orderStatusMeta: Record<OrderStatus, { label: string; tone: string; next?: string }> = {
  pending: { label: "待接单", tone: "bg-amber/15 text-[#9a640f]", next: "师傅接单" },
  accepted: { label: "已接单", tone: "bg-mint/15 text-[#08785c]", next: "开始服务" },
  processing: { label: "服务中", tone: "bg-ink/10 text-ink", next: "完成订单" },
  completed: { label: "待评价", tone: "bg-mint/20 text-[#08785c]" },
  cancelled: { label: "已取消", tone: "bg-slate-200 text-slate-600" },
  dispute: { label: "售后中", tone: "bg-coral/15 text-[#a83f3d]" }
};

const realnameMeta: Record<RealnameStatus, { label: string; tone: string }> = {
  pending: { label: "待实名", tone: "bg-amber/15 text-[#9a640f]" },
  verified: { label: "已实名", tone: "bg-mint/15 text-[#08785c]" },
  rejected: { label: "认证失败", tone: "bg-coral/15 text-[#a83f3d]" }
};

const genderLabel: Record<Gender, string> = {
  any: "不限",
  female: "女性",
  male: "男性"
};

const orderSteps: OrderStatus[] = ["pending", "accepted", "processing", "completed"];

export default function BangBangDemo() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [showSplash, setShowSplash] = useState(true);
  const [realnameStatus, setRealnameStatus] = useState<RealnameStatus>("pending");
  const [verifyStep, setVerifyStep] = useState<VerifyStep>("info");
  const [showRealnameModal, setShowRealnameModal] = useState(false);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [expandedHomeCategories, setExpandedHomeCategories] = useState(false);
  const [demandCategory, setDemandCategory] = useState(serviceCategories[0].name);
  const [masterCategory, setMasterCategory] = useState(serviceCategories[0].name);
  const [requests, setRequests] = useState<ServiceRequest[]>(initialRequests);
  const [providerList, setProviderList] = useState<ServiceProvider[]>(providers);
  const [dataSource, setDataSource] = useState<MarketplaceSnapshot["source"]>("mock");
  const [selectedRequestId, setSelectedRequestId] = useState(initialRequests[0].id);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(initialOrder.status);
  const [providerReady, setProviderReady] = useState(false);
  const [qualifiedSkills, setQualifiedSkills] = useState<string[]>(["电工维修", "医疗护理"]);

  const selectedRequest = requests.find((request) => request.id === selectedRequestId) ?? requests[0];
  const visibleHomeCategories = expandedHomeCategories ? serviceCategories : serviceCategories.slice(0, 8);
  const providerIncome = initialOrder.amount * (1 - initialOrder.platformFeeRate);

  const filteredRequests = useMemo(() => {
    const filtered = requests.filter((request) => inferCategory(request).name === demandCategory);
    return filtered.length > 0 ? filtered : requests;
  }, [demandCategory, requests]);

  const sortedProviders = useMemo(() => [...providerList].sort((left, right) => right.creditScore - left.creditScore), [providerList]);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setBannerIndex((current) => (current + 1) % homeBanners.length), 3600);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (showSplash) return;
    if (window.localStorage.getItem("bangbang-realname-verified") === "true") {
      setRealnameStatus("verified");
      return;
    }
    setShowRealnameModal(true);
  }, [showSplash]);

  useEffect(() => {
    let cancelled = false;
    loadMarketplaceSnapshot().then((snapshot) => {
      if (cancelled) return;
      setRequests(snapshot.requests);
      setProviderList(snapshot.providers);
      setDataSource(snapshot.source);
      setSelectedRequestId(snapshot.requests[0]?.id ?? initialRequests[0].id);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const completeFaceVerify = () => {
    window.localStorage.setItem("bangbang-realname-verified", "true");
    setRealnameStatus("verified");
    setVerifyStep("success");
    window.setTimeout(() => setShowRealnameModal(false), 700);
  };

  const openCategory = (category: string, target: "demands" | "masters" = "demands") => {
    if (target === "demands") {
      setDemandCategory(category);
      setActiveTab("demands");
      return;
    }
    setMasterCategory(category);
    setActiveTab("masters");
  };

  const publishDemand = (request: ServiceRequest) => {
    setRequests((current) => [request, ...current]);
    setDemandCategory(inferCategory(request).name);
    setSelectedRequestId(request.id);
    setPanel({ kind: "publishConfirm", title: "发布成功" });
  };

  const acceptDemand = (request: ServiceRequest) => {
    const category = inferCategory(request);
    const requiredSkill = category.professional[0];
    if (!providerReady) {
      setPanel({ kind: "providerOnboarding", title: "首次接单资料" });
      return;
    }
    if (requiredSkill && !qualifiedSkills.includes(requiredSkill)) {
      setPanel({ kind: "qualification", title: "资质认证", detail: requiredSkill });
      return;
    }
    setRequests((current) => current.map((item) => (item.id === request.id ? { ...item, status: "matched" } : item)));
    setSelectedRequestId(request.id);
    setOrderStatus("accepted");
    setActiveTab("orders");
  };

  const orderProvider = (provider: ServiceProvider) => {
    const request: ServiceRequest = {
      id: `request_provider_${Date.now()}`,
      title: `预约${provider.nickname}上门服务`,
      description: `已选择${provider.skills[0]}，等待师傅确认时间。`,
      address: `${provider.city}市同城附近`,
      appointmentAt: "今天 18:30",
      budget: Number(provider.priceLabel.match(/\d+/)?.[0] ?? 100),
      genderRequirement: provider.gender,
      qualificationRequired: provider.qualificationVerified,
      imageCount: 0,
      status: "matched"
    };
    setRequests((current) => [request, ...current]);
    setSelectedRequestId(request.id);
    setOrderStatus("pending");
    setActiveTab("orders");
    setPanel(null);
  };

  const advanceOrder = () => {
    const nextStatus = orderSteps[orderSteps.indexOf(orderStatus) + 1];
    if (nextStatus) {
      setOrderStatus(nextStatus);
      return;
    }
    setPanel(makeFeaturePanel("服务评价", "订单完成后双方互评，评价会影响信用分和推荐排序。", ["星级评分", "评价照片", "服务标签"]));
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-paper shadow-soft">
      <SplashScreen visible={showSplash} onSkip={() => setShowSplash(false)} />
      <RealnameModal visible={showRealnameModal} step={verifyStep} onNext={() => setVerifyStep("face")} onComplete={completeFaceVerify} />
      <AppPanel
        panel={panel}
        onClose={() => setPanel(null)}
        onPublish={publishDemand}
        onProviderReady={() => {
          setProviderReady(true);
          setPanel(null);
        }}
        onQualified={(skill) => {
          setQualifiedSkills((current) => Array.from(new Set([...current, skill])));
          setPanel(null);
        }}
        onOrderProvider={orderProvider}
      />

      <header className="sticky top-0 z-20 border-b border-ink/10 bg-paper/95 px-5 pb-3 pt-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <BrandLogo />
          <div className="flex items-center gap-2">
            <StatusPill label={isSupabaseConfigured && dataSource === "supabase" ? "实时数据" : "预览数据"} tone="bg-ink text-white" />
            <IconButton label="通知" onClick={() => setPanel(makeFeaturePanel("消息通知", "订单、实名、售后和系统安全提醒集中展示。", ["师傅已接单", "资质审核通过", "优惠券即将过期"]))}>
              <Bell size={18} />
            </IconButton>
          </div>
        </div>
      </header>

      <section className="flex-1 space-y-4 overflow-y-auto px-4 py-4 pb-28">
        {activeTab === "home" && (
          <>
            <SearchBar onClick={() => setPanel(makeFeaturePanel("搜索服务", "搜索需求、师傅、类目和资质。", ["关键词搜索", "城市距离筛选", "资质状态筛选"]))} />
            <HomeBanner index={bannerIndex} onSelect={setBannerIndex} />
            <HomeCategoryGrid categories={visibleHomeCategories} expanded={expandedHomeCategories} onToggle={() => setExpandedHomeCategories((value) => !value)} onOpen={(category) => openCategory(category, "demands")} />
            <section className="grid grid-cols-2 gap-3">
              <QuickAction icon={<Sparkles size={22} />} label="AI 发布需求" detail="自动分类和筛选" onClick={() => setPanel({ kind: "aiPublish", title: "AI 发布需求" })} />
              <QuickAction icon={<UsersRound size={22} />} label="找师傅" detail="看资料再下单" onClick={() => setActiveTab("masters")} />
            </section>
            <SectionHeader title="高分师傅" action="评价、资质、形象照可查看" />
            <div className="space-y-3">
              {sortedProviders.slice(0, 3).map((provider) => (
                <ProviderCard key={provider.id} provider={provider} onOpen={() => setPanel({ kind: "providerDetail", title: "师傅主页", provider })} />
              ))}
            </div>
          </>
        )}

        {activeTab === "demands" && (
          <DemandHall
            category={demandCategory}
            requests={filteredRequests}
            onCategory={setDemandCategory}
            onFilter={() => setPanel(makeFilterPanel("需求智能筛选"))}
            onAiPublish={() => setPanel({ kind: "aiPublish", title: "AI 发布需求" })}
            onDetail={(request) => setPanel(makeDemandPanel(request))}
            onAccept={acceptDemand}
          />
        )}

        {activeTab === "masters" && (
          <MasterHall
            category={masterCategory}
            providers={sortedProviders}
            onCategory={setMasterCategory}
            onFilter={() => setPanel(makeFilterPanel("师傅智能筛选"))}
            onOpen={(provider) => setPanel({ kind: "providerDetail", title: "师傅主页", provider })}
          />
        )}

        {activeTab === "orders" && (
          <OrderCenter
            request={selectedRequest}
            status={orderStatus}
            income={providerIncome}
            onAdvance={advanceOrder}
            onChat={() => setPanel({ kind: "chat", title: "订单聊天" })}
            onPayment={() => setPanel({ kind: "payment", title: "确认支付" })}
            onRefund={() => {
              setOrderStatus("dispute");
              setPanel({ kind: "refund", title: "退款售后" });
            }}
            onReport={() => setPanel({ kind: "report", title: "举报投诉" })}
            onTab={(tab) => setPanel(makeFeaturePanel(`订单-${tab}`, "按状态查看交易、售后和评价进度。", ["订单筛选", "状态进度", "相关操作"]))}
          />
        )}

        {activeTab === "profile" && (
          <ProfileCenter realnameStatus={realnameStatus} providerReady={providerReady} qualifiedSkills={qualifiedSkills} onVerify={() => setShowRealnameModal(true)} onPanel={setPanel} />
        )}
      </section>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </main>
  );
}

function SplashScreen({ visible, onSkip }: { visible: boolean; onSkip: () => void }) {
  if (!visible) return null;
  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center bg-mint px-8 text-white">
      <button onClick={onSkip} className="absolute right-5 top-5 rounded-full border border-white/25 px-3 py-1.5 text-xs font-bold text-white/80">跳过</button>
      <div className="relative flex flex-col items-center text-center">
        <div className="splash-mark scale-[1.8]"><LogoMark /></div>
        <h1 className="mt-12 text-5xl font-black">帮帮</h1>
        <p className="mt-6 text-lg font-bold text-white/90">有事找帮帮</p>
      </div>
    </section>
  );
}

function RealnameModal({ visible, step, onNext, onComplete }: { visible: boolean; step: VerifyStep; onNext: () => void; onComplete: () => void }) {
  if (!visible) return null;
  return (
    <section className="fixed inset-0 z-40 flex items-end bg-ink/45 px-4 pb-4 pt-16 backdrop-blur-sm sm:items-center">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-5 shadow-soft">
        {step === "info" && (
          <>
            <ModalTitle icon={<IdCard size={26} />} eyebrow="首次注册需完成" title="实名认证" />
            <p className="mt-3 text-sm leading-6 text-ink/65">请先填写实名信息，再进入人脸识别。证件信息不会公开展示，仅用于平台安全核验。</p>
            <div className="mt-5 space-y-3">
              <FormLabel label="真实姓名"><input className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-3 outline-none focus:border-mint" defaultValue="林小满" /></FormLabel>
              <FormLabel label="身份证号"><input className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-3 outline-none focus:border-mint" defaultValue="310***********0426" /></FormLabel>
              <label className="flex cursor-pointer items-start gap-2 text-sm text-ink/65"><input type="checkbox" defaultChecked className="mt-1" /><span>我同意用于实名认证和人脸核验。</span></label>
            </div>
            <button onClick={onNext} className="mt-5 w-full rounded-xl bg-mint py-3 font-bold text-white">下一步：人脸识别</button>
          </>
        )}
        {step === "face" && (
          <>
            <ModalTitle icon={<Camera size={26} />} eyebrow="第二步" title="人脸识别" />
            <div className="mt-5 rounded-2xl bg-ink p-5 text-center text-white">
              <div className="mx-auto grid h-28 w-28 place-items-center rounded-full border-4 border-mint/80 bg-white/10"><UserRound size={54} /></div>
              <p className="mt-4 text-sm font-bold text-white/80">请正对镜头，按提示完成活体检测</p>
            </div>
            <p className="mt-4 rounded-xl bg-paper p-3 text-sm leading-6 text-ink/65">预览版不调用真实摄像头，正式版需接入合规人脸核验接口。</p>
            <button onClick={onComplete} className="mt-5 w-full rounded-xl bg-mint py-3 font-bold text-white">开始识别</button>
          </>
        )}
        {step === "success" && (
          <div className="py-8 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mint text-white"><CheckCircle2 size={34} /></div>
            <h2 className="mt-4 text-2xl font-black">认证完成</h2>
            <p className="mt-2 text-sm text-ink/60">以后进入首页不再自动弹出。</p>
          </div>
        )}
      </div>
    </section>
  );
}

function HomeBanner({ index, onSelect }: { index: number; onSelect: (index: number) => void }) {
  const banner = homeBanners[index];
  return (
    <section className="relative overflow-hidden rounded-3xl bg-mint p-5 text-white shadow-soft">
      <div className="absolute -right-7 -top-7 h-28 w-28 rounded-full bg-white/15" />
      <div className="absolute bottom-3 right-5 grid h-20 w-20 place-items-center rounded-3xl bg-white/15">
        <LogoMark />
      </div>
      <p className="text-xs font-black text-white/75">{banner.eyebrow}</p>
      <h2 className="mt-2 max-w-[14rem] text-2xl font-black leading-tight">{banner.title}</h2>
      <p className="mt-3 max-w-[15rem] text-sm leading-6 text-white/82">{banner.detail}</p>
      <div className="mt-5 flex gap-1.5">
        {homeBanners.map((item, itemIndex) => (
          <button key={item.title} onClick={() => onSelect(itemIndex)} className={`h-1.5 rounded-full ${itemIndex === index ? "w-8 bg-white" : "w-2 bg-white/40"}`} aria-label={`切换广告 ${itemIndex + 1}`} />
        ))}
      </div>
    </section>
  );
}

function HomeCategoryGrid({ categories, expanded, onToggle, onOpen }: { categories: ServiceCategory[]; expanded: boolean; onToggle: () => void; onOpen: (category: string) => void }) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">
      <SectionHeader title="热门服务" action="点击进入分类需求" />
      <div className="mt-4 grid grid-cols-4 gap-3">
        {categories.map((category) => (
          <button key={category.name} onClick={() => onOpen(category.name)} className="group text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-mint/10 text-sm font-black text-mint group-active:scale-95">{category.name.slice(0, 2)}</div>
            <p className="mt-2 text-xs font-black text-ink/75">{category.name}</p>
          </button>
        ))}
      </div>
      <button onClick={onToggle} className="mt-4 w-full rounded-xl bg-paper py-3 text-sm font-black text-mint">{expanded ? "收起分类" : "展开更多服务"}</button>
    </section>
  );
}

function DemandHall({ category, requests, onCategory, onFilter, onAiPublish, onDetail, onAccept }: { category: string; requests: ServiceRequest[]; onCategory: (category: string) => void; onFilter: () => void; onAiPublish: () => void; onDetail: (request: ServiceRequest) => void; onAccept: (request: ServiceRequest) => void }) {
  return (
    <div className="space-y-4">
      <PageTitle title="需求大厅" detail="所有需求集中在这里，左侧按服务分类查看。" action="AI 发布" onAction={onAiPublish} />
      <FilterBar labels={["距离最近", "预算合适", "资质要求", "预约时间"]} onClick={onFilter} />
      <PrivacyNotice />
      <div className="flex gap-3">
        <CategoryRail selected={category} onSelect={onCategory} />
        <div className="min-w-0 flex-1 space-y-3">
          {requests.map((request) => (
            <DemandCard key={request.id} request={request} onDetail={() => onDetail(request)} onAccept={() => onAccept(request)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MasterHall({ category, providers, onCategory, onFilter, onOpen }: { category: string; providers: ServiceProvider[]; onCategory: (category: string) => void; onFilter: () => void; onOpen: (provider: ServiceProvider) => void }) {
  return (
    <div className="space-y-4">
      <PageTitle title="师傅导航" detail="按服务分类和信用筛选，进入主页后可下单。" action="筛选" onAction={onFilter} />
      <FilterBar labels={["信用分优先", "接单中", "已实名", "有资质证明"]} onClick={onFilter} />
      <div className="flex gap-3">
        <CategoryRail selected={category} onSelect={onCategory} />
        <div className="min-w-0 flex-1 space-y-3">
          {providers.map((provider) => <ProviderCard key={provider.id} provider={provider} onOpen={() => onOpen(provider)} />)}
        </div>
      </div>
    </div>
  );
}

function OrderCenter({ request, status, income, onAdvance, onChat, onPayment, onRefund, onReport, onTab }: { request: ServiceRequest; status: OrderStatus; income: number; onAdvance: () => void; onChat: () => void; onPayment: () => void; onRefund: () => void; onReport: () => void; onTab: (tab: string) => void }) {
  return (
    <div className="space-y-4">
      <PageTitle title="订单中心" detail="查看进行中、待支付、售后和评价。" />
      <div className="grid grid-cols-4 gap-2">
        {["全部", "进行中", "售后", "评价"].map((item) => <button key={item} onClick={() => onTab(item)} className="rounded-xl bg-white py-3 text-xs font-black shadow-sm">{item}</button>)}
      </div>
      <section className="rounded-3xl bg-white p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black text-mint">订单 {initialOrder.id}</p>
            <h2 className="mt-2 text-xl font-black">{request.title}</h2>
          </div>
          <StatusPill label={orderStatusMeta[status].label} tone={orderStatusMeta[status].tone} />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <MiniInfo label="订单金额" value={`¥${initialOrder.amount}`} />
          <MiniInfo label="师傅收入" value={`¥${income.toFixed(0)}`} />
          <MiniInfo label="平台服务费" value="10%" />
        </div>
        <div className="mt-5 space-y-2">
          {orderSteps.map((step, index) => (
            <div key={step} className="flex items-center gap-3">
              <div className={`grid h-7 w-7 place-items-center rounded-full text-xs font-black ${orderSteps.indexOf(status) >= index ? "bg-mint text-white" : "bg-paper text-ink/40"}`}>{index + 1}</div>
              <span className="text-sm font-bold">{orderStatusMeta[step].label}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button onClick={onChat} className="rounded-xl bg-paper py-3 font-black">联系对方</button>
          <button onClick={onPayment} className="rounded-xl bg-mint py-3 font-black text-white">去支付</button>
          <button onClick={onRefund} className="rounded-xl bg-paper py-3 font-black">退款售后</button>
          <button onClick={onReport} className="rounded-xl bg-paper py-3 font-black">举报投诉</button>
        </div>
        <button onClick={onAdvance} className="mt-3 w-full rounded-xl bg-ink py-3 font-black text-white">{orderStatusMeta[status].next ?? "去评价"}</button>
      </section>
    </div>
  );
}

function ProfileCenter({ realnameStatus, providerReady, qualifiedSkills, onVerify, onPanel }: { realnameStatus: RealnameStatus; providerReady: boolean; qualifiedSkills: string[]; onVerify: () => void; onPanel: (panel: Panel) => void }) {
  const entries = [
    ["我的钱包", WalletCards],
    ["推广入口", Megaphone],
    ["退款售后", LifeBuoy],
    ["浏览记录", History],
    ["卡券", Gift],
    ["我的收藏", Heart]
  ] as const;

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-ink p-5 text-white shadow-soft">
        <div className="flex items-center gap-3">
          <FaceAvatar label={currentProfile.avatarUrl} large />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-black">{currentProfile.nickname}</h2>
            <p className="mt-1 text-sm text-white/65">{maskPhone(currentProfile.phone)} · 信用分 {currentProfile.creditScore}</p>
          </div>
          <StatusPill label={realnameMeta[realnameStatus].label} tone={realnameMeta[realnameStatus].tone} />
        </div>
        <button onClick={onVerify} className="mt-5 w-full rounded-xl bg-white/12 py-3 font-black text-white">查看/更新实名认证</button>
      </section>
      <section className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">
        <SectionHeader title="接单工作台" action={providerReady ? "已开启" : "未完善"} />
        <div className="mt-4 grid grid-cols-3 gap-2">
          <MiniInfo label="接单状态" value={providerReady ? "可接单" : "待完善"} />
          <MiniInfo label="技能认证" value={`${qualifiedSkills.length} 项`} />
          <MiniInfo label="本月收入" value="¥860" />
        </div>
        <button onClick={() => onPanel({ kind: "providerOnboarding", title: "首次接单资料" })} className="mt-4 w-full rounded-xl bg-mint py-3 font-black text-white">完善技能资料</button>
      </section>
      <div className="grid grid-cols-3 gap-3">
        {entries.map(([label, Icon]) => <MiniEntry key={label} icon={<Icon size={20} />} label={label} onClick={() => onPanel(makeFeaturePanel(label, "个人中心功能入口，后续接入真实数据。", featureItems(label)))} />)}
      </div>
      <section className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">
        <SectionHeader title="安全与管理" />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <QuickLine icon={<ShieldCheck size={18} />} label="隐私安全中心" onClick={() => onPanel(makeFeaturePanel("隐私安全中心", "管理地址、头像、人脸照、资质证明和数据授权。", ["地址隐私", "人脸照片权限", "聊天留痕"]))} />
          <QuickLine icon={<LockKeyhole size={18} />} label="后台审核入口" onClick={() => onPanel({ kind: "admin", title: "后台审核" })} />
        </div>
      </section>
    </div>
  );
}

function AppPanel({ panel, onClose, onPublish, onProviderReady, onQualified, onOrderProvider }: { panel: Panel | null; onClose: () => void; onPublish: (request: ServiceRequest) => void; onProviderReady: () => void; onQualified: (skill: string) => void; onOrderProvider: (provider: ServiceProvider) => void }) {
  if (!panel) return null;
  if (panel.kind === "aiPublish") return <AiPublishPanel onClose={onClose} onPublish={onPublish} />;
  if (panel.kind === "publishConfirm") return <FeaturePanel title="发布成功" detail="需求已进入需求大厅，师傅可以浏览并接单。" items={["智能分类完成", "地址已隐私处理", "等待师傅接单"]} onClose={onClose} />;
  if (panel.kind === "providerDetail" && panel.provider) return <ProviderDetailPanel provider={panel.provider} onClose={onClose} onOrder={() => onOrderProvider(panel.provider as ServiceProvider)} />;
  if (panel.kind === "providerOnboarding") return <ProviderOnboardingPanel onClose={onClose} onReady={onProviderReady} />;
  if (panel.kind === "qualification") return <QualificationPanel skill={panel.detail ?? "专业技能"} onClose={onClose} onQualified={onQualified} />;
  if (panel.kind === "chat") return <ChatPanel onClose={onClose} />;
  if (panel.kind === "payment") return <PaymentPanel onClose={onClose} />;
  if (panel.kind === "refund") return <RefundPanel onClose={onClose} />;
  if (panel.kind === "report") return <ReportPanel onClose={onClose} />;
  if (panel.kind === "admin") return <AdminPanel onClose={onClose} />;
  return <FeaturePanel title={panel.title} detail={panel.detail ?? ""} items={panel.items ?? []} onClose={onClose} />;
}

function AiPublishPanel({ onClose, onPublish }: { onClose: () => void; onPublish: (request: ServiceRequest) => void }) {
  const [text, setText] = useState("今晚想找人帮我修一下厨房水龙头，最好能带工具，预算 120 左右");
  const category = smartCategory(text);
  const skill = category.professional[0];
  const request: ServiceRequest = {
    id: `request_ai_${Date.now()}`,
    title: text.includes("聊天") ? "线上陪聊天" : `${category.name}需求`,
    description: text,
    address: "上海市徐汇区附近",
    appointmentAt: "今天 20:00",
    budget: text.includes("120") ? 120 : 100,
    genderRequirement: "any",
    qualificationRequired: Boolean(skill),
    imageCount: 0,
    status: "open"
  };
  return (
    <BottomSheet title="AI 发布需求" onClose={onClose}>
      <div className="space-y-4">
        <FormLabel label="描述你的需求"><textarea value={text} onChange={(event) => setText(event.target.value)} className="mt-2 min-h-28 w-full rounded-xl border border-ink/10 px-3 py-3 outline-none focus:border-mint" /></FormLabel>
        <div className="rounded-2xl bg-mint/10 p-4">
          <p className="text-sm font-black text-mint">智能识别结果</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <MiniInfo label="分类" value={category.name} />
            <MiniInfo label="预算" value={`¥${request.budget}`} />
            <MiniInfo label="资质" value={skill ? skill : "无需资质"} />
            <MiniInfo label="隐私" value="地址模糊展示" />
          </div>
        </div>
        <button onClick={() => onPublish(request)} className="w-full rounded-xl bg-mint py-3 font-black text-white">确认发布</button>
      </div>
    </BottomSheet>
  );
}

function ProviderDetailPanel({ provider, onClose, onOrder }: { provider: ServiceProvider; onClose: () => void; onOrder: () => void }) {
  return (
    <BottomSheet title="师傅主页" onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-3xl bg-ink p-5 text-white">
          <div className="flex items-center gap-3">
            <FaceAvatar label={provider.avatarUrl} large />
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-black">{provider.nickname}</h2>
              <p className="mt-1 text-sm text-white/65">{provider.city} · {genderLabel[provider.gender]} · 信用 {provider.creditScore}</p>
            </div>
            <StatusPill label={provider.isAcceptingOrders ? "接单中" : "休息"} tone={provider.isAcceptingOrders ? "bg-mint/20 text-white" : "bg-white/15 text-white"} />
          </div>
          <p className="mt-4 text-sm leading-6 text-white/75">{provider.bio}</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <MiniInfo label="评分" value={`${provider.rating}`} />
          <MiniInfo label="价格" value={provider.priceLabel} />
          <MiniInfo label="实名" value="已通过" />
        </div>
        <PanelBlock title="形象照">
          <div className="grid grid-cols-3 gap-2">
            {["服务照", "生活照", "证件照"].map((item) => <div key={item} className="grid aspect-square place-items-center rounded-2xl bg-paper text-xs font-black text-ink/50">{item}</div>)}
          </div>
        </PanelBlock>
        <PanelBlock title="资质与技能">
          <div className="flex flex-wrap gap-2">
            <Badge label="实名认证" />
            {provider.qualificationVerified && <Badge label="资质通过" />}
            {provider.skills.map((skill) => <Badge key={skill} label={skill} muted />)}
          </div>
          <p className="mt-3 rounded-xl bg-paper p-3 text-sm text-ink/65">技能证明对客户可见，专业技能需后台审核后接单。</p>
        </PanelBlock>
        <PanelBlock title="用户评价">
          <PanelList items={["准时到达，沟通很好，工具齐全。", "照片和本人一致，服务过程很安心。", "有问题会提前确认，价格透明。"]} />
        </PanelBlock>
        <button onClick={onOrder} className="w-full rounded-xl bg-mint py-3 font-black text-white">预约这位师傅</button>
      </div>
    </BottomSheet>
  );
}

function ProviderOnboardingPanel({ onClose, onReady }: { onClose: () => void; onReady: () => void }) {
  return (
    <BottomSheet title="首次接单资料" onClose={onClose}>
      <div className="space-y-4">
        <FormLabel label="服务城市"><input className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-3" defaultValue="上海" /></FormLabel>
        <FormLabel label="可接服务"><input className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-3" defaultValue="保洁收纳、跑腿代办、生活陪伴" /></FormLabel>
        <FormLabel label="服务经验"><textarea className="mt-2 min-h-20 w-full rounded-xl border border-ink/10 px-3 py-3" defaultValue="有社区服务经验，沟通耐心。" /></FormLabel>
        <button className="w-full rounded-xl border border-dashed border-ink/20 bg-paper p-4 text-left text-sm text-ink/60">技能证明（选填）：上传服务照片、培训证明、过往案例。</button>
        <button onClick={onReady} className="w-full rounded-xl bg-mint py-3 font-black text-white">保存并开始接单</button>
      </div>
    </BottomSheet>
  );
}

function QualificationPanel({ skill, onClose, onQualified }: { skill: string; onClose: () => void; onQualified: (skill: string) => void }) {
  return (
    <BottomSheet title="资质认证" onClose={onClose}>
      <div className="space-y-4">
        <p className="rounded-xl bg-amber/15 p-3 text-sm leading-6 text-[#9a640f]">{skill} 属于专业或高风险服务，需要平台审核资质后才能接单。</p>
        <PanelList items={["普通服务人人可接", "开锁、电工、燃气、医疗护理需资质", "技能证明客户下单前可见", "资质证书需后台审核"]} />
        <button className="w-full rounded-xl border border-dashed border-ink/20 bg-paper p-4 text-left text-sm text-ink/60">上传资质证书或从业证明</button>
        <button onClick={() => onQualified(skill)} className="w-full rounded-xl bg-mint py-3 font-black text-white">提交并模拟通过</button>
      </div>
    </BottomSheet>
  );
}

function ChatPanel({ onClose }: { onClose: () => void }) {
  return (
    <BottomSheet title="订单聊天" onClose={onClose}>
      <div className="space-y-3">
        <ChatBubble text="系统：师傅已接单，完整地址仅双方可见。" system />
        <ChatBubble text="您好，我大约 30 分钟后到。" />
        <ChatBubble text="好的，到楼下请联系我。" own />
        <div className="grid grid-cols-2 gap-2">
          <button className="rounded-xl bg-paper py-3 font-black">发送位置</button>
          <button className="rounded-xl bg-paper py-3 font-black">上传图片</button>
        </div>
      </div>
    </BottomSheet>
  );
}

function PaymentPanel({ onClose }: { onClose: () => void }) {
  return (
    <BottomSheet title="确认支付" onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-3xl bg-mint p-5 text-center text-white">
          <p className="text-sm font-black text-white/75">待支付金额</p>
          <p className="mt-1 text-4xl font-black">¥100.00</p>
        </div>
        <PanelList items={["订单金额 ¥100", "平台服务费 10%", "师傅收入 ¥90", "可使用新人券 -¥10"]} />
        <button className="w-full rounded-xl bg-mint py-3 font-black text-white">确认支付</button>
      </div>
    </BottomSheet>
  );
}

function RefundPanel({ onClose }: { onClose: () => void }) {
  return (
    <BottomSheet title="退款售后" onClose={onClose}>
      <div className="space-y-4">
        <FormLabel label="售后原因"><select className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-3 py-3"><option>服务未开始</option><option>服务纠纷</option><option>资质不符</option></select></FormLabel>
        <button className="w-full rounded-xl border border-dashed border-ink/20 bg-paper p-4 text-left text-sm text-ink/60">上传凭证照片</button>
        <PanelList items={["提交申请", "平台审核", "处理结果"]} />
        <button className="w-full rounded-xl bg-coral py-3 font-black text-white">提交售后</button>
      </div>
    </BottomSheet>
  );
}

function ReportPanel({ onClose }: { onClose: () => void }) {
  return (
    <BottomSheet title="举报投诉" onClose={onClose}>
      <div className="space-y-4">
        <PanelList items={["骚扰", "虚假资质", "服务纠纷", "违规内容"]} />
        <button className="w-full rounded-xl border border-dashed border-ink/20 bg-paper p-4 text-left text-sm text-ink/60">上传举报凭证</button>
        <p className="rounded-xl bg-coral/10 p-3 text-sm text-[#a83f3d]">如遇紧急安全问题，请立即联系当地警方和平台客服。</p>
        <button className="w-full rounded-xl bg-ink py-3 font-black text-white">提交举报</button>
      </div>
    </BottomSheet>
  );
}

function AdminPanel({ onClose }: { onClose: () => void }) {
  return (
    <BottomSheet title="后台审核" onClose={onClose}>
      <div className="space-y-4">
        <PanelList items={["实名认证审核：12 条", "资质审核：8 条", "服务审核：5 条", "举报投诉：3 条", "订单纠纷：2 条"]} />
        <div className="grid grid-cols-3 gap-2">
          <button className="rounded-xl bg-mint py-3 font-black text-white">通过</button>
          <button className="rounded-xl bg-coral py-3 font-black text-white">驳回</button>
          <button className="rounded-xl bg-paper py-3 font-black">补充</button>
        </div>
      </div>
    </BottomSheet>
  );
}

function DemandCard({ request, onDetail, onAccept }: { request: ServiceRequest; onDetail: () => void; onAccept: () => void }) {
  const category = inferCategory(request);
  const requiredSkill = category.professional[0];
  return (
    <article className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-black leading-snug">{request.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-ink/60">{request.description}</p>
        </div>
        <StatusPill label={requiredSkill ? "资质必需" : "人人可接"} tone={requiredSkill ? "bg-coral/15 text-[#a83f3d]" : "bg-mint/15 text-[#08785c]"} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-ink/70">
        <InfoBadge icon={<MapPin size={14} />} text={maskAddress(request.address)} />
        <InfoBadge icon={<CalendarClock size={14} />} text={request.appointmentAt} />
        <InfoBadge icon={<WalletCards size={14} />} text={`预算 ¥${request.budget}`} />
        <InfoBadge icon={<Eye size={14} />} text={`${request.imageCount} 张参考图`} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button onClick={onDetail} className="rounded-xl border border-ink/10 bg-white py-3 font-black text-ink">查看详情</button>
        <button onClick={onAccept} className="rounded-xl bg-ink py-3 font-black text-white">我要接单</button>
      </div>
    </article>
  );
}

function ProviderCard({ provider, onOpen }: { provider: ServiceProvider; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="w-full rounded-2xl border border-ink/10 bg-white p-4 text-left shadow-sm">
      <div className="flex gap-3">
        <FaceAvatar label={provider.avatarUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-black">{provider.nickname}</h3>
              <p className="text-sm text-ink/60">{provider.city} · {genderLabel[provider.gender]}</p>
            </div>
            <StatusPill label={provider.isAcceptingOrders ? "接单中" : "休息"} tone={provider.isAcceptingOrders ? "bg-mint/15 text-[#08785c]" : "bg-slate-200 text-slate-600"} />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge label="实名认证" />
            {provider.qualificationVerified && <Badge label="资质通过" />}
            {provider.skills.slice(0, 2).map((skill) => <Badge key={skill} label={skill} muted />)}
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="font-bold"><Star size={14} className="mr-1 inline fill-amber text-amber" />{provider.rating} · 信用 {provider.creditScore}</span>
            <strong>{provider.priceLabel}</strong>
          </div>
        </div>
      </div>
    </button>
  );
}

function CategoryRail({ selected, onSelect }: { selected: string; onSelect: (category: string) => void }) {
  return (
    <aside className="w-24 shrink-0 space-y-2">
      {serviceCategories.map((category) => (
        <button key={category.name} onClick={() => onSelect(category.name)} className={`w-full rounded-xl px-2 py-3 text-xs font-black ${selected === category.name ? "bg-ink text-white" : "bg-white text-ink/65"}`}>{category.name}</button>
      ))}
    </aside>
  );
}

function FilterBar({ labels, onClick }: { labels: string[]; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full gap-2 overflow-x-auto rounded-2xl border border-ink/10 bg-white p-2 text-left shadow-sm">
      <SlidersHorizontal className="mt-2 shrink-0 text-mint" size={18} />
      {labels.map((label) => <span key={label} className="shrink-0 rounded-xl bg-paper px-3 py-2 text-xs font-bold text-ink/65">{label}</span>)}
    </button>
  );
}

function PrivacyNotice() {
  return (
    <section className="flex items-start gap-2 rounded-2xl bg-mint/10 p-3 text-sm text-ink/70">
      <ShieldCheck className="mt-0.5 shrink-0 text-mint" size={17} />
      <p>仅展示大概区域，完整地址在接单后由订单双方可见。</p>
    </section>
  );
}

function BottomNav({ activeTab, setActiveTab }: { activeTab: Tab; setActiveTab: (tab: Tab) => void }) {
  const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
    { id: "home", label: "首页", icon: <Home size={20} /> },
    { id: "demands", label: "需求", icon: <ClipboardList size={20} /> },
    { id: "masters", label: "师傅", icon: <UsersRound size={20} /> },
    { id: "orders", label: "订单", icon: <MessageCircle size={20} /> },
    { id: "profile", label: "我的", icon: <UserRound size={20} /> }
  ];
  return (
    <nav className="safe-bottom fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-ink/10 bg-white/95 px-2 pt-2 backdrop-blur">
      <div className="grid grid-cols-5 gap-1">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex h-14 flex-col items-center justify-center rounded-2xl text-xs font-bold ${activeTab === tab.id ? "bg-ink text-white shadow-sm" : "text-ink/60"}`}>{tab.icon}<span className="mt-1">{tab.label}</span></button>
        ))}
      </div>
    </nav>
  );
}

function SearchBar({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-left shadow-sm">
      <Search className="text-mint" size={20} />
      <span className="text-sm font-bold text-ink/45">搜索服务、需求、师傅</span>
    </button>
  );
}

function QuickAction({ icon, label, detail, onClick }: { icon: React.ReactNode; label: string; detail: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-2xl border border-ink/10 bg-white p-4 text-left shadow-sm">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-mint/15 text-mint">{icon}</div>
      <h3 className="mt-3 font-black">{label}</h3>
      <p className="text-sm text-ink/60">{detail}</p>
    </button>
  );
}

function MiniEntry({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="rounded-2xl border border-ink/10 bg-white p-3 text-center shadow-sm">
      <div className="mx-auto grid h-9 w-9 place-items-center rounded-2xl bg-mint/10 text-mint">{icon}</div>
      <p className="mt-2 text-xs font-black text-ink/75">{label}</p>
    </button>
  );
}

function QuickLine({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center justify-between rounded-2xl bg-paper px-3 py-3 text-left text-sm font-black">
      <span className="flex items-center gap-2">{icon}{label}</span>
      <ChevronRight size={16} />
    </button>
  );
}

function PageTitle({ title, detail, action, onAction }: { title: string; detail: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-black">{title}</h1>
        <p className="mt-1 text-sm text-ink/55">{detail}</p>
      </div>
      {action && <button onClick={onAction} className="shrink-0 rounded-full bg-mint px-3 py-2 text-xs font-black text-white">{action}</button>}
    </div>
  );
}

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <h2 className="text-lg font-black">{title}</h2>
      {action && <p className="text-xs font-bold text-mint">{action}</p>}
    </div>
  );
}

function ModalTitle({ icon, eyebrow, title }: { icon: React.ReactNode; eyebrow: string; title: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mint/15 text-mint">{icon}</div>
      <div>
        <p className="text-xs font-black text-mint">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-black text-ink">{title}</h2>
      </div>
    </div>
  );
}

function BottomSheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <section className="fixed inset-0 z-40 flex items-end bg-ink/45 px-4 pb-4 pt-16 backdrop-blur-sm sm:items-center">
      <div className="mx-auto max-h-[86vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">{title}</h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-paper" aria-label="关闭"><X size={18} /></button>
        </div>
        {children}
      </div>
    </section>
  );
}

function PanelBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-white p-4">
      <h3 className="mb-3 font-black">{title}</h3>
      {children}
    </section>
  );
}

function FeaturePanel({ title, detail, items, onClose }: { title: string; detail: string; items: string[]; onClose: () => void }) {
  return (
    <BottomSheet title={title} onClose={onClose}>
      <div className="space-y-4">
        <p className="rounded-2xl bg-paper p-4 text-sm leading-6 text-ink/65">{detail}</p>
        <PanelList items={items} />
      </div>
    </BottomSheet>
  );
}

function PanelList({ items }: { items: string[] }) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white p-3">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-mint/10 text-sm font-black text-mint">{index + 1}</div>
          <span className="font-bold leading-6">{item}</span>
        </div>
      ))}
    </div>
  );
}

function ChatBubble({ text, own = false, system = false }: { text: string; own?: boolean; system?: boolean }) {
  return <div className={`rounded-2xl p-3 text-sm leading-6 ${system ? "bg-amber/15 text-[#9a640f]" : own ? "ml-10 bg-mint text-white" : "mr-10 bg-paper text-ink/75"}`}>{text}</div>;
}

function StatusPill({ label, tone }: { label: string; tone: string }) {
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-black ${tone}`}>{label}</span>;
}

function Badge({ label, muted = false }: { label: string; muted?: boolean }) {
  return <span className={`rounded-full px-2 py-1 text-xs font-black ${muted ? "bg-paper text-ink/70" : "bg-mint/10 text-mint"}`}>{label}</span>;
}

function IconButton({ label, children, onClick }: { label: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="grid h-10 w-10 place-items-center rounded-full border border-ink/10 bg-white" aria-label={label}>{children}</button>
  );
}

function FaceAvatar({ label, large = false }: { label: string; large?: boolean }) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-2xl bg-gradient-to-b from-[#f6d2bc] to-[#d99b7f] ${large ? "h-16 w-16" : "h-12 w-12"}`}>
      <div className="absolute left-1/2 top-2 h-5 w-5 -translate-x-1/2 rounded-full bg-[#f8d8c7]" />
      <div className="absolute bottom-0 left-1/2 h-6 w-8 -translate-x-1/2 rounded-t-full bg-ink/80" />
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs font-black text-white">{label.slice(0, 1)}</span>
    </div>
  );
}

function FormLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-bold text-ink/75">{label}{children}</label>;
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-paper p-3">
      <p className="text-xs font-bold text-ink/50">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}

function InfoBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <span className="flex min-w-0 items-center gap-1 rounded-xl bg-paper px-2 py-2">{icon}<span className="truncate">{text}</span></span>;
}

function inferCategory(request: ServiceRequest) {
  return smartCategory(`${request.title}${request.description}`);
}

function smartCategory(text: string) {
  const rules: Array<[RegExp, string]> = [
    [/开锁|门锁|换锁/, "安全开锁"],
    [/电|灯|水龙头|燃气|家电|维修|安装/, "维修安装"],
    [/陪诊|护理|取药|康复/, "陪诊护理"],
    [/聊天|散步|陪|电影|购物/, "生活陪伴"],
    [/保洁|清洁|收纳|做饭/, "家政保洁"],
    [/搬|拉货|装卸/, "搬家拉货"],
    [/宠物|喂养|遛/, "宠物照看"],
    [/跑腿|代办|取送|排队/, "跑腿代办"],
    [/学习|家教|培训|辅导/, "学习培训"]
  ];
  const match = rules.find(([pattern]) => pattern.test(text));
  return serviceCategories.find((category) => category.name === match?.[1]) ?? serviceCategories[0];
}

function makeFeaturePanel(title: string, detail: string, items: string[]): Panel {
  return { kind: "feature", title, detail, items };
}

function makeFilterPanel(title: string): Panel {
  return makeFeaturePanel(title, "按城市、距离、预算、时间、性别、评分、信用分、资质和接单状态筛选。", ["智能推荐", "隐藏无资质师傅", "仅看接单中", "女性用户可优先推荐女性师傅"]);
}

function makeDemandPanel(request: ServiceRequest): Panel {
  return makeFeaturePanel(
    request.title,
    `${request.description} 位置仅展示为 ${maskAddress(request.address)}，完整地址将在接单后展示。`,
    [`预算：¥${request.budget}`, `预约：${request.appointmentAt}`, `性别要求：${genderLabel[request.genderRequirement]}`, request.qualificationRequired ? "需要资质认证" : "无需资质认证"]
  );
}

function featureItems(label: string) {
  const map: Record<string, string[]> = {
    我的钱包: ["可提现收入", "待结算订单", "提现记录"],
    推广入口: ["生成分享海报", "邀请记录", "佣金明细"],
    退款售后: ["售后订单", "退款进度", "平台介入"],
    浏览记录: ["最近需求", "最近师傅", "清空记录"],
    卡券: ["可用卡券", "即将过期", "使用规则"],
    我的收藏: ["收藏师傅", "收藏服务", "再次下单"]
  };
  return map[label] ?? ["查看详情", "编辑资料", "联系客服"];
}

function maskAddress(address: string) {
  const district = address.match(/市(.+?区)/)?.[1];
  return district ? `上海市${district}附近` : "同城附近";
}

function maskPhone(phone: string) {
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
}
