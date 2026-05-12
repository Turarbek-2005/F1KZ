"use client";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/shared/store";
import { generateNews, clearNews } from "@/entities/ai/aiSlice";
import type { NewsItem, Category } from "@/entities/ai/aiSlice";
import { Button } from "@/shared/ui/button";
import {
  Loader2,
  Sparkles,
  Newspaper,
  RefreshCw,
  Trash2,
  Calendar,
  Flag,
  Users,
  Wrench,
  ArrowLeftRight,
  Gauge,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/lib/utils";

const CATEGORY_META: Record<
  Category,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  race: {
    label: "Race",
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    icon: <Flag className="w-3 h-3" />,
  },
  transfers: {
    label: "Transfers",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    icon: <ArrowLeftRight className="w-3 h-3" />,
  },
  teams: {
    label: "Teams",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    icon: <Users className="w-3 h-3" />,
  },
  drivers: {
    label: "Drivers",
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    icon: <Gauge className="w-3 h-3" />,
  },
  technical: {
    label: "Technical",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    icon: <Wrench className="w-3 h-3" />,
  },
};

function CategoryBadge({ category }: { category: Category }) {
  const meta = CATEGORY_META[category] ?? CATEGORY_META.race;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border",
        meta.color,
        meta.bg,
        meta.border
      )}
    >
      {meta.icon}
      {meta.label}
    </span>
  );
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function NewsCard({ item, index, featured }: { item: NewsItem; index: number; featured?: boolean }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={cn(
        "group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow duration-200",
        featured && "md:col-span-2 md:flex-row md:gap-6"
      )}
    >
      {/* Category + date */}
      <div className={cn("flex flex-col gap-3 flex-1", featured && "md:justify-center")}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CategoryBadge category={item.category} />
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {formatDate(item.date)}
          </span>
        </div>

        <h2
          className={cn(
            "font-bold leading-snug text-foreground group-hover:text-red-500 transition-colors",
            featured ? "text-2xl" : "text-base"
          )}
        >
          {item.title}
        </h2>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {item.summary}
        </p>
      </div>
    </motion.article>
  );
}

function SkeletonCard({ wide }: { wide?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 flex flex-col gap-3 animate-pulse",
        wide && "md:col-span-2"
      )}
    >
      <div className="flex justify-between">
        <div className="h-4 w-16 rounded-full bg-muted" />
        <div className="h-4 w-20 rounded bg-muted" />
      </div>
      <div className="h-5 w-3/4 rounded bg-muted" />
      <div className="h-4 w-full rounded bg-muted" />
      <div className="h-4 w-5/6 rounded bg-muted" />
    </div>
  );
}

const PROMPT =
  'Ты — спортивный новостной редактор сайта о Formula 1. Сгенерируй актуальные новости Формулы-1 2026 в нейтральном журналистском стиле.\n\nТребования:\n- Пиши КРАТКО и по делу\n- Без художественных вступлений и рассуждений\n- Без Markdown\n- Только факты\n- Дата считается текущей\n\nФормат ответа СТРОГО JSON:\n{\n  "news": [\n    {\n      "title": "Заголовок новости",\n      "summary": "Краткое описание (2–3 предложения)",\n      "category": "race | transfers | teams | drivers | technical",\n      "date": "YYYY-MM-DD"\n    }\n  ]\n}\n\nКоличество новостей: 5';

export default function NewsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { news, status, error, lastUpdated } = useSelector(
    (state: RootState) => state.ai
  );

  const onGenerate = () => dispatch(generateNews({ prompt: PROMPT }));

  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <div className="border-b border-border bg-card/50">
        <div className="container px-4 sm:px-6 mx-auto py-10">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-red-500 mb-2">
                <Newspaper className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-widest">
                  AI-Powered
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                F1 News
              </h1>
              <p className="text-muted-foreground text-sm">
                Latest Formula 1 news generated by AI
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              {news && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch(clearNews())}
                  className="gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </Button>
              )}
              <Button
                onClick={onGenerate}
                disabled={status === "loading"}
                className="gap-2 bg-red-500 hover:bg-red-600 text-white border-0"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating…
                  </>
                ) : news ? (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate News
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container px-4 sm:px-6 mx-auto py-8">
        {/* Error */}
        <AnimatePresence>
          {status === "failed" && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 mb-6"
            >
              Failed to generate news: {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading skeletons */}
        {status === "loading" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonCard wide />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Empty state */}
        {status === "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 gap-4 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <p className="font-semibold text-lg">No news yet</p>
              <p className="text-muted-foreground text-sm mt-1">
                Click &ldquo;Generate News&rdquo; to get the latest F1 updates
              </p>
            </div>
            <Button
              onClick={onGenerate}
              className="mt-2 bg-red-500 hover:bg-red-600 text-white border-0"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate News
            </Button>
          </motion.div>
        )}

        {/* News grid */}
        {status === "succeeded" && news && (
          <div className="space-y-4">
            {lastUpdated && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-muted-foreground"
              >
                Updated: {new Date(lastUpdated).toLocaleString("en-GB")}
              </motion.p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {news.map((item, i) => (
                <NewsCard
                  key={item.title + item.date}
                  item={item}
                  index={i}
                  featured={i === 0}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
