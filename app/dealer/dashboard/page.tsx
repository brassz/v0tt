"use client"

import { useState, useEffect } from "react"
import { Notification, useNotification } from "@/components/notification"
import Image from "next/image"
import Link from "next/link"

export default function Dashboard() {
  const [lang, setLang] = useState<"pt" | "en" | "es">("pt")

  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLang")
    if (savedLang && ["pt", "en", "es"].includes(savedLang)) {
      setLang(savedLang as "pt" | "en" | "es")
    }
  }, [])

  const translations = {
    pt: {
      "DEALER DASHBOARD": "PAINEL DO DISTRIBUIDOR",
      "NEW BOATS": "NOVOS BARCOS",
      "TRACK ORDERS": "ACOMPANHAR PEDIDOS",
      "AFTER-SALES SERVICE": "SERVIÇO PÓS-VENDA",
      SALES: "VENDAS",
      "QUOTE CLIENT": "ORÇAMENTO CLIENTE",
      MARKETING: "MARKETING",
      "THE LEGEND OF THE VIKINGS": "A LENDA DOS VIKINGS",
    },
    en: {
      "DEALER DASHBOARD": "DEALER DASHBOARD",
      "NEW BOATS": "NEW BOATS",
      "TRACK ORDERS": "TRACK ORDERS",
      "AFTER-SALES SERVICE": "AFTER-SALES SERVICE",
      SALES: "SALES",
      "QUOTE CLIENT": "QUOTE CLIENT",
      MARKETING: "MARKETING",
      "THE LEGEND OF THE VIKINGS": "THE LEGEND OF THE VIKINGS",
    },
    es: {
      "DEALER DASHBOARD": "PANEL DEL DISTRIBUIDOR",
      "NEW BOATS": "NUEVOS BARCOS",
      "TRACK ORDERS": "SEGUIMIENTO DE PEDIDOS",
      "AFTER-SALES SERVICE": "SERVICIO POSTVENTA",
      SALES: "VENTAS",
      "QUOTE CLIENT": "COTIZACIÓN CLIENTE",
      MARKETING: "MARKETING",
      "THE LEGEND OF THE VIKINGS": "LA LEYENDA DE LOS VIKINGOS",
    },
  } as const

  const { notification, showNotification, hideNotification } = useNotification()
  const t = translations[lang]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Blue Header - Darker blue like home page */}
      <div className="bg-blue-900 py-6 px-8">
        <div className="flex justify-center items-center max-w-7xl mx-auto">
          <Image
            src="/images/logodashboard.png"
            alt="Drakkar Boats Logo"
            width={200}
            height={60}
            className="h-12 w-auto"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <h1 className="text-4xl font-bold text-blue-900 text-center mb-12">{t["DEALER DASHBOARD"]}</h1>

          {/* First Row - 3 Large Cards - Darker blue */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* New Boats */}
            <Link href="/dealer/new-boat" className="group">
              <div className="bg-blue-900 hover:bg-blue-950 rounded-2xl p-8 text-center transition-colors duration-200">
                <div className="mb-4">
                  <Image src="/images/new-boats.png" alt="New Boats" width={80} height={80} className="mx-auto" />
                </div>
                <h3 className="text-white text-lg font-bold">{t["NEW BOATS"]}</h3>
              </div>
            </Link>

            {/* Track Orders */}
            <Link href="/dealer/track-orders" className="group">
              <div className="bg-blue-900 hover:bg-blue-950 rounded-2xl p-8 text-center transition-colors duration-200">
                <div className="mb-4">
                  <Image src="/images/track-orders.png" alt="Track Orders" width={80} height={80} className="mx-auto" />
                </div>
                <h3 className="text-white text-lg font-bold">{t["TRACK ORDERS"]}</h3>
              </div>
            </Link>

            {/* After-Sales Service */}
            <Link href="/dealer/after-sales" className="group">
              <div className="bg-blue-900 hover:bg-blue-950 rounded-2xl p-8 text-center transition-colors duration-200">
                <div className="mb-4">
                  <Image src="/images/after-sales.png" alt="After Sales" width={80} height={80} className="mx-auto" />
                </div>
                <h3 className="text-white text-lg font-bold">{t["AFTER-SALES SERVICE"]}</h3>
              </div>
            </Link>
          </div>

          {/* Second Row - 3 Cards - Darker blue */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Sales */}
            <Link href="/dealer/sales" className="group">
              <div className="bg-blue-900 hover:bg-blue-950 rounded-2xl p-6 text-center transition-colors duration-200">
                <div className="mb-3">
                  <Image src="/images/venda.png" alt="Sales" width={60} height={60} className="mx-auto" />
                </div>
                <h3 className="text-white text-sm font-bold">{t.SALES}</h3>
              </div>
            </Link>

            {/* Quote Client */}
            <Link href="/dealer/quote-client" className="group">
              <div className="bg-blue-900 hover:bg-blue-950 rounded-2xl p-6 text-center transition-colors duration-200">
                <div className="mb-3">
                  <Image src="/images/quoteclient.png" alt="Quote Client" width={60} height={60} className="mx-auto" />
                </div>
                <h3 className="text-white text-sm font-bold">{t["QUOTE CLIENT"]}</h3>
              </div>
            </Link>

            {/* Marketing */}
            <Link href="/dealer/marketing" className="group">
              <div className="bg-blue-900 hover:bg-blue-950 rounded-2xl p-6 text-center transition-colors duration-200">
                <div className="mb-3">
                  <Image src="/images/marketing.png" alt="Marketing" width={60} height={60} className="mx-auto" />
                </div>
                <h3 className="text-white text-sm font-bold">{t.MARKETING}</h3>
              </div>
            </Link>
          </div>

          {/* Bottom Section with Dragon */}
          <div className="relative">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-blue-900 mb-8">{t["THE LEGEND OF THE VIKINGS"]}</h2>
            </div>

            {/* Dragon positioned to the right */}
            <div className="absolute right-0 top-0 hidden lg:block">
              <Image src="/images/dragon.png" alt="Dragon" width={200} height={150} className="opacity-80" />
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </div>
  )
}
