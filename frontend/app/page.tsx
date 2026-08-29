"use client";

import { useState } from "react";

type Result = {
  location: string;
  activity: string;
  preferred_time: string;

  temperature: number;
  temperature_c?: number;
  humidity?: number | null;
  heat_index?: number | null;
  aqi?: number | null;

  risk: string;

  recommendation: string;
  reasoning: string;

  ai_available: boolean;
};

export default function Home() {
  const [location, setLocation] = useState("");
  const [activity, setActivity] = useState("");
  const [time, setTime] = useState("14:00");

  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyzeActivity() {
    setError("");
    setResult(null);

    if (!location.trim()) {
      setError("Please enter a location.");
      return;
    }

    if (!activity) {
      setError("Please choose an activity.");
      return;
    }

    if (!time.trim()) {
      setError("Please enter a preferred time.");
      return;
    }

    setLoading(true);

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://127.0.0.1:8000";

      const response = await fetch(`${backendUrl}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location: location.trim(),
          activity,
          time: time.trim(),
        }),
      });

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The backend returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Thermal analysis failed."
        );
      }

      setResult(data);
    } catch (err) {
      console.error("ThermalGuide error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Could not connect to the ThermalGuide backend."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function getRiskClass(risk: string) {
    const value = risk.toLowerCase();

    if (value === "extreme") {
      return "border-red-500/40 bg-red-500/10 text-red-400";
    }

    if (value === "high") {
      return "border-pink-500/40 bg-pink-500/10 text-pink-400";
    }

    if (value === "moderate") {
      return "border-yellow-500/40 bg-yellow-500/10 text-yellow-400";
    }

    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
  }

  function getRiskDescription(risk: string) {
    const value = risk.toLowerCase();

    if (value === "extreme") {
      return "Outdoor activity is strongly discouraged under these conditions.";
    }

    if (value === "high") {
      return "Significant thermal stress is possible during activity.";
    }

    if (value === "moderate") {
      return "Take precautions and monitor your condition during activity.";
    }

    return "Conditions appear relatively comfortable for outdoor activity.";
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="border-b border-white/10">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-500">
              <span className="font-bold text-black">
                T
              </span>
            </div>

            <span className="text-xl font-semibold">
              ThermalGuide
            </span>

          </div>

          <div className="flex items-center gap-3">

            <span className="hidden text-sm text-zinc-500 sm:block">
              ClimateHealth Intelligence
            </span>

            <div className="h-2 w-2 rounded-full bg-emerald-400" />

            <span className="text-xs text-emerald-400">
              Online
            </span>

          </div>

        </div>

      </nav>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden">

        <div className="pointer-events-none absolute left-1/2 top-10 h-96 w-96 -translate-x-1/2 rounded-full bg-pink-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-6 pb-14 pt-24 text-center">

          <div className="mb-6 inline-flex rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-2 text-sm text-pink-400">
            AI-powered climate intelligence
          </div>

          <h1 className="text-5xl font-bold tracking-tight md:text-7xl">

            Plan smarter.

            <br />

            <span className="text-pink-500">
              Move with the heat.
            </span>

          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">

            ThermalGuide analyzes real environmental conditions
            and your activity to help you make smarter outdoor
            planning decisions.

          </p>

        </div>

      </section>


      {/* =====================================================
          ACTIVITY PLANNER
      ===================================================== */}

      <section className="mx-auto max-w-5xl px-6 pb-16">

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">

          <div className="mb-8">

            <p className="text-xs uppercase tracking-[0.25em] text-pink-400">
              Activity Planner
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Check your thermal conditions
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Tell ThermalGuide where, what, and when.
            </p>

          </div>


          <div className="grid gap-6 md:grid-cols-3">

            {/* LOCATION */}

            <div>

              <label
                htmlFor="location"
                className="mb-2 block text-sm text-zinc-400"
              >
                Location
              </label>

              <input
                id="location"
                type="text"
                placeholder="Phoenix,Arizona"
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition focus:border-pink-500"
              />

            </div>


            {/* ACTIVITY */}

            <div>

              <label
                htmlFor="activity"
                className="mb-2 block text-sm text-zinc-400"
              >
                Activity
              </label>

              <select
                id="activity"
                value={activity}
                onChange={(e) =>
                  setActivity(e.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-pink-500"
              >

                <option value="" className="bg-zinc-900">
                  Choose activity
                </option>

                <option value="Hiking" className="bg-zinc-900">
                  Hiking
                </option>

                <option value="Running" className="bg-zinc-900">
                  Running
                </option>

                <option value="Walking" className="bg-zinc-900">
                  Walking
                </option>

                <option value="Cycling" className="bg-zinc-900">
                  Cycling
                </option>

                <option value="Camping" className="bg-zinc-900">
                  Camping
                </option>

                <option value="Outdoor Dining" className="bg-zinc-900">
                  Outdoor Dining
                </option>

              </select>

            </div>


            {/* TIME */}

            <div>

              <label
                htmlFor="time"
                className="mb-2 block text-sm text-zinc-400"
              >
                Preferred time
              </label>

              <input
                id="time"
                type="time"
                value={time}
                onChange={(e) =>
                  setTime(e.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-pink-500"
              />

              <p className="mt-2 text-xs text-zinc-600">
                12-hour format
              </p>

            </div>

          </div>


          {/* ERROR */}

          {error && (

            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>

          )}


          {/* BUTTON */}

          <button
            onClick={analyzeActivity}
            disabled={loading}
            className="mt-8 w-full rounded-xl bg-pink-500 px-6 py-4 font-semibold text-black transition hover:bg-pink-400 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {loading ? (

              <span className="flex items-center justify-center gap-3">

                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />

                Running thermal analysis...

              </span>

            ) : (

              "Analyze Thermal Conditions"

            )}

          </button>

        </div>

      </section>


      {/* =====================================================
          RESULTS
      ===================================================== */}

      {result && (

        <section className="mx-auto max-w-5xl px-6 pb-20">


          {/* RESULT HEADER */}

          <div className="mb-8">

            <p className="text-xs uppercase tracking-[0.25em] text-pink-400">
              Thermal Analysis
            </p>

            <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">

              <div>

                <h2 className="text-3xl font-bold">
                  Your {result.activity} plan
                </h2>

                <p className="mt-2 text-zinc-500">

                  {result.location}

                  {" · "}

                  Preferred time: {result.preferred_time}

                </p>

              </div>


              <div
                className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-semibold ${getRiskClass(
                  result.risk
                )}`}
              >
                {result.risk} thermal exposure
              </div>

            </div>

          </div>


          {/* =================================================
              ENVIRONMENTAL SUMMARY
          ================================================= */}

          <div className="grid gap-5 md:grid-cols-3">


            {/* TEMPERATURE */}

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">

              <p className="text-sm text-zinc-500">
                Current temperature
              </p>

              <div className="mt-3 flex items-baseline gap-2">

                <span className="text-5xl font-bold">
                  {result.temperature}
                </span>

                <span className="text-xl text-zinc-500">
                  °F
                </span>

              </div>

              {result.temperature_c !== undefined && (

                <p className="mt-2 text-sm text-zinc-600">
                  {result.temperature_c}°C
                </p>

              )}

            </div>


            {/* HEAT INDEX */}

            <div className="rounded-2xl border border-pink-500/20 bg-pink-500/5 p-6">

              <p className="text-sm text-zinc-500">
                Heat exposure
              </p>

              <p className="mt-3 text-4xl font-bold text-pink-400">

                {result.heat_index ??
                  result.temperature}
                °F

              </p>

              <p className="mt-2 text-sm text-zinc-600">
                Thermal condition estimate
              </p>

            </div>


            {/* RISK */}

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">

              <p className="text-sm text-zinc-500">
                Activity risk
              </p>

              <p className="mt-3 text-4xl font-bold">
                {result.risk}
              </p>

              <p className="mt-2 text-sm text-zinc-600">
                Based on environmental conditions
                and activity intensity
              </p>

            </div>

          </div>


          {/* =================================================
              AI RECOMMENDATION
          ================================================= */}

          <div className="mt-6 rounded-2xl border border-pink-500/30 bg-pink-500/10 p-8">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500">

                <span className="font-bold text-black">
                  AI
                </span>

              </div>

              <div>

                <p className="text-xs uppercase tracking-[0.2em] text-pink-400">
                  AI Recommendation
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  Personalized outdoor guidance
                </p>

              </div>

            </div>


            <p className="mt-6 max-w-3xl text-xl font-semibold leading-8">
              {result.recommendation}
            </p>

          </div>


          {/* =================================================
              THERMAL INTELLIGENCE
              REPLACES ANALYSIS PIPELINE
          ================================================= */}

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8">


            {/* HEADER */}

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

              <div>

                <p className="text-xs uppercase tracking-[0.25em] text-pink-400">
                  Thermal Intelligence
                </p>

                <h3 className="mt-2 text-2xl font-semibold">
                  What is influencing your risk?
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                  ThermalGuide combines environmental conditions
                  with your planned activity to estimate outdoor
                  exposure.
                </p>

              </div>


              <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2">

                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

                <span className="text-xs text-emerald-400">
                  Environmental data analyzed
                </span>

              </div>

            </div>


            {/* THERMAL PROFILE */}

            <div className="mt-8 grid gap-5 md:grid-cols-3">


              {/* TEMPERATURE */}

              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-6 transition hover:border-pink-500/30">

                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-pink-500/10 blur-2xl" />

                <div className="relative">

                  <div className="flex items-center justify-between">

                    <span className="text-sm text-zinc-500">
                      Temperature
                    </span>

                    <span className="text-xs text-zinc-600">
                      AIR
                    </span>

                  </div>

                  <div className="mt-5 flex items-end gap-2">

                    <span className="text-4xl font-bold">
                      {result.temperature}
                    </span>

                    <span className="mb-1 text-zinc-500">
                      °F
                    </span>

                  </div>

                  {result.temperature_c !== undefined && (

                    <p className="mt-2 text-xs text-zinc-600">
                      {result.temperature_c}°C
                    </p>

                  )}

                </div>

              </div>


              {/* FEELS LIKE */}

              <div className="group relative overflow-hidden rounded-2xl border border-pink-500/20 bg-pink-500/[0.04] p-6 transition hover:border-pink-500/40">

                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-pink-500/20 blur-3xl" />

                <div className="relative">

                  <div className="flex items-center justify-between">

                    <span className="text-sm text-zinc-500">
                      Feels-like heat
                    </span>

                    <span className="text-xs text-pink-400">
                      HEAT INDEX
                    </span>

                  </div>

                  <div className="mt-5 flex items-end gap-2">

                    <span className="text-4xl font-bold text-pink-400">
                      {result.heat_index ??
                        result.temperature}
                    </span>

                    <span className="mb-1 text-zinc-500">
                      °F
                    </span>

                  </div>

                  <p className="mt-2 text-xs text-zinc-600">
                    Estimated thermal exposure
                  </p>

                </div>

              </div>


              {/* ACTIVITY */}

              <div className="rounded-2xl border border-white/10 bg-black/20 p-6">

                <div className="flex items-center justify-between">

                  <span className="text-sm text-zinc-500">
                    Planned activity
                  </span>

                  <span className="text-xs text-zinc-600">
                    ACTIVITY
                  </span>

                </div>

                <p className="mt-5 text-2xl font-semibold">
                  {result.activity}
                </p>

                <p className="mt-2 text-xs text-zinc-600">
                  Planned for {result.preferred_time}
                </p>

              </div>

            </div>


            {/* ENVIRONMENTAL FACTORS */}

            <div className="mt-8">

              <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">
                Environmental factors
              </p>


              <div className="mt-4 grid gap-4 md:grid-cols-3">


                {/* HUMIDITY */}

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">

                  <div className="flex items-center justify-between">

                    <span className="text-sm text-zinc-400">
                      Humidity
                    </span>

                    <span className="text-xs text-zinc-600">
                      RH
                    </span>

                  </div>

                  <div className="mt-4 flex items-end gap-2">

                    <span className="text-3xl font-bold">

                      {result.humidity !== null &&
                      result.humidity !== undefined
                        ? result.humidity
                        : "—"}

                    </span>

                    {result.humidity !== null &&
                    result.humidity !== undefined && (

                      <span className="mb-1 text-sm text-zinc-600">
                        %
                      </span>

                    )}

                  </div>


                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">

                    <div
                      className="h-full rounded-full bg-pink-500 transition-all"
                      style={{
                        width:
                          result.humidity !== null &&
                          result.humidity !== undefined
                            ? `${Math.min(
                                result.humidity,
                                100
                              )}%`
                            : "0%",
                      }}
                    />

                  </div>

                </div>


                {/* AQI */}

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">

                  <div className="flex items-center justify-between">

                    <span className="text-sm text-zinc-400">
                      Air quality
                    </span>

                    <span className="text-xs text-zinc-600">
                      AQI
                    </span>

                  </div>

                  <div className="mt-4 flex items-end gap-2">

                    <span className="text-3xl font-bold">

                      {result.aqi !== null &&
                      result.aqi !== undefined
                        ? result.aqi
                        : "—"}

                    </span>

                  </div>

                  <p className="mt-3 text-xs text-zinc-600">
                    Outdoor air quality indicator
                  </p>

                </div>


                {/* RISK */}

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">

                  <div className="flex items-center justify-between">

                    <span className="text-sm text-zinc-400">
                      Exposure level
                    </span>

                    <span className="text-xs text-zinc-600">
                      RISK
                    </span>

                  </div>

                  <div className="mt-4">

                    <span
                      className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${getRiskClass(
                        result.risk
                      )}`}
                    >
                      {result.risk}
                    </span>

                  </div>

                  <p className="mt-4 text-xs leading-5 text-zinc-600">
                    {getRiskDescription(result.risk)}
                  </p>

                </div>

              </div>

            </div>


            {/* WHY THIS RESULT */}

            <div className="mt-6 rounded-2xl border border-pink-500/20 bg-gradient-to-r from-pink-500/[0.07] to-transparent p-6">

              <div className="flex gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500 text-sm font-bold text-black">
                  AI
                </div>

                <div>

                  <p className="text-xs uppercase tracking-[0.2em] text-pink-400">
                    Why this result?
                  </p>

                  <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
                    {result.reasoning}
                  </p>

                </div>

              </div>

            </div>


            {/* RECOMMENDED ACTION */}

            <div className="mt-6 flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#0d0d0f] p-6 md:flex-row md:items-center md:justify-between">

              <div>

                <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">
                  Recommended action
                </p>

                <p className="mt-2 max-w-2xl text-lg font-semibold">
                  {result.recommendation}
                </p>

              </div>


              <div
                className={`hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border md:flex ${getRiskClass(
                  result.risk
                )}`}
              >

                <span className="text-lg">
                  →
                </span>

              </div>

            </div>

          </div>


          {/* =================================================
              SAFETY ACTION PLAN
          ================================================= */}

          <div className="mt-6 rounded-2xl border border-white/10 bg-[#111113] p-8">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-medium uppercase tracking-[0.25em] text-pink-400">
                  Safety Action Plan
                </p>

                <h3 className="mt-2 text-xl font-semibold">
                  Before you head outside
                </h3>

              </div>


              <div className="hidden h-10 w-10 items-center justify-center rounded-full border border-pink-500/30 bg-pink-500/10 md:flex">

                <span className="text-pink-400">
                  ✓
                </span>

              </div>

            </div>


            <div className="mt-7 grid gap-4 md:grid-cols-3">


              {/* HYDRATE */}

              <div className="rounded-xl border border-white/10 bg-black/20 p-5">

                <div className="text-pink-400">
                  01
                </div>

                <h4 className="mt-3 font-semibold">
                  Hydrate
                </h4>

                <p className="mt-2 text-sm leading-6 text-zinc-500">

                  Carry water and drink regularly,
                  especially during higher-intensity
                  activities.

                </p>

              </div>


              {/* COOLER HOURS */}

              <div className="rounded-xl border border-white/10 bg-black/20 p-5">

                <div className="text-pink-400">
                  02
                </div>

                <h4 className="mt-3 font-semibold">
                  Choose cooler hours
                </h4>

                <p className="mt-2 text-sm leading-6 text-zinc-500">

                  When thermal exposure is high,
                  consider early morning or evening
                  instead of peak heat.

                </p>

              </div>


              {/* MONITOR */}

              <div className="rounded-xl border border-white/10 bg-black/20 p-5">

                <div className="text-pink-400">
                  03
                </div>

                <h4 className="mt-3 font-semibold">
                  Monitor yourself
                </h4>

                <p className="mt-2 text-sm leading-6 text-zinc-500">

                  Take breaks and stop the activity
                  if you begin feeling unwell.

                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              RESULT FOOTER
          ================================================= */}

          <div className="mt-8 text-center">

            <p className="text-xs text-zinc-600">
              ThermalGuide · FortyGuard Environmental Data ·
              AI ClimateHealth Analysis
            </p>

          </div>

        </section>

      )}


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-white/10 py-8 text-center">

        <p className="text-sm text-zinc-600">
          ThermalGuide · ClimateHealth Intelligence
        </p>

        <p className="mt-2 text-xs text-zinc-700">
          Make better outdoor decisions with environmental intelligence.
        </p>

      </footer>

    </main>
  );
}
