import Link from "next/link"
import {
  CalendarCheck2,
  CalendarDays,
  CheckSquare,
  FileBadge2,
  HelpCircle,
} from "lucide-react"

const menuItems = [
  { label: "Attendance", description: "View your attendance", icon: CalendarCheck2, href: "/attendancestudent" },
  { label: "Result", description: "See your results", icon: FileBadge2, href: "/resultstudent" },
]

export default function AllsPage() {
  return (
    <main className="min-h-svh overflow-hidden bg-[#f8fbff] text-slate-800">
      <section className="relative mx-auto min-h-svh w-full max-w-6xl px-5 pb-12 sm:px-8 lg:px-12">
        <div className="absolute -top-32 left-1/2 h-72 w-[130%] -translate-x-1/2 rounded-[0_0_50%_50%] bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm sm:h-80" />

        <div className="relative pt-12 sm:pt-16">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-[6px] border-white bg-white shadow-xl shadow-emerald-950/15 sm:h-32 sm:w-32">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-emerald-400 bg-emerald-50 text-emerald-500 sm:h-24 sm:w-24">
              <span className="relative flex h-13 w-13 items-center justify-center rounded-full border-[3px] border-current sm:h-15 sm:w-15">
                <i className="absolute -top-0.5 left-3 h-2.5 w-2.5 rounded-full bg-current sm:left-3.5" />
                <i className="absolute -top-0.5 right-3 h-2.5 w-2.5 rounded-full bg-current sm:right-3.5" />
                <i className="mt-5 h-2.5 w-6 rounded-b-full border-b-[3px] border-current sm:w-7" />
              </span>
            </div>
          </div>

          <section className="mx-auto mt-7 max-w-2xl rounded-2xl bg-gradient-to-r from-blue-700 to-blue-600 p-5 text-white shadow-lg shadow-blue-700/25 sm:mt-8 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold sm:text-xl">Welcome Message <span aria-hidden="true">→</span></h1>
                <p className="mt-2 text-sm leading-6 text-blue-50">The student portal gives you quick access to your school information, learning activities, exams, and important notices.</p>
              </div>
            </div>
          </section>

          <section className="mx-auto mt-10 max-w-4xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-600">Student Portal</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Quick access</h2>
              </div>
              <CalendarDays className="h-7 w-7 text-emerald-500" />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {menuItems.map(({ label, description, icon: Icon, href }) => (
                <Link key={label} href={href} className="group rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-950/10 focus:outline-none focus:ring-4 focus:ring-blue-500/20 sm:p-5">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                    <Icon className="h-7 w-7" strokeWidth={2.1} />
                  </span>
                  <h3 className="mt-4 text-sm font-bold text-slate-800 sm:text-base">{label}</h3>
                  <p className="mt-1 hidden text-xs leading-5 text-slate-500 sm:block">{description}</p>
                </Link>
              ))}
              <div className="hidden rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-5 lg:block">
                <HelpCircle className="h-7 w-7 text-emerald-500" />
                <p className="mt-4 text-sm font-bold text-emerald-800">Need help?</p>
                <p className="mt-1 text-xs leading-5 text-emerald-700">Contact your school office.</p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
