import Link from "next/link"
import { ArrowRight, BookOpenText, GraduationCap, Sparkles, Users2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const audiences = [
  {
    title: "Абітурієнтам",
    description:
      "Швидко дізнайся про спеціальності, вступ, конкурсні предмети та кроки подачі документів.",
    icon: GraduationCap,
  },
  {
    title: "Студентам",
    description:
      "Отримуй відповіді про розклад, навчальні курси, рекомендації для підготовки та цифрові сервіси кафедри.",
    icon: BookOpenText,
  },
  {
    title: "Викладачам",
    description:
      "Підтримка в комунікації зі студентами, доступ до організаційної інформації та швидкі уточнення по процесах.",
    icon: Users2,
  },
]

export default function Home() {
  return (
    <main className="relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#6d5efc1a,transparent_55%)]" />
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-20 md:px-10">
        <Badge variant="secondary" className="mb-6 w-fit gap-1.5 text-xs">
          <Sparkles className="size-3.5" />
          AI-помічник кафедри математичного моделювання ЧНУ
        </Badge>

        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Розумний чат-помічник для навчання, вступу та роботи кафедри
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Став запитання простою мовою та отримуй короткі, корисні відповіді про
              кафедру математичного моделювання факультету математики та інформатики
              ЧНУ. Один простір для абітурієнтів, студентів і викладачів.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild size="lg" className="gap-2">
                <Link href="/chat">
                  Перейти до чату <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <Card className="border-border/60 bg-card/80 backdrop-blur">
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">Що вміє помічник</CardTitle>
              <CardDescription>
                Відповідає швидко, структуровано і з фокусом на ваш контекст.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="rounded-lg border border-border/70 bg-background/70 p-4">
                Роз&apos;яснює умови вступу, допомагає орієнтуватися в навчальному
                процесі та підказує актуальну інформацію для роботи кафедри.
              </div>
              <div className="rounded-lg border border-border/70 bg-background/70 p-4">
                Працює у форматі діалогу: уточнює запит, тримає контекст і дає
                відповідь без зайвої бюрократії.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {audiences.map(item => {
            const Icon = item.icon

            return (
              <Card key={item.title} className="border-border/60">
                <CardHeader className="space-y-3">
                  <div className="w-fit rounded-md border border-border/80 bg-muted/50 p-2">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </main>
  )
}
