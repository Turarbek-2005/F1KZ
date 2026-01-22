"use client";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/shared/store";
import { generateNews, clearNews } from "@/entities/ai/aiSlice";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Loader2 } from "lucide-react";

export default function GenerateNews() {
  const dispatch = useDispatch<AppDispatch>();

  const { news, status, error, lastUpdated } = useSelector(
    (state: RootState) => state.ai,
  );

  const onGenerate = () => {
    dispatch(
      generateNews({
        prompt:
          'Ты — спортивный новостной редактор сайта о Formula 1. Сгенерируй актуальные новости Формулы-1 2026 в нейтральном журналистском стиле.\n\nТребования:\n- Пиши КРАТКО и по делу\n- Без художественных вступлений и рассуждений\n- Без Markdown\n- Только факты\n- Дата считается текущей\n\nФормат ответа СТРОГО JSON:\n{\n  "news": [\n    {\n      "title": "Заголовок новости",\n      "summary": "Краткое описание (2–3 предложения)",\n      "category": "race | transfers | teams | drivers | technical",\n      "date": "YYYY-MM-DD"\n    }\n  ]\n}\n\nКоличество новостей: 5',
      }),
    );
    console.log(news, status, error);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex gap-4 mb-4">
        <Button onClick={onGenerate} disabled={status === "loading"}>
          {status === "loading" ? "Генерация..." : "Сгенерировать новости"}
        </Button>

        <Button onClick={() => dispatch(clearNews())} variant="destructive">
          Очистить
        </Button>
      </div>

      {status === "failed" && <p className="text-red-500">Ошибка: {error}</p>}
      {status === "loading" && (
          <Loader2 className="animate-spin h-16 w-16" />
      )}
      {status === "succeeded" && news && (
        <div>
          <div className="mb-4 text-sm text-gray-500">
            Обновлено: {lastUpdated && new Date(lastUpdated).toLocaleString()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {news.map((item) => (
              <Card key={item.title + item.date}>
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{item.summary}</p>
                </CardContent>
                <CardFooter>
                  <span className="text-sm text-gray-500">
                    {item.category} · {item.date}
                  </span>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
