import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { deleteBlogPost, getBlogPosts, getContentBlocks, getFaqs, getPublicDestinations, getPublicStudyAbroadRecords, getPublicTourPackages, getPublicVisaServices, getServicePricing, getSettings, getTestimonials, saveBlogPost, saveSettings } from "@/lib/backend";
import type { ContentBlockRecord, DestinationOptionRecord, FAQRecord, StudyAbroadRecord, TestimonialRecord, TourPackageRecord, VisaServiceRecord } from "@/lib/adminTypes";
import type { AppSettings, BlogPost, ServicePricingRecord } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/defaults";

interface SiteDataContextValue {
  settings: AppSettings | null;
  posts: BlogPost[];
  faqs: FAQRecord[];
  testimonials: TestimonialRecord[];
  contentBlocks: ContentBlockRecord[];
  servicePricing: ServicePricingRecord[];
  tourPackages: TourPackageRecord[];
  visaServices: VisaServiceRecord[];
  studyAbroadRecords: StudyAbroadRecord[];
  destinationOptions: DestinationOptionRecord[];
  loading: boolean;
  refreshAll: () => Promise<void>;
  updateSettings: (settings: AppSettings) => Promise<void>;
  upsertPost: (post: BlogPost) => Promise<void>;
  removePost: (postId: string) => Promise<void>;
}

const SiteDataContext = createContext<SiteDataContextValue | undefined>(undefined);

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [faqs, setFaqs] = useState<FAQRecord[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialRecord[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlockRecord[]>([]);
  const [servicePricing, setServicePricing] = useState<ServicePricingRecord[]>([]);
  const [tourPackages, setTourPackages] = useState<TourPackageRecord[]>([]);
  const [visaServices, setVisaServices] = useState<VisaServiceRecord[]>([]);
  const [studyAbroadRecords, setStudyAbroadRecords] = useState<StudyAbroadRecord[]>([]);
  const [destinationOptions, setDestinationOptions] = useState<DestinationOptionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function refreshAll() {
    setLoading(true);
    try {
      const [nextSettings, nextPosts, nextFaqs, nextTestimonials, nextContentBlocks, nextServicePricing, nextTourPackages, nextVisaServices, nextStudyAbroadRecords, nextDestinationOptions] = await Promise.allSettled([
        getSettings(),
        getBlogPosts(),
        getFaqs(),
        getTestimonials(),
        getContentBlocks(),
        getServicePricing(),
        getPublicTourPackages(),
        getPublicVisaServices(),
        getPublicStudyAbroadRecords(),
        getPublicDestinations(),
      ]);

      if (nextSettings.status === "fulfilled") {
        setSettings(nextSettings.value);
      } else {
        setSettings((current) => current ?? DEFAULT_SETTINGS);
      }

      if (nextPosts.status === "fulfilled") {
        setPosts(nextPosts.value);
      }

      if (nextFaqs.status === "fulfilled") {
        setFaqs(nextFaqs.value.filter((item) => item.published).sort((left, right) => left.displayOrder - right.displayOrder));
      } else {
        setFaqs([]);
      }

      if (nextTestimonials.status === "fulfilled") {
        setTestimonials(nextTestimonials.value.filter((item) => item.status === "approved").sort((left, right) => left.displayOrder - right.displayOrder));
      } else {
        setTestimonials([]);
      }

      if (nextContentBlocks.status === "fulfilled") {
        setContentBlocks(
          nextContentBlocks.value
            .filter((item) => item.published && item.visible !== false)
            .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0)),
        );
      } else {
        setContentBlocks([]);
      }

      if (nextServicePricing.status === "fulfilled") {
        setServicePricing(
          nextServicePricing.value
            .filter((item) => item.visible)
            .sort((left, right) => left.displayOrder - right.displayOrder),
        );
      } else {
        setServicePricing([]);
      }

      if (nextTourPackages.status === "fulfilled") {
        setTourPackages(
          nextTourPackages.value
            .filter((item) => item.status === "published" && item.visible !== false)
            .sort((left, right) => Number(right.featured) - Number(left.featured)),
        );
      } else {
        setTourPackages([]);
      }

      if (nextVisaServices.status === "fulfilled") {
        setVisaServices(nextVisaServices.value.filter((item) => item.status === "published"));
      } else {
        setVisaServices([]);
      }

      if (nextStudyAbroadRecords.status === "fulfilled") {
        setStudyAbroadRecords(nextStudyAbroadRecords.value.filter((item) => item.status === "published"));
      } else {
        setStudyAbroadRecords([]);
      }

      if (nextDestinationOptions.status === "fulfilled") {
        setDestinationOptions(nextDestinationOptions.value.filter((item) => item.active));
      } else {
        setDestinationOptions([]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
  }, []);

  async function updateSettings(nextSettings: AppSettings) {
    const saved = await saveSettings(nextSettings);
    setSettings(saved);
  }

  async function upsertPost(post: BlogPost) {
    await saveBlogPost(post);
    const nextPosts = await getBlogPosts();
    setPosts(nextPosts);
  }

  async function removePost(postId: string) {
    await deleteBlogPost(postId);
    const nextPosts = await getBlogPosts();
    setPosts(nextPosts);
  }

  return (
    <SiteDataContext.Provider value={{ settings, posts, faqs, testimonials, contentBlocks, servicePricing, tourPackages, visaServices, studyAbroadRecords, destinationOptions, loading, refreshAll, updateSettings, upsertPost, removePost }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  const context = useContext(SiteDataContext);
  if (!context) {
    throw new Error("useSiteData must be used within a SiteDataProvider");
  }

  return context;
}
