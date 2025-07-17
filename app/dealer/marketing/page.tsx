"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Notification, useNotification } from "@/components/notification"

export default function MarketingPage() {
  const [lang, setLang] = useState("pt")
  const { notification, showNotification, hideNotification } = useNotification()

  const translations = {
    pt: {
      Marketing: "Marketing",
      "Marketing Tools and Resources": "Ferramentas e Recursos de Marketing",
      "Access marketing materials, manuals, warranty information, and content creation tools.":
        "Acesse materiais de marketing, manuais, informações de garantia e ferramentas de criação de conteúdo.",
      "Back to Dashboard": "Voltar ao Painel",
      Manual: "Manual",
      "User Manual": "Manual do Usuário",
      "Access product manuals and documentation": "Acesse manuais de produtos e documentação",
      Warranty: "Garantia",
      "Warranty Information": "Informações de Garantia",
      "Manage warranty certificates and information": "Gerencie certificados e informações de garantia",
      Content: "Conteúdo",
      "Content Creation": "Criação de Conteúdo",
      "Create and manage marketing content": "Crie e gerencie conteúdo de marketing",
      "Coming Soon": "Em Breve",
      "This feature will be available soon.": "Esta funcionalidade estará disponível em breve.",
    },
    en: {
      Marketing: "Marketing",
      "Marketing Tools and Resources": "Marketing Tools and Resources",
      "Access marketing materials, manuals, warranty information, and content creation tools.":
        "Access marketing materials, manuals, warranty information, and content creation tools.",
      "Back to Dashboard": "Back to Dashboard",
      Manual: "Manual",
      "User Manual": "User Manual",
      "Access product manuals and documentation": "Access product manuals and documentation",
      Warranty: "Warranty",
      "Warranty Information": "Warranty Information",
      "Manage warranty certificates and information": "Manage warranty certificates and information",
      Content: "Content",
      "Content Creation": "Content Creation",
      "Create and manage marketing content": "Create and manage marketing content",
      "Coming Soon": "Coming Soon",
      "This feature will be available soon.": "This feature will be available soon.",
    },
    es: {
      Marketing: "Marketing",
      "Marketing Tools and Resources": "Herramientas y Recursos de Marketing",
      "Access marketing materials, manuals, warranty information, and content creation tools.":
        "Acceda a materiales de marketing, manuales, información de garantía y herramientas de creación de contenido.",
      "Back to Dashboard": "Volver al Panel",
      Manual: "Manual",
      "User Manual": "Manual del Usuario",
      "Access product manuals and documentation": "Acceda a manuales de productos y documentación",
      Warranty: "Garantía",
      "Warranty Information": "Información de Garantía",
      "Manage warranty certificates and information": "Gestione certificados e información de garantía",
      Content: "Contenido",
      "Content Creation": "Creación de Contenido",
      "Create and manage marketing content": "Cree y gestione contenido de marketing",
      "Coming Soon": "Próximamente",
      "This feature will be available soon.": "Esta funcionalidad estará disponible pronto.",
    },
  }

  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLang") || "pt"
    setLang(savedLang)
  }, [])

  const t = (key: keyof (typeof translations)["pt"]) => {
    return translations[lang as keyof typeof translations][key] || key
  }

  const handleButtonClick = (buttonType: string) => {
    showNotification(`${t("Coming Soon")} - ${buttonType}`, "info")
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-5">
          <Link
            href="/dealer/dashboard"
            className="inline-flex items-center text-blue-900 font-semibold hover:underline"
          >
            ← {t("Back to Dashboard")}
          </Link>
        </div>

        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <Image src="/images/marketing.png" alt="Marketing" width={80} height={80} className="rounded-lg" />
          </div>
          <h1 className="text-4xl font-bold text-blue-900 mb-4">{t("Marketing")}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t("Marketing Tools and Resources")}</p>
          <p className="text-gray-500 mt-2 max-w-3xl mx-auto">
            {t("Access marketing materials, manuals, warranty information, and content creation tools.")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Manual Button */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
            <button onClick={() => handleButtonClick(t("Manual"))} className="w-full group">
              <div className="flex justify-center mb-4">
                <Image
                  src="/images/manual.png"
                  alt="Manual"
                  width={64}
                  height={64}
                  className="group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2 group-hover:text-blue-700">{t("Manual")}</h3>
              <h4 className="text-lg font-semibold text-gray-700 mb-3">{t("User Manual")}</h4>
              <p className="text-gray-600 text-sm">{t("Access product manuals and documentation")}</p>
            </button>
          </div>

          {/* Warranty Button */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
            <button onClick={() => handleButtonClick(t("Warranty"))} className="w-full group">
              <div className="flex justify-center mb-4">
                <Image
                  src="/images/garantia.png"
                  alt="Warranty"
                  width={64}
                  height={64}
                  className="group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2 group-hover:text-blue-700">{t("Warranty")}</h3>
              <h4 className="text-lg font-semibold text-gray-700 mb-3">{t("Warranty Information")}</h4>
              <p className="text-gray-600 text-sm">{t("Manage warranty certificates and information")}</p>
            </button>
          </div>

          {/* Content Button */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
            <button onClick={() => handleButtonClick(t("Content"))} className="w-full group">
              <div className="flex justify-center mb-4">
                <Image
                  src="/images/conteudo.png"
                  alt="Content"
                  width={64}
                  height={64}
                  className="group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2 group-hover:text-blue-700">{t("Content")}</h3>
              <h4 className="text-lg font-semibold text-gray-700 mb-3">{t("Content Creation")}</h4>
              <p className="text-gray-600 text-sm">{t("Create and manage marketing content")}</p>
            </button>
          </div>
        </div>
      </div>

      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </div>
  )
}
