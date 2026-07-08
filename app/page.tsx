"use client";

import {
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  Camera,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
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
  { name: "生活陪伴", ordinary: ["陪聊天", "陪散步", "陪购物", "陪老人聊天", "线上娱乐陪伴"], professional: [] },
  { name: "宠物照看", ordinary: ["上门喂养", "遛宠陪伴", "宠物清洁"], professional: [] },
  { name: "美容美甲", ordinary: ["美甲", "化妆造型", "形象整理"], professional: [] },
  { name: "运动健身", ordinary: ["陪跑", "拉伸放松", "健身搭子"], professional: ["专业私教"] },
  { name: "数码协助", ordinary: ["手机设置", "电脑清理", "网络调试"], professional: [] },
  { name: "安全开锁", ordinary: [], professional: ["开锁", "换锁", "智能门锁安装"] }
];

const professionalSkills = new Set(serviceCategories.flatMap((category) => category.professional));

const homeBanners = [
  { eyebrow: "新人安心服务", title: "首单上门服务保障", detail: "实名师傅、订单留痕、售后协助。" },
  { eyebrow: "AI 智能分类", title: "描述需求，自动匹配分类", detail: "帮你推荐预算、时间、资质要求。" },
  { eyebrow: "看评价再下单", title: "师傅资料和证明可查看", detail: "形象照、资质、评价照片集中展示。" }
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
  const providerIncome = initialOrder.amount * (1 - initialOrder.platformFeeRate);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => inferCategory(request).name === demandCategory);
  }, [demandCategory, requests]);

  const sortedProviders = useMemo(() => {
    return [...providerList].sort((left, right) => right.creditScore - left.creditScore);
  }, [providerList]);

  const visibleHomeCategories = expandedHomeCategories ? serviceCategories : serviceCategories.slice(0, 8);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setBannerIndex((current) => (current + 1) % homeBanners.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (showSplash) {
      return;
    }

    if (window.localStorage.getItem("bangbang-realname-verified") === "true") {
      setRealnameStatus("verified");
      return;
    }

    setShowRealnameModal(true);
  }, [showSplash]);

  useEffect(() => {
    let cancelled = false;

    loadMarketplaceSnapshot().then((snapshot) => {
      if (cancelled) {
        return;
      }

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
    setPanel({ kind: "publishConfirm", title: "发布确认" });
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
    } else {
      setPanel(makeFeaturePanel("服务评价", "订单完成后双方互评，评价会影响信用分。", ["星级评分", "评价照片", "服务标签"]));
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-paper shadow-soft">
      <SplashScreen visible={showSplash} onSkip={() => setShowSplash(false)} />
      <RealnameModal
        visible={showRealnameModal}
        step={verifyStep}
        onNext={() => setVerifyStep("face")}
        onComplete={completeFaceVerify}
      />
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
            <StatusPill label={isSupabaseConfigured && dataSource === "supabase" ? "实时数据" : "演示数据"} tone="bg-ink text-white" />
            <button
              onClick={() => setPanel(makeFeaturePanel("消息通知", "订单、实名、售后和系统安全提醒集中展示。", ["服务人员已接单", "资质审核通过", "优惠券即将过期"]))}
              className="grid h-10 w-10 place-items-center rounded-full border border-ink/10 bg-white"
              aria-label="通知"
            >
              <Bell size={18} />
            </button>
          </div>
        </div>
      </header>

      <section className="flex-1 space-y-4 px-4 py-4 pb-28">
        {activeTab === "home" && (
          <>
            <SearchBar onClick={() => setPanel(makeFeaturePanel("搜索服务", "可搜索需求、师傅、服务分类和资质。", ["关键词搜索", "城市距离筛选", "资质状态筛选"]))} />
            <HomeBanner index={bannerIndex} onSelect={setBannerIndex} />
            <HomeCategoryGrid
              categories={visibleHomeCategories}
              expanded={expandedHomeCategories}
              onToggle={() => setExpandedHomeCategories((value) => !value)}
              onOpen={(category) => openCategory(category, "demands")}
            />
            <section className="grid grid-cols-2 gap-3">
              <QuickAction icon={<Sparkles size={22} />} label="AI发布需求" detail="自动分类和筛选" onClick={() => setPanel({ kind: "aiPublish", title: "AI 发布需求" })} />
              <QuickAction icon={<UsersRound size={22} />} label="找师傅" detail="看资料再下单" onClick={() => setActiveTab("masters")} />
            </section>
            <SectionHeader title="高分师傅" action="看评价和技能证明" />
            <div className="space-y-3">
              {sortedProviders.slice(0, 2).map((provider) => (
                <ProviderCard key={provider.id} provider={provider} onOpen={() => setPanel({ kind: "providerDetail", title: "师傅主页", provider })} />
              ))}
            </div>
          </>
        )}

        {activeTab === "demands" && (
          <DemandHall
            category={demandCategory}
            requests={filteredRequests.length > 0 ? filteredRequests : requests}
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
          <ProfileCenter
            realnameStatus={realnameStatus}
            providerReady={providerReady}
            qualifiedSkills={qualifiedSkills}
            onVerify={() => setShowRealnameModal(true)}
            onPanel={setPanel}
          />
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
      <button onClick={onSkip} className="absolute right-5 top-5 rounded-full border border-white/25 px-3 py-1.5 text-xs font-bold text-white/80">
        跳过
      </button>
      <div className="relative flex flex-col items-center text-center">
        <div className="splash-mark scale-[1.8]">
          <LogoMark />
        </div>
        <h2 className="mt-12 text-5xl font-black tracking-normal">帮帮</h2>
        <p className="mt-6 text-lg font-bold text-white/90">有事找帮帮</p>
      </div>
    </section>
  );
}

function RealnameModal({
  visible,
  step,
  onNext,
  onComplete
}: {
  visible: boolean;
  step: VerifyStep;
  onNext: () => void;
  onComplete: () => void;
}) {
  if (!visible) return null;

  return (
    <section className="fixed inset-0 z-40 flex items-end bg-ink/45 px-4 pb-4 pt-16 backdrop-blur-sm sm:items-center">
      <div className="mx-auto w-full max-w-md rounded-lg bg-white p-5 shadow-soft">
        {step === "info" && (
          <>
            <ModalTitle icon={<IdCard size={26} />} eyebrow="首次注册需完成" title="实名认证" />
            <p className="mt-3 text-sm leading-6 text-ink/65">请先填写实名信息，再进入人脸识别。证件信息不会公开展示。</p>
            <div className="mt-5 space-y-3">
              <FormLabel label="真实姓名">
                <input className="mt-2 w-full rounded-lg border border-ink/10 px-3 py-3 outline-none focus:border-mint" defaultValue="林小雨" />
              </FormLabel>
              <FormLabel label="身份证号">
                <input className="mt-2 w-full rounded-lg border border-ink/10 px-3 py-3 outline-none focus:border-mint" defaultValue="310***********0426" />
              </FormLabel>
              <label className="flex cursor-pointer items-start gap-2 text-sm text-ink/65">
                <input type="checkbox" defaultChecked className="mt-1" />
                <span>我同意用于实名认证和人脸核验。</span>
              </label>
            </div>
            <button onClick={onNext} className="mt-5 w-full rounded-lg bg-mint py-3 font-bold text-white">
              下一步：人脸识别
            </button>
          </>
        )}

        {step === "face" && (
          <>
            <ModalTitle icon={<Camera size={26} />} eyebrow="第二步" title="人脸识别" />
            <div className="mt-5 rounded-lg bg-ink p-5 text-center text-white">
              <div className="mx-auto grid h-28 w-28 place-items-center rounded-full border-4 border-mint/80 bg-white/10">
                <UserRound size={54} />
              </div>
              <p className="mt-4 text-sm font-bold text-white/80">请正对镜头，按提示完成活体检测</p>
            </div>
            <p className="mt-4 rounded-lg bg-paper p-3 text-sm leading-6 text-ink/65">演示版不调用真实摄像头，正式版接入合规人脸核验接口。</p>
            <button onClick={onComplete} className="mt-5 w-full rounded-lg bg-mint py-3 font-bold text-white">
              开始识别
            </button>
          </>
        )}

        {step === "success" && (
          <div className="py-8 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mint text-white">
              <CheckCircle2 size={34} />
            </div>
            <h2 className="mt-4 text-xl font-black">认证成功</h2>
            <p className="mt-2 text-sm text-ink/60">现在可以发布需求、下单和接单。</p>
          </div>
        )}
      </div>
    </section>
  );
}

function SearchBar({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full rounded-lg border border-ink/10 bg-white p-3 text-left">
      <div className="flex items-center gap-2 rounded-lg bg-paper px-3 py-2">
        <Search size={18} className="text-ink/45" />
        <span className="flex-1 text-sm text-ink/55">搜保洁、维修、陪聊天、开锁</span>
        <span className="text-xs font-bold text-mint">约 2km</span>
      </div>
    </button>
  );
}

function HomeBanner({ index, onSelect }: { index: number; onSelect: (index: number) => void }) {
  const banner = homeBanners[index];
  return (
    <section className="rounded-lg bg-mint p-4 text-white shadow-sm">
      <p className="text-xs font-black text-white/75">{banner.eyebrow}</p>
      <h2 className="mt-1 text-2xl font-black tracking-normal">{banner.title}</h2>
      <p className="mt-2 text-sm leading-6 text-white/80">{banner.detail}</p>
      <div className="mt-4 flex gap-1.5">
        {homeBanners.map((item, itemIndex) => (
          <button
            key={item.title}
            onClick={() => onSelect(itemIndex)}
            aria-label={`切换到${item.title}`}
            className={`h-2 rounded-full ${index === itemIndex ? "w-5 bg-white" : "w-2 bg-white/45"}`}
          />
        ))}
      </div>
    </section>
  );
}

function HomeCategoryGrid({
  categories,
  expanded,
  onToggle,
  onOpen
}: {
  categories: ServiceCategory[];
  expanded: boolean;
  onToggle: () => void;
  onOpen: (category: string) => void;
}) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black">热门服务</h2>
        <button onClick={onToggle} className="text-xs font-black text-mint">{expanded ? "收起" : "展开更多"}</button>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-3">
        {categories.map((category) => (
          <button key={category.name} onClick={() => onOpen(category.name)} className="flex min-h-16 flex-col items-center justify-center rounded-lg bg-paper px-1 py-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-mint/15 text-mint">
              <PackageCheck size={17} />
            </div>
            <span className="mt-1 text-center text-xs font-bold text-ink/75">{category.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function DemandHall({
  category,
  requests,
  onCategory,
  onFilter,
  onAiPublish,
  onDetail,
  onAccept
}: {
  category: string;
  requests: ServiceRequest[];
  onCategory: (category: string) => void;
  onFilter: () => void;
  onAiPublish: () => void;
  onDetail: (request: ServiceRequest) => void;
  onAccept: (request: ServiceRequest) => void;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <SectionHeader title="需求大厅" action="按分类查看" />
        <button onClick={onAiPublish} className="rounded-lg bg-mint px-3 py-2 text-sm font-black text-white">AI发布</button>
      </div>
      <FilterBar onClick={onFilter} labels={["城市", "距离", "预算", "时间", "性别", "资质"]} />
      <div className="flex gap-3">
        <CategoryRail selected={category} onSelect={onCategory} />
        <div className="min-w-0 flex-1 space-y-3">
          <PrivacyNotice />
          {requests.map((request) => (
            <DemandCard key={request.id} request={request} onDetail={() => onDetail(request)} onAccept={() => onAccept(request)} />
          ))}
          {requests.length === 0 && <EmptyState title="暂无需求" detail="换个分类或稍后再来看看。" />}
        </div>
      </div>
    </section>
  );
}

function MasterHall({
  category,
  providers: items,
  onCategory,
  onFilter,
  onOpen
}: {
  category: string;
  providers: ServiceProvider[];
  onCategory: (category: string) => void;
  onFilter: () => void;
  onOpen: (provider: ServiceProvider) => void;
}) {
  return (
    <section className="space-y-4">
      <SectionHeader title="师傅" action="资料、资质、评价集中展示" />
      <FilterBar onClick={onFilter} labels={["城市", "距离", "评分", "价格", "性别", "资质", "接单中"]} />
      <div className="flex gap-3">
        <CategoryRail selected={category} onSelect={onCategory} />
        <div className="min-w-0 flex-1 space-y-3">
          {items.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} onOpen={() => onOpen(provider)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function OrderCenter({
  request,
  status,
  income,
  onAdvance,
  onChat,
  onPayment,
  onRefund,
  onReport,
  onTab
}: {
  request: ServiceRequest;
  status: OrderStatus;
  income: number;
  onAdvance: () => void;
  onChat: () => void;
  onPayment: () => void;
  onRefund: () => void;
  onReport: () => void;
  onTab: (tab: string) => void;
}) {
  return (
    <section className="space-y-4">
      <SectionHeader title="订单中心" action="交易、售后、评价" />
      <div className="flex gap-2 overflow-x-auto rounded-lg border border-ink/10 bg-white p-2">
        {["全部", "待接单", "进行中", "待评价", "售后"].map((tab, index) => (
          <button key={tab} onClick={() => onTab(tab)} className={`shrink-0 rounded-lg px-3 py-2 text-sm font-bold ${index === 0 ? "bg-ink text-white" : "bg-paper text-ink/65"}`}>
            {tab}
          </button>
        ))}
      </div>
      <article className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-mint">订单 #{initialOrder.id}</p>
            <h2 className="mt-1 text-lg font-black">{request.title}</h2>
            <p className="mt-1 text-sm text-ink/60">林小雨 与 陈师傅</p>
          </div>
          <StatusPill label={orderStatusMeta[status].label} tone={orderStatusMeta[status].tone} />
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {orderSteps.map((step) => {
            const done = orderSteps.indexOf(step) <= orderSteps.indexOf(status);
            return (
              <div key={step} className="text-center">
                <div className={`mx-auto grid h-9 w-9 place-items-center rounded-full ${done ? "bg-mint text-white" : "bg-ink/10 text-ink/40"}`}>
                  <CheckCircle2 size={17} />
                </div>
                <p className="mt-1 text-[11px] font-bold text-ink/70">{orderStatusMeta[step].label}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-5 rounded-lg bg-paper p-3">
          <InfoRow label="客户支付" value={`¥${initialOrder.amount}`} />
          <InfoRow label="平台服务费" value={`${initialOrder.platformFeeRate * 100}%`} />
          <InfoRow label="师傅收入" value={`¥${income}`} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={onAdvance} className="rounded-lg bg-mint py-3 font-bold text-white">{orderStatusMeta[status].next ?? "去评价"}</button>
          <button onClick={onRefund} className="rounded-lg border border-coral/30 bg-coral/10 py-3 font-bold text-[#a83f3d]">退款售后</button>
        </div>
      </article>
      <section className="grid grid-cols-4 gap-2">
        <MiniEntry icon={<MessageCircle size={18} />} label="聊天" onClick={onChat} />
        <MiniEntry icon={<CreditCard size={18} />} label="支付" onClick={onPayment} />
        <MiniEntry icon={<CircleAlert size={18} />} label="举报" onClick={onReport} />
        <MiniEntry icon={<Star size={18} />} label="评价" onClick={onAdvance} />
      </section>
    </section>
  );
}

function ProfileCenter({
  realnameStatus,
  providerReady,
  qualifiedSkills,
  onVerify,
  onPanel
}: {
  realnameStatus: RealnameStatus;
  providerReady: boolean;
  qualifiedSkills: string[];
  onVerify: () => void;
  onPanel: (panel: Panel) => void;
}) {
  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <FaceAvatar label={currentProfile.avatarUrl} />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-black">{currentProfile.nickname}</h2>
            <p className="text-sm text-ink/60">{maskPhone(currentProfile.phone)} · {currentProfile.city}</p>
          </div>
          <StatusPill label={realnameMeta[realnameStatus].label} tone={realnameMeta[realnameStatus].tone} />
        </div>
        <button onClick={onVerify} className="mt-4 flex w-full items-center justify-between rounded-lg bg-paper px-3 py-3 text-left">
          <span className="font-bold">人脸实名状态</span>
          <span className="flex items-center gap-1 text-sm font-bold text-mint">查看<ChevronRight size={16} /></span>
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <MiniEntry icon={<BriefcaseBusiness size={18} />} label="接单资料" onClick={() => onPanel({ kind: "providerOnboarding", title: "首次接单资料" })} />
        <MiniEntry icon={<IdCard size={18} />} label="资质认证" onClick={() => onPanel({ kind: "qualification", title: "资质认证", detail: "开锁" })} />
        <MiniEntry icon={<ShieldCheck size={18} />} label="安全中心" onClick={() => onPanel(makeFeaturePanel("安全中心", "定位、录音、隐私和投诉记录集中管理。", ["定位权限", "录音权限", "屏蔽用户", "投诉记录"]))} />
      </div>
      <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black">师傅工作台</h3>
            <p className="text-sm text-ink/60">{providerReady ? "正在接单" : "未完善接单资料"} · 已认证 {qualifiedSkills.length} 项资质</p>
          </div>
          <StatusPill label={providerReady ? "接单中" : "待完善"} tone={providerReady ? "bg-mint/15 text-[#08785c]" : "bg-amber/15 text-[#9a640f]"} />
        </div>
      </section>
      <div className="rounded-lg border border-ink/10 bg-white p-2 shadow-sm">
        {[
          ["我的钱包", WalletCards, "收入、余额、提现"],
          ["推广入口", Megaphone, "邀请有奖"],
          ["退款售后", LifeBuoy, "进度查询"],
          ["浏览记录", History, "最近看过"],
          ["卡券", Gift, "优惠福利"],
          ["我的收藏", Heart, "常用师傅"],
          ["后台审核", LockKeyhole, "管理员演示"]
        ].map(([label, Icon, detail]) => {
          const LucideIcon = Icon as typeof WalletCards;
          return (
            <button key={label as string} onClick={() => onPanel(label === "后台审核" ? { kind: "admin", title: "后台审核" } : makeFeaturePanel(label as string, detail as string, featureItems(label as string)))} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-paper">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-mint/10 text-mint">
                <LucideIcon size={18} />
              </div>
              <div className="flex-1">
                <p className="font-bold">{label as string}</p>
                <p className="text-xs text-ink/50">{detail as string}</p>
              </div>
              <ChevronRight size={16} className="text-ink/35" />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function AppPanel({
  panel,
  onClose,
  onPublish,
  onProviderReady,
  onQualified,
  onOrderProvider
}: {
  panel: Panel | null;
  onClose: () => void;
  onPublish: (request: ServiceRequest) => void;
  onProviderReady: () => void;
  onQualified: (skill: string) => void;
  onOrderProvider: (provider: ServiceProvider) => void;
}) {
  if (!panel) return null;

  if (panel.kind === "aiPublish") {
    return <AiPublishPanel onClose={onClose} onPublish={onPublish} />;
  }

  if (panel.kind === "publishConfirm") {
    return (
      <BottomSheet title="发布确认" onClose={onClose}>
        <div className="space-y-3">
          <p className="rounded-lg bg-paper p-3 text-sm text-ink/65">需求已生成并进入需求大厅。系统会按分类、距离、资质和安全规则推荐给合适师傅。</p>
          <button onClick={onClose} className="w-full rounded-lg bg-mint py-3 font-bold text-white">知道了</button>
        </div>
      </BottomSheet>
    );
  }

  if (panel.kind === "providerDetail" && panel.provider) {
    return <ProviderDetail provider={panel.provider} onClose={onClose} onOrder={onOrderProvider} />;
  }

  if (panel.kind === "providerOnboarding") {
    return <ProviderOnboarding onClose={onClose} onReady={onProviderReady} />;
  }

  if (panel.kind === "qualification") {
    return <QualificationPanel skill={panel.detail ?? "开锁"} onClose={onClose} onQualified={onQualified} />;
  }

  if (panel.kind === "chat") return <ChatPanel onClose={onClose} />;
  if (panel.kind === "payment") return <PaymentPanel onClose={onClose} />;
  if (panel.kind === "refund") return <RefundPanel onClose={onClose} />;
  if (panel.kind === "report") return <ReportPanel onClose={onClose} />;
  if (panel.kind === "admin") return <AdminPanel onClose={onClose} />;

  return (
    <BottomSheet title={panel.title} onClose={onClose}>
      <div className="space-y-4">
        <p className="rounded-lg bg-paper p-3 text-sm leading-6 text-ink/65">{panel.detail}</p>
        <div className="space-y-2">
          {panel.items?.map((item, index) => (
            <div key={item} className="flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-3">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-mint/10 text-sm font-black text-mint">{index + 1}</div>
              <span className="font-bold">{item}</span>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full rounded-lg bg-ink py-3 font-bold text-white">知道了</button>
      </div>
    </BottomSheet>
  );
}

function AiPublishPanel({ onClose, onPublish }: { onClose: () => void; onPublish: (request: ServiceRequest) => void }) {
  const [description, setDescription] = useState("明天下午想找人陪老人聊天散步一小时");
  const category = smartCategory(description);
  const skill = category.ordinary[0] ?? category.professional[0] ?? "生活服务";
  const needsQualification = professionalSkills.has(skill);

  const submit = () => {
    onPublish({
      id: `request_ai_${Date.now()}`,
      title: description.slice(0, 18),
      description: `AI 已识别为${category.name}，推荐项目：${skill}。`,
      address: "上海市徐汇区默认服务地址",
      appointmentAt: "明天 15:00",
      budget: needsQualification ? 180 : 80,
      genderRequirement: "any",
      qualificationRequired: needsQualification,
      imageCount: 0,
      status: "open"
    });
  };

  return (
    <BottomSheet title="AI 发布需求" onClose={onClose}>
      <div className="space-y-4">
        <FormLabel label="描述你需要的帮助">
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 min-h-24 w-full rounded-lg border border-ink/10 px-3 py-3 outline-none focus:border-mint" />
        </FormLabel>
        <div className="grid grid-cols-2 gap-3">
          <MiniInfo label="推荐分类" value={category.name} />
          <MiniInfo label="推荐服务" value={skill} />
          <MiniInfo label="预算建议" value={needsQualification ? "¥180" : "¥80"} />
          <MiniInfo label="资质建议" value={needsQualification ? "必须资质" : "人人可接"} />
        </div>
        <p className="rounded-lg bg-mint/10 p-3 text-sm leading-6 text-ink/65">系统会保护隐私，发布后仅展示大概区域，完整地址接单后可见。</p>
        <button onClick={submit} className="w-full rounded-lg bg-mint py-3 font-bold text-white">生成需求</button>
      </div>
    </BottomSheet>
  );
}

function ProviderDetail({ provider, onClose, onOrder }: { provider: ServiceProvider; onClose: () => void; onOrder: (provider: ServiceProvider) => void }) {
  return (
    <BottomSheet title="师傅主页" onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {["形象照", "服务照", "评价图"].map((label) => (
            <div key={label} className="grid aspect-square place-items-center rounded-lg bg-gradient-to-b from-mint/20 to-ink/10 text-xs font-black text-ink/60">{label}</div>
          ))}
        </div>
        <div className="flex gap-3">
          <FaceAvatar label={provider.avatarUrl} />
          <div className="flex-1">
            <h3 className="text-lg font-black">{provider.nickname} · {provider.gender === "male" ? "陈*" : "孟*"}</h3>
            <p className="text-sm text-ink/60">{provider.city} · {provider.skills.join(" / ")}</p>
            <p className="mt-1 text-sm font-bold text-mint">评分 {provider.rating} · 信用 {provider.creditScore}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill label="实名认证" tone="bg-mint/15 text-[#08785c]" />
          {provider.qualificationVerified && <StatusPill label="资质通过" tone="bg-mint/15 text-[#08785c]" />}
          <StatusPill label="技能证明可见" tone="bg-amber/15 text-[#9a640f]" />
        </div>
        <PanelList items={["技能证明：社区维修服务记录", "资质证书：平台审核通过", "服务评价：响应快，沟通清楚", "评价照片：3 张"]} />
        <div className="grid grid-cols-2 gap-3">
          <button className="rounded-lg border border-ink/10 bg-white py-3 font-bold text-ink">收藏</button>
          <button onClick={() => onOrder(provider)} className="rounded-lg bg-mint py-3 font-bold text-white">立即下单</button>
        </div>
      </div>
    </BottomSheet>
  );
}

function ProviderOnboarding({ onClose, onReady }: { onClose: () => void; onReady: () => void }) {
  return (
    <BottomSheet title="首次接单资料" onClose={onClose}>
      <div className="space-y-4">
        <p className="rounded-lg bg-paper p-3 text-sm leading-6 text-ink/65">人人都可以接普通服务，专业服务需资质认证。请先完善技能信息。</p>
        <FormLabel label="常驻城市"><input className="mt-2 w-full rounded-lg border border-ink/10 px-3 py-3" defaultValue="上海" /></FormLabel>
        <FormLabel label="可接服务"><input className="mt-2 w-full rounded-lg border border-ink/10 px-3 py-3" defaultValue="保洁收纳、跑腿代办、生活陪伴" /></FormLabel>
        <FormLabel label="服务经验"><textarea className="mt-2 min-h-20 w-full rounded-lg border border-ink/10 px-3 py-3" defaultValue="有社区服务经验，沟通耐心。" /></FormLabel>
        <button className="w-full rounded-lg border border-dashed border-ink/20 bg-paper p-4 text-left text-sm text-ink/60">技能证明（选填）：上传服务照片、培训证明、过往案例。</button>
        <button onClick={onReady} className="w-full rounded-lg bg-mint py-3 font-bold text-white">保存并开始接单</button>
      </div>
    </BottomSheet>
  );
}

function QualificationPanel({ skill, onClose, onQualified }: { skill: string; onClose: () => void; onQualified: (skill: string) => void }) {
  return (
    <BottomSheet title="资质认证" onClose={onClose}>
      <div className="space-y-4">
        <p className="rounded-lg bg-amber/15 p-3 text-sm leading-6 text-[#9a640f]">{skill}属于专业/高风险服务，需要平台审核资质后才能接单。</p>
        <PanelList items={["人人可接：保洁、跑腿、生活陪伴、宠物照看", "需资质：开锁、电工维修、燃气维修、医疗护理、高空作业", "技能证明：普通技能选填，客户下单前可见", "资质证书：专业技能必填，后台审核"]} />
        <button className="w-full rounded-lg border border-dashed border-ink/20 bg-paper p-4 text-left text-sm text-ink/60">资质证书（必填）：上传证书或从业证明。</button>
        <button onClick={() => onQualified(skill)} className="w-full rounded-lg bg-mint py-3 font-bold text-white">提交并模拟通过</button>
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
          <button className="rounded-lg bg-paper py-3 font-bold">发送位置</button>
          <button className="rounded-lg bg-paper py-3 font-bold">上传图片</button>
        </div>
      </div>
    </BottomSheet>
  );
}

function PaymentPanel({ onClose }: { onClose: () => void }) {
  return (
    <BottomSheet title="确认支付" onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-lg bg-mint p-5 text-center text-white">
          <p className="text-sm font-bold text-white/75">待支付金额</p>
          <p className="mt-1 text-4xl font-black">¥100.00</p>
        </div>
        <PanelList items={["订单金额 ¥100", "平台服务费 10%", "师傅收入 ¥90", "可使用新人券 -¥10"]} />
        <button className="w-full rounded-lg bg-mint py-3 font-bold text-white">确认支付</button>
      </div>
    </BottomSheet>
  );
}

function RefundPanel({ onClose }: { onClose: () => void }) {
  return (
    <BottomSheet title="退款售后" onClose={onClose}>
      <div className="space-y-4">
        <FormLabel label="售后原因"><select className="mt-2 w-full rounded-lg border border-ink/10 bg-white px-3 py-3"><option>服务未开始</option><option>服务纠纷</option><option>资质不符</option></select></FormLabel>
        <button className="w-full rounded-lg border border-dashed border-ink/20 bg-paper p-4 text-left text-sm text-ink/60">上传凭证照片</button>
        <PanelList items={["提交申请", "平台审核", "处理结果"]} />
        <button className="w-full rounded-lg bg-coral py-3 font-bold text-white">提交售后</button>
      </div>
    </BottomSheet>
  );
}

function ReportPanel({ onClose }: { onClose: () => void }) {
  return (
    <BottomSheet title="举报投诉" onClose={onClose}>
      <div className="space-y-4">
        <PanelList items={["骚扰", "虚假资质", "服务纠纷", "违规内容"]} />
        <button className="w-full rounded-lg border border-dashed border-ink/20 bg-paper p-4 text-left text-sm text-ink/60">上传举报凭证</button>
        <p className="rounded-lg bg-coral/10 p-3 text-sm text-[#a83f3d]">如遇紧急安全问题，请立即联系当地警方和平台客服。</p>
        <button className="w-full rounded-lg bg-ink py-3 font-bold text-white">提交举报</button>
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
          <button className="rounded-lg bg-mint py-3 font-bold text-white">通过</button>
          <button className="rounded-lg bg-coral py-3 font-bold text-white">驳回</button>
          <button className="rounded-lg bg-paper py-3 font-bold">补充</button>
        </div>
      </div>
    </BottomSheet>
  );
}

function DemandCard({ request, onDetail, onAccept }: { request: ServiceRequest; onDetail: () => void; onAccept: () => void }) {
  const category = inferCategory(request);
  const requiredSkill = category.professional[0];

  return (
    <article className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black">{request.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-ink/60">{request.description}</p>
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
        <button onClick={onDetail} className="rounded-lg border border-ink/10 bg-white py-3 font-bold text-ink">查看详情</button>
        <button onClick={onAccept} className="rounded-lg bg-ink py-3 font-bold text-white">我要接单</button>
      </div>
    </article>
  );
}

function ProviderCard({ provider, onOpen }: { provider: ServiceProvider; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="w-full rounded-lg border border-ink/10 bg-white p-4 text-left shadow-sm">
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
            <span className="rounded-full bg-mint/10 px-2 py-1 text-xs font-bold text-mint">实名认证</span>
            {provider.qualificationVerified && <span className="rounded-full bg-mint/10 px-2 py-1 text-xs font-bold text-mint">资质通过</span>}
            {provider.skills.map((skill) => <span key={skill} className="rounded-full bg-paper px-2 py-1 text-xs font-bold text-ink/70">{skill}</span>)}
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
        <button key={category.name} onClick={() => onSelect(category.name)} className={`w-full rounded-lg px-2 py-3 text-xs font-black ${selected === category.name ? "bg-ink text-white" : "bg-white text-ink/65"}`}>
          {category.name}
        </button>
      ))}
    </aside>
  );
}

function FilterBar({ labels, onClick }: { labels: string[]; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full gap-2 overflow-x-auto rounded-lg border border-ink/10 bg-white p-2 text-left">
      <SlidersHorizontal className="mt-2 shrink-0 text-mint" size={18} />
      {labels.map((label) => (
        <span key={label} className="shrink-0 rounded-lg bg-paper px-3 py-2 text-xs font-bold text-ink/65">{label}</span>
      ))}
    </button>
  );
}

function PrivacyNotice() {
  return (
    <section className="flex items-start gap-2 rounded-lg bg-mint/10 p-3 text-sm text-ink/70">
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
    <nav className="safe-bottom fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-ink/10 bg-white px-2 pt-2">
      <div className="grid grid-cols-5 gap-1">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex h-14 flex-col items-center justify-center rounded-lg text-xs font-bold ${activeTab === tab.id ? "bg-ink text-white" : "text-ink/60"}`}>
            {tab.icon}
            <span className="mt-1">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

function QuickAction({ icon, label, detail, onClick }: { icon: React.ReactNode; label: string; detail: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-lg border border-ink/10 bg-white p-4 text-left shadow-sm">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-mint/15 text-mint">{icon}</div>
      <h3 className="mt-3 font-black">{label}</h3>
      <p className="text-sm text-ink/60">{detail}</p>
    </button>
  );
}

function MiniEntry({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="rounded-lg border border-ink/10 bg-white p-3 text-center shadow-sm">
      <div className="mx-auto grid h-9 w-9 place-items-center rounded-lg bg-mint/10 text-mint">{icon}</div>
      <p className="mt-2 text-xs font-black text-ink/75">{label}</p>
    </button>
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
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-mint/15 text-mint">{icon}</div>
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
      <div className="mx-auto max-h-[86vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">{title}</h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-paper" aria-label="关闭">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </section>
  );
}

function PanelList({ items }: { items: string[] }) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={item} className="flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-mint/10 text-sm font-black text-mint">{index + 1}</div>
          <span className="font-bold">{item}</span>
        </div>
      ))}
    </div>
  );
}

function ChatBubble({ text, own = false, system = false }: { text: string; own?: boolean; system?: boolean }) {
  return (
    <div className={`rounded-lg p-3 text-sm leading-6 ${system ? "bg-amber/15 text-[#9a640f]" : own ? "ml-10 bg-mint text-white" : "mr-10 bg-paper text-ink/75"}`}>
      {text}
    </div>
  );
}

function StatusPill({ label, tone }: { label: string; tone: string }) {
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-black ${tone}`}>{label}</span>;
}

function FaceAvatar({ label }: { label: string }) {
  return (
    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gradient-to-b from-[#f6d2bc] to-[#d99b7f]">
      <div className="absolute left-1/2 top-2 h-5 w-5 -translate-x-1/2 rounded-full bg-[#f8d8c7]" />
      <div className="absolute bottom-0 left-1/2 h-6 w-8 -translate-x-1/2 rounded-t-full bg-ink/80" />
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs font-black text-white">{label}</span>
    </div>
  );
}

function FormLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-bold text-ink/75">
      {label}
      {children}
    </label>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-paper p-3">
      <p className="text-xs font-bold text-ink/50">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-ink/60">{label}</span>
      <strong className="text-right text-ink">{value}</strong>
    </div>
  );
}

function InfoBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex min-w-0 items-center gap-1 rounded-lg bg-paper px-2 py-2">
      {icon}
      <span className="truncate">{text}</span>
    </span>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-lg border border-dashed border-ink/15 bg-white p-6 text-center">
      <p className="font-black">{title}</p>
      <p className="mt-2 text-sm text-ink/55">{detail}</p>
    </div>
  );
}

function inferCategory(request: ServiceRequest) {
  const text = `${request.title}${request.description}`;
  return smartCategory(text);
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
  return makeFeaturePanel(title, "按城市、距离、预算、时间、性别、评分、信用分、资质和接单状态筛选。", ["智能推荐", "女性用户优先推荐女性师傅", "隐藏无资质师傅", "仅看接单中"]);
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
