"use client"

import { useState } from "react"
import { Mail, MapPin, Phone, Send } from "lucide-react"

export default function ContactPage() {
  const [sent, setSent] = useState(false)

  return (
    <main className="min-h-[calc(100svh-4.5rem)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/10 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="relative overflow-hidden bg-[#252625] p-8 text-white sm:p-12">
          <div className="relative z-10">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Creative Readers</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Contact Information</h1>
            <p className="mt-4 max-w-sm text-base leading-7 text-slate-300">Say something to start a live chat with our school team.</p>

            <div className="mt-16 space-y-8">
              <ContactItem icon={Phone} text="+252 63 631 5723" />
              <ContactItem icon={Mail} text="info@creativereaders.school" />
              <ContactItem icon={MapPin} text="Creative Readers Publication School" />
            </div>
          </div>
          <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/5" />
          <div className="absolute bottom-12 right-14 h-20 w-20 rounded-full bg-emerald-400/20" />
        </aside>

        <div className="p-8 sm:p-12">
          <h2 className="text-2xl font-bold text-slate-900">Send us a message</h2>
          <p className="mt-2 text-slate-500">We will get back to you as soon as possible.</p>

          <form onSubmit={(event) => { event.preventDefault(); setSent(true) }} className="mt-8 grid gap-6 sm:grid-cols-2">
            <Field label="First name" name="firstName" placeholder="Enter your first name" required />
            <Field label="Last name" name="lastName" placeholder="Enter your last name" required />
            <Field label="Email" name="email" type="email" placeholder="you@example.com" required />
            <Field label="Phone number" name="phone" type="tel" placeholder="+252 ..." />

            <fieldset className="sm:col-span-2">
              <legend className="text-sm font-semibold text-slate-700">Select subject</legend>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-600">
                {["General inquiry", "Admissions", "Student support", "Technical support"].map((subject) => <label key={subject} className="flex cursor-pointer items-center gap-2"><input type="radio" name="subject" value={subject} defaultChecked={subject === "General inquiry"} className="h-4 w-4 accent-emerald-600" />{subject}</label>)}
              </div>
            </fieldset>

            <label className="sm:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Message</span>
              <textarea name="message" required placeholder="Write your message..." className="mt-2 min-h-32 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
              {sent ? <p className="text-sm font-semibold text-emerald-600">Your message has been sent.</p> : <p className="text-sm text-slate-500">Fields marked are required.</p>}
              <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#252625] px-6 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition hover:bg-emerald-700 active:scale-[0.98]"><Send className="h-4 w-4" />Send Message</button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}

function ContactItem({ icon: Icon, text }: { icon: typeof Phone; text: string }) {
  return <div className="flex items-center gap-4 text-sm font-medium text-slate-200"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-300"><Icon className="h-5 w-5" /></span>{text}</div>
}

function Field({ label, name, type = "text", placeholder, required = false }: { label: string; name: string; type?: string; placeholder: string; required?: boolean }) {
  return <label><span className="text-sm font-semibold text-slate-700">{label}</span><input name={name} type={type} placeholder={placeholder} required={required} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" /></label>
}
