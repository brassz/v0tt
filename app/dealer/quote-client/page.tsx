"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Notification, useNotification } from "@/components/notification"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface EnginePackage {
  id: number
  name: string
  name_pt: string
  usd: number
  brl: number
  cost_usd?: number
  cost_brl?: number
  dealer_configured?: boolean
  margin_percentage?: number
  compatible_models?: string[]
}

interface HullColor {
  id: number
  name: string
  name_pt: string
  usd: number
  brl: number
  cost_usd?: number
  cost_brl?: number
  dealer_configured?: boolean
  margin_percentage?: number
  compatible_models?: string[]
}

interface AdditionalOption {
  id: number
  name: string
  name_pt: string
  usd: number
  brl: number
  cost_usd?: number
  cost_brl?: number
  dealer_configured?: boolean
  margin_percentage?: number
}

interface BoatModel {
  id: number
  name: string
  name_pt: string
  usd: number
  brl: number
  cost_usd?: number
  cost_brl?: number
  dealer_configured?: boolean
  margin_percentage?: number
}

interface DealerConfig {
  enginePackages: EnginePackage[]
  hullColors: HullColor[]
  additionalOptions: AdditionalOption[]
  boatModels: BoatModel[]
}

interface Quote {
  quoteId: string
  dealer: string
  customer: {
    name: string
    email: string
    phone: string
    address?: string
    city?: string
    state?: string
    zip?: string
    country?: string
  }
  model: string
  engine: string
  hull_color: string
  options: string[]
  paymentMethod?: string
  depositAmount?: number
  additionalNotes?: string
  date: string
  status: string
  totalUsd: number
  totalBrl: number
  validUntil?: string
}

export default function QuoteClientPage() {
  const router = useRouter()
  const [lang, setLang] = useState("pt")
  const [config, setConfig] = useState<DealerConfig>({
    enginePackages: [],
    hullColors: [],
    additionalOptions: [],
    boatModels: [],
  })
  const [loading, setLoading] = useState(true)
  const [filteredEngines, setFilteredEngines] = useState<EnginePackage[]>([])
  const [filteredHullColors, setFilteredHullColors] = useState<HullColor[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const quoteDetailsRef = useRef<HTMLDivElement>(null)

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [quoteToAccept, setQuoteToAccept] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_address: "",
    customer_city: "",
    customer_state: "",
    customer_zip: "",
    customer_country: "",
    boat_model: "",
    engine_package: "",
    hull_color: "",
    additional_options: [] as string[],
    payment_method: "",
    deposit_amount: "",
    additional_notes: "",
    valid_days: "30", // Validade do orçamento em dias
  })

  const translations = {
    pt: {
      "Quote Client": "Orçamento Cliente",
      "Create a new boat quote for your customers": "Crie um novo orçamento de barco para seus clientes",
      "Back to Dashboard": "Voltar ao Painel",
      "Customer Information": "Informações do Cliente",
      "Customer Name": "Nome do Cliente",
      Email: "Email",
      Phone: "Telefone",
      Address: "Endereço",
      City: "Cidade",
      State: "Estado",
      "ZIP Code": "CEP",
      Country: "País",
      "Boat Configuration": "Configuração do Barco",
      "Boat Model": "Modelo do Barco",
      "Engine Package": "Pacote de Motor",
      "Hull Color": "Cor do Casco",
      "Additional Options": "Opções Adicionais",
      "Payment Information": "Informações de Pagamento",
      "Payment Method": "Método de Pagamento",
      "Deposit Amount": "Valor do Depósito",
      "Additional Notes": "Observações Adicionais",
      "Quote Validity": "Validade do Orçamento",
      "Valid for (days)": "Válido por (dias)",
      "Quote Summary": "Resumo do Orçamento",
      "Base Price": "Preço Base",
      Engine: "Motor",
      Hull: "Casco",
      Options: "Opções",
      Total: "Total (BRL)",
      "Generate Quote": "Gerar Orçamento",
      Cancel: "Cancelar",
      "Loading configurations...": "Carregando configurações...",
      "Error loading configurations": "Erro ao carregar configurações",
      "Quote generated successfully!": "Orçamento gerado com sucesso!",
      "Please fill all required fields": "Por favor, preencha todos os campos obrigatórios",
      Cash: "À Vista",
      Financing: "Financiamento",
      "Trade-in": "Troca",
      "For Plan": "Por Plano",
      "Valid until": "Válido até",
      "Quote History": "Histórico de Orçamentos",
      "Quote ID": "ID do Orçamento",
      Date: "Data",
      Status: "Status",
      Actions: "Ações",
      Pending: "Pendente",
      Accepted: "Aceito",
      Rejected: "Rejeitado",
      Expired: "Expirado",
      "Turn into Order": "Virar Pedido",
      "View Details": "Ver Detalhes",
      "Quote Details": "Detalhes do Orçamento",
      Close: "Fechar",
      "No quotes found.": "Nenhum orçamento encontrado.",
      "Quote accepted and converted to order successfully!": "Orçamento aceito e convertido em pedido com sucesso!",
      "Error accepting quote": "Erro ao aceitar orçamento",
      "Are you sure you want to convert this quote into an order?":
        "Tem certeza que deseja converter este orçamento em um pedido?",
      "Confirm Conversion": "Confirmar Conversão",
      Print: "Imprimir",
      "Generate PDF": "Gerar PDF",
      "Generating PDF...": "Gerando PDF...",
      "PDF generated successfully!": "PDF gerado com sucesso!",
      "Error generating PDF": "Erro ao gerar PDF",
      "Sale Price": "Preço de Venda",
      "Cost Price": "Preço de Custo",
      "Dealer Margin": "Margem do Dealer",
    },
    en: {
      "Quote Client": "Quote Client",
      "Create a new boat quote for your customers": "Create a new boat quote for your customers",
      "Back to Dashboard": "Back to Dashboard",
      "Customer Information": "Customer Information",
      "Customer Name": "Customer Name",
      Email: "Email",
      Phone: "Phone",
      Address: "Address",
      City: "City",
      State: "State",
      "ZIP Code": "ZIP Code",
      Country: "Country",
      "Boat Configuration": "Boat Configuration",
      "Boat Model": "Boat Model",
      "Engine Package": "Engine Package",
      "Hull Color": "Hull Color",
      "Additional Options": "Additional Options",
      "Payment Information": "Payment Information",
      "Payment Method": "Payment Method",
      "Deposit Amount": "Deposit Amount",
      "Additional Notes": "Additional Notes",
      "Quote Validity": "Quote Validity",
      "Valid for (days)": "Valid for (days)",
      "Quote Summary": "Quote Summary",
      "Base Price": "Base Price",
      Engine: "Engine",
      Hull: "Hull",
      Options: "Options",
      Total: "Total (USD)",
      "Generate Quote": "Generate Quote",
      Cancel: "Cancel",
      "Loading configurations...": "Loading configurations...",
      "Error loading configurations": "Error loading configurations",
      "Quote generated successfully!": "Quote generated successfully!",
      "Please fill all required fields": "Please fill all required fields",
      Cash: "Cash",
      Financing: "Financing",
      "Trade-in": "Trade-in",
      "For Plan": "For Plan",
      "Valid until": "Valid until",
      "Quote History": "Quote History",
      "Quote ID": "Quote ID",
      Date: "Date",
      Status: "Status",
      Actions: "Actions",
      Pending: "Pending",
      Accepted: "Accepted",
      Rejected: "Rejected",
      Expired: "Expired",
      "Turn into Order": "Turn into Order",
      "View Details": "View Details",
      "Quote Details": "Quote Details",
      Close: "Close",
      "No quotes found.": "No quotes found.",
      "Quote accepted and converted to order successfully!": "Quote accepted and converted to order successfully!",
      "Error accepting quote": "Error accepting quote",
      "Are you sure you want to convert this quote into an order?":
        "Are you sure you want to convert this quote into an order?",
      "Confirm Conversion": "Confirm Conversion",
      Print: "Print",
      "Generate PDF": "Generate PDF",
      "Generating PDF...": "Generating PDF...",
      "PDF generated successfully!": "PDF generated successfully!",
      "Error generating PDF": "Error generating PDF",
      "Sale Price": "Sale Price",
      "Cost Price": "Cost Price",
      "Dealer Margin": "Dealer Margin",
    },
    es: {
      "Quote Client": "Cotización Cliente",
      "Create a new boat quote for your customers": "Cree una nueva cotización de barco para sus clientes",
      "Back to Dashboard": "Volver al Panel",
      "Customer Information": "Información del Cliente",
      "Customer Name": "Nombre del Cliente",
      Email: "Correo Electrónico",
      Phone: "Teléfono",
      Address: "Dirección",
      City: "Ciudad",
      State: "Estado",
      "ZIP Code": "Código Postal",
      Country: "País",
      "Boat Configuration": "Configuración del Barco",
      "Boat Model": "Modelo del Barco",
      "Engine Package": "Paquete de Motor",
      "Hull Color": "Color del Casco",
      "Additional Options": "Opciones Adicionales",
      "Payment Information": "Información de Pago",
      "Payment Method": "Método de Pago",
      "Deposit Amount": "Monto del Depósito",
      "Additional Notes": "Notas Adicionales",
      "Quote Validity": "Validez de la Cotización",
      "Valid for (días)": "Válido por (días)",
      "Quote Summary": "Resumen de la Cotización",
      "Base Price": "Precio Base",
      Engine: "Motor",
      Hull: "Casco",
      Options: "Opciones",
      Total: "Total (USD)",
      "Generate Quote": "Generar Cotización",
      Cancel: "Cancelar",
      "Loading configurations...": "Cargando configuraciones...",
      "Error loading configurations": "Error al cargar configuraciones",
      "Quote generated successfully!": "¡Cotización generada con éxito!",
      "Please fill all required fields": "Por favor, complete todos los campos requeridos",
      Cash: "Efectivo",
      Financing: "Financiamiento",
      "Trade-in": "Intercambio",
      "For Plan": "Por Plan",
      "Valid until": "Válido hasta",
      "Quote History": "Historial de Cotizaciones",
      "Quote ID": "ID de Cotización",
      Date: "Fecha",
      Status: "Estado",
      Actions: "Acciones",
      Pending: "Pendiente",
      Accepted: "Aceptado",
      Rejected: "Rechazado",
      Expired: "Expirado",
      "Turn into Order": "Convertir en Pedido",
      "View Details": "Ver Detalles",
      "Quote Details": "Detalles de la Cotización",
      Close: "Cerrar",
      "No quotes found.": "No se encontraron cotizaciones.",
      "Quote accepted and converted to order successfully!": "¡Cotización aceptada y convertida en pedido con éxito!",
      "Error accepting quote": "Error al aceptar la cotización",
      "Are you sure you want to convert this quote into an order?":
        "¿Está seguro de que desea convertir esta cotización en un pedido?",
      "Confirm Conversion": "Confirmar Conversión",
      Print: "Imprimir",
      "Generate PDF": "Generar PDF",
      "Generating PDF...": "Generando PDF...",
      "PDF generated successfully!": "¡PDF generado con éxito!",
      "Error generating PDF": "Error al generar PDF",
      "Sale Price": "Precio de Venta",
      "Cost Price": "Precio de Costo",
      "Dealer Margin": "Margen del Distribuidor",
    },
  }

  const { notification, showNotification, hideNotification } = useNotification()

  // Safely format numbers that might be undefined / null
  const fmt = (n?: number | null) => Number(n ?? 0).toLocaleString()

  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLang") || "pt"
    setLang(savedLang)
    loadDealerConfig()
    loadQuotes()
  }, [])

  useEffect(() => {
    if (formData.boat_model && config.enginePackages.length > 0) {
      const compatibleEngines = config.enginePackages.filter((engine) =>
        engine.compatible_models?.includes(formData.boat_model),
      )
      setFilteredEngines(compatibleEngines)
    } else {
      setFilteredEngines([])
    }
  }, [formData.boat_model, config.enginePackages])

  useEffect(() => {
    if (formData.boat_model && config.hullColors.length > 0) {
      const compatibleColors = config.hullColors.filter(
        (color) =>
          !color.compatible_models ||
          color.compatible_models.length === 0 ||
          color.compatible_models.includes(formData.boat_model),
      )
      setFilteredHullColors(compatibleColors)
    } else {
      setFilteredHullColors(config.hullColors)
    }
  }, [formData.boat_model, config.hullColors])

  const loadDealerConfig = async () => {
    try {
      setLoading(true)
      const dealerId = localStorage.getItem("currentDealerId")

      // Passar dealer_id para obter preços específicos do dealer
      const url = dealerId ? `/api/get-dealer-config?dealer_id=${dealerId}` : "/api/get-dealer-config"
      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setConfig(result.data)
        console.log("Configurações carregadas com preços do dealer:", result.data)
      } else {
        showNotification(translations[lang as keyof typeof translations]["Error loading configurations"], "error")
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error)
      showNotification(translations[lang as keyof typeof translations]["Error loading configurations"], "error")
    } finally {
      setLoading(false)
    }
  }

  const loadQuotes = async () => {
    try {
      const dealerName = localStorage.getItem("currentDealerName")
      if (!dealerName) {
        console.error("Dealer name not found in localStorage.")
        return
      }
      const response = await fetch(`/api/get-dealer-quotes?dealerName=${dealerName}`)
      const result = await response.json()

      if (result.success) {
        setQuotes(result.data)
      } else {
        showNotification("Error loading quotes: " + result.error, "error")
      }
    } catch (error) {
      console.error("Error loading quotes:", error)
      showNotification("Error loading quotes.", "error")
    }
  }

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleOptionToggle = (optionName: string) => {
    const currentOptions = formData.additional_options
    const isSelected = currentOptions.includes(optionName)

    if (isSelected) {
      handleInputChange(
        "additional_options",
        currentOptions.filter((opt) => opt !== optionName),
      )
    } else {
      handleInputChange("additional_options", [...currentOptions, optionName])
    }
  }

  const handleBoatModelChange = (modelName: string) => {
    setFormData((prev) => ({
      ...prev,
      boat_model: modelName,
      engine_package: "", // Reset engine selection
      hull_color: "", // Reset hull color selection
    }))
  }

  const getSelectedBoatModel = () => {
    return config.boatModels.find((model) => model.name === formData.boat_model)
  }

  const getSelectedEngine = () => {
    return config.enginePackages.find((engine) => engine.name === formData.engine_package)
  }

  const getSelectedHullColor = () => {
    return config.hullColors.find((color) => color.name === formData.hull_color)
  }

  const getSelectedOptions = () => {
    return config.additionalOptions.filter((option) => formData.additional_options.includes(option.name))
  }

  const calculateTotals = () => {
    const boatModel = getSelectedBoatModel()
    const engine = getSelectedEngine()
    const hullColor = getSelectedHullColor()
    const options = getSelectedOptions()

    // Usar preços de venda (já configurados pelo dealer) em vez de preços de custo
    const baseUsd = boatModel?.usd || 0
    const engineUsd = engine?.usd || 0
    const hullUsd = hullColor?.usd || 0
    const optionsUsd = options.reduce((sum, opt) => sum + opt.usd, 0)

    const baseBrl = boatModel?.brl || 0
    const engineBrl = engine?.brl || 0
    const hullBrl = hullColor?.brl || 0
    const optionsBrl = options.reduce((sum, opt) => sum + opt.brl, 0)

    return {
      totalUsd: baseUsd + engineUsd + hullUsd + optionsUsd,
      totalBrl: baseBrl + engineBrl + hullBrl + optionsBrl,
      breakdown: {
        base: { usd: baseUsd, brl: baseBrl },
        engine: { usd: engineUsd, brl: engineBrl },
        hull: { usd: hullUsd, brl: hullBrl },
        options: { usd: optionsUsd, brl: optionsBrl },
      },
    }
  }

  const formatCurrency = (value: number, currency: "BRL" | "USD") => {
    return new Intl.NumberFormat(lang === "pt" ? "pt-BR" : "en-US", {
      style: "currency",
      currency: currency,
    }).format(value)
  }

  const generateQuoteId = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    const timestamp = today.getTime().toString().slice(-4)
    return `QUO-${year}${month}${day}-${timestamp}`
  }

  const calculateValidUntil = () => {
    const today = new Date()
    const validDays = Number.parseInt(formData.valid_days) || 30
    const validUntil = new Date(today.getTime() + validDays * 24 * 60 * 60 * 1000)
    return validUntil.toISOString().split("T")[0] // Format as YYYY-MM-DD
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.customer_name ||
      !formData.customer_email ||
      !formData.customer_phone ||
      !formData.boat_model ||
      !formData.engine_package ||
      !formData.hull_color
    ) {
      showNotification(translations[lang as keyof typeof translations]["Please fill all required fields"], "error")
      return
    }

    try {
      const totals = calculateTotals()
      const quoteId = generateQuoteId()
      const validUntil = calculateValidUntil()

      const quoteData = {
        quoteId,
        dealerName: localStorage.getItem("currentDealerName") || "Dealer",
        customer: {
          name: formData.customer_name,
          email: formData.customer_email,
          phone: formData.customer_phone,
          address: formData.customer_address,
          city: formData.customer_city,
          state: formData.customer_state,
          zip: formData.customer_zip,
          country: formData.customer_country,
        },
        model: formData.boat_model,
        engine: formData.engine_package,
        hull_color: formData.hull_color,
        options: formData.additional_options,
        payment_method: formData.payment_method,
        deposit_amount: Number.parseFloat(formData.deposit_amount) || 0,
        additional_notes: formData.additional_notes,
        date: new Date().toLocaleDateString(),
        status: "pending",
        totalUsd: totals.totalUsd,
        totalBrl: totals.totalBrl,
        valid_until: validUntil,
      }

      const response = await fetch("/api/save-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quoteData),
      })

      const result = await response.json()

      if (result.success) {
        setFormData({
          customer_name: "",
          customer_email: "",
          customer_phone: "",
          customer_address: "",
          customer_city: "",
          customer_state: "",
          customer_zip: "",
          customer_country: "",
          boat_model: "",
          engine_package: "",
          hull_color: "",
          additional_options: [],
          payment_method: "",
          deposit_amount: "",
          additional_notes: "",
          valid_days: "30",
        })

        showNotification(translations[lang as keyof typeof translations]["Quote generated successfully!"], "success")
        loadQuotes() // Reload quotes after a new one is generated
      } else {
        throw new Error(result.error || "Erro ao salvar orçamento")
      }
    } catch (error) {
      console.error("Erro ao gerar orçamento:", error)
      showNotification("Erro ao gerar orçamento: " + String(error), "error")
    }
  }

  const handleAcceptQuote = async (quoteId: string) => {
    setQuoteToAccept(quoteId)
    setShowConfirmModal(true)
  }

  const confirmAcceptQuote = async () => {
    if (!quoteToAccept) return

    try {
      const response = await fetch("/api/accept-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quoteId: quoteToAccept }),
      })

      const result = await response.json()

      if (result.success) {
        showNotification(
          translations[lang as keyof typeof translations]["Quote accepted and converted to order successfully!"],
          "success",
        )
        loadQuotes() // Reload quotes to update status
        router.push("/dealer/track-orders") // Redirect to track orders
      } else {
        throw new Error(result.error || "Erro ao aceitar orçamento")
      }
    } catch (error) {
      console.error("Erro ao aceitar orçamento:", error)
      showNotification(
        translations[lang as keyof typeof translations]["Error accepting quote"] + ": " + String(error),
        "error",
      )
    } finally {
      setShowConfirmModal(false)
      setQuoteToAccept(null)
    }
  }

  const cancelAcceptQuote = () => {
    setShowConfirmModal(false)
    setQuoteToAccept(null)
  }

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const printContent = quoteDetailsRef.current?.innerHTML || ""

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Orçamento - ${selectedQuote?.quoteId}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .text-2xl { font-size: 1.5rem; }
            .text-lg { font-size: 1.125rem; }
            .text-sm { font-size: 0.875rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .mt-2 { margin-top: 0.5rem; }
            .mt-4 { margin-top: 1rem; }
            .p-2 { padding: 0.5rem; }
            .p-3 { padding: 0.75rem; }
            .p-4 { padding: 1rem; }
            .pb-4 { padding-bottom: 1rem; }
            .border-b-2 { border-bottom: 2px solid #1e40af; }
            .bg-gray-50 { background-color: #f9fafb; }
            .bg-blue-50 { background-color: #eff6ff; }
            .rounded-lg { border-radius: 0.5rem; }
            .space-y-4 > * + * { margin-top: 1rem; }
            .space-y-6 > * + * { margin-top: 1.5rem; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            .gap-4 { gap: 1rem; }
            .text-blue-900 { color: #1e3a8a; }
            .text-green-700 { color: #15803d; }
            .text-red-600 { color: #dc2626; }
            .list-disc { list-style-type: disc; }
            .list-inside { list-style-position: inside; }
            .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
            .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
            .rounded-full { border-radius: 9999px; }
            .font-medium { font-weight: 500; }
            .bg-yellow-100 { background-color: #fef3c7; }
            .text-yellow-800 { color: #92400e; }
            .bg-green-100 { background-color: #dcfce7; }
            .text-green-800 { color: #166534; }
            .bg-red-100 { background-color: #fee2e2; }
            .text-red-800 { color: #991b1b; }
            .bg-gray-100 { background-color: #f3f4f6; }
            .text-gray-800 { color: #1f2937; }
            img { max-width: 300px; height: auto; }
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()

    // Wait for images to load before printing
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 1000)
  }

  const generatePDF = async () => {
    if (!quoteDetailsRef.current || !selectedQuote) return

    try {
      setIsPrinting(true)
      showNotification(translations[lang as keyof typeof translations]["Generating PDF..."], "info")

      // Dynamically import the libraries
      const { default: jsPDF } = await import("jspdf")
      const { default: html2canvas } = await import("html2canvas")

      const content = quoteDetailsRef.current
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, Math.min(pdfHeight, 280))
      pdf.save(`orcamento-${selectedQuote.quoteId}.pdf`)

      showNotification(translations[lang as keyof typeof translations]["PDF generated successfully!"], "success")
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      showNotification(translations[lang as keyof typeof translations]["Error generating PDF"], "error")
    } finally {
      setIsPrinting(false)
    }
  }

  const handleViewDetails = (quote: Quote) => {
    setSelectedQuote(quote)
    setIsDetailsModalOpen(true)
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "expired":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTranslatedStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: translations[lang as keyof typeof translations]["Pending"],
      accepted: translations[lang as keyof typeof translations]["Accepted"],
      rejected: translations[lang as keyof typeof translations]["Rejected"],
      expired: translations[lang as keyof typeof translations]["Expired"],
    }
    return statusMap[status] || status
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {translations[lang as keyof typeof translations]["Loading configurations..."]}
          </p>
        </div>
      </div>
    )
  }

  const totals = calculateTotals()
  const isPt = lang === "pt"
  const validUntilDate = new Date(Date.now() + (Number.parseInt(formData.valid_days) || 30) * 24 * 60 * 60 * 1000)

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-5">
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
      <div className="max-w-6xl mx-auto">
        <Link
          href="/dealer/dashboard"
          className="inline-flex items-center text-blue-900 font-semibold mb-5 hover:underline"
        >
          ← {translations[lang as keyof typeof translations]["Back to Dashboard"]}
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">
            {translations[lang as keyof typeof translations]["Quote Client"]}
          </h1>
          <p className="text-lg text-gray-600">
            {translations[lang as keyof typeof translations]["Create a new boat quote for your customers"]}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-blue-900 mb-6">
                  {translations[lang as keyof typeof translations]["Customer Information"]}
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      {translations[lang as keyof typeof translations]["Customer Name"]} *
                    </label>
                    <input
                      type="text"
                      value={formData.customer_name}
                      onChange={(e) => handleInputChange("customer_name", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      {translations[lang as keyof typeof translations]["Email"]} *
                    </label>
                    <input
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => handleInputChange("customer_email", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      {translations[lang as keyof typeof translations]["Phone"]} *
                    </label>
                    <input
                      type="tel"
                      value={formData.customer_phone}
                      onChange={(e) => handleInputChange("customer_phone", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      {translations[lang as keyof typeof translations]["Address"]}
                    </label>
                    <input
                      type="text"
                      value={formData.customer_address}
                      onChange={(e) => handleInputChange("customer_address", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      {translations[lang as keyof typeof translations]["City"]}
                    </label>
                    <input
                      type="text"
                      value={formData.customer_city}
                      onChange={(e) => handleInputChange("customer_city", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      {translations[lang as keyof typeof translations]["State"]}
                    </label>
                    <input
                      type="text"
                      value={formData.customer_state}
                      onChange={(e) => handleInputChange("customer_state", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      {translations[lang as keyof typeof translations]["ZIP Code"]}
                    </label>
                    <input
                      type="text"
                      value={formData.customer_zip}
                      onChange={(e) => handleInputChange("customer_zip", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      {translations[lang as keyof typeof translations]["Country"]}
                    </label>
                    <input
                      type="text"
                      value={formData.customer_country}
                      onChange={(e) => handleInputChange("customer_country", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Boat Configuration */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-blue-900 mb-6">
                  {translations[lang as keyof typeof translations]["Boat Configuration"]}
                </h2>
                <div className="space-y-6">
                  {/* Boat Model */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      {translations[lang as keyof typeof translations]["Boat Model"]} *
                    </label>
                    <select
                      value={formData.boat_model}
                      onChange={(e) => handleBoatModelChange(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="">Selecione um modelo</option>
                      {config.boatModels.map((model) => (
                        <option key={model.id} value={model.name}>
                          {isPt ? model.name_pt : model.name} -{" "}
                          {formatCurrency(isPt ? model.brl : model.usd, isPt ? "BRL" : "USD")}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Engine Package */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      {translations[lang as keyof typeof translations]["Engine Package"]} *
                    </label>
                    <select
                      value={formData.engine_package}
                      onChange={(e) => handleInputChange("engine_package", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      required
                      disabled={!formData.boat_model}
                    >
                      <option value="">Selecione um motor</option>
                      {filteredEngines.map((engine) => (
                        <option key={engine.id} value={engine.name}>
                          {isPt ? engine.name_pt : engine.name} -{" "}
                          {formatCurrency(isPt ? engine.brl : engine.usd, isPt ? "BRL" : "USD")}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Hull Color */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      {translations[lang as keyof typeof translations]["Hull Color"]} *
                    </label>
                    <select
                      value={formData.hull_color}
                      onChange={(e) => handleInputChange("hull_color", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="">Selecione uma cor</option>
                      {filteredHullColors.map((color) => (
                        <option key={color.id} value={color.name}>
                          {isPt ? color.name_pt : color.name} -{" "}
                          {formatCurrency(isPt ? color.brl : color.usd, isPt ? "BRL" : "USD")}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Additional Options */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      {translations[lang as keyof typeof translations]["Additional Options"]}
                    </label>
                    <div className="space-y-2">
                      {config.additionalOptions.map((option) => (
                        <label key={option.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.additional_options.includes(option.name)}
                            onChange={() => handleOptionToggle(option.name)}
                            className="mr-3"
                          />
                          <span>
                            {isPt ? option.name_pt : option.name} -{" "}
                            {formatCurrency(isPt ? option.brl : option.usd, isPt ? "BRL" : "USD")}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-blue-900 mb-6">
                  {translations[lang as keyof typeof translations]["Payment Information"]}
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      {translations[lang as keyof typeof translations]["Payment Method"]}
                    </label>
                    <select
                      value={formData.payment_method}
                      onChange={(e) => handleInputChange("payment_method", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="">Selecione</option>
                      <option value="cash">{translations[lang as keyof typeof translations]["Cash"]}</option>
                      <option value="financing">{translations[lang as keyof typeof translations]["Financing"]}</option>
                      <option value="trade-in">{translations[lang as keyof typeof translations]["Trade-in"]}</option>
                      <option value="for-plan">{translations[lang as keyof typeof translations]["For Plan"]}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      {translations[lang as keyof typeof translations]["Deposit Amount"]}
                    </label>
                    <input
                      type="number"
                      value={formData.deposit_amount}
                      onChange={(e) => handleInputChange("deposit_amount", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block font-semibold text-gray-700 mb-2">
                    {translations[lang as keyof typeof translations]["Additional Notes"]}
                  </label>
                  <textarea
                    value={formData.additional_notes}
                    onChange={(e) => handleInputChange("additional_notes", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    rows={4}
                  />
                </div>
              </div>

              {/* Quote Validity */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-blue-900 mb-6">
                  {translations[lang as keyof typeof translations]["Quote Validity"]}
                </h2>
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    {translations[lang as keyof typeof translations]["Valid for (days)"]}
                  </label>
                  <input
                    type="number"
                    value={formData.valid_days}
                    onChange={(e) => handleInputChange("valid_days", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    min="1"
                    max="365"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    {translations[lang as keyof typeof translations]["Valid until"]}:{" "}
                    {validUntilDate.toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  {translations[lang as keyof typeof translations]["Cancel"]}
                </button>
                <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {translations[lang as keyof typeof translations]["Generate Quote"]}
                </button>
              </div>
            </form>
          </div>

          {/* Quote Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-blue-900 mb-6">
                {translations[lang as keyof typeof translations]["Quote Summary"]}
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>{translations[lang as keyof typeof translations]["Base Price"]}:</span>
                  <span className="font-semibold">
                    {formatCurrency(totals.breakdown.base[isPt ? "brl" : "usd"], isPt ? "BRL" : "USD")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{translations[lang as keyof typeof translations]["Engine"]}:</span>
                  <span className="font-semibold">
                    {formatCurrency(totals.breakdown.engine[isPt ? "brl" : "usd"], isPt ? "BRL" : "USD")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{translations[lang as keyof typeof translations]["Hull"]}:</span>
                  <span className="font-semibold">
                    {formatCurrency(totals.breakdown.hull[isPt ? "brl" : "usd"], isPt ? "BRL" : "USD")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{translations[lang as keyof typeof translations]["Options"]}:</span>
                  <span className="font-semibold">
                    {formatCurrency(totals.breakdown.options[isPt ? "brl" : "usd"], isPt ? "BRL" : "USD")}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold text-blue-900">
                  <span>{translations[lang as keyof typeof translations]["Total"]}:</span>
                  <span>{formatCurrency(totals[isPt ? "totalBrl" : "totalUsd"], isPt ? "BRL" : "USD")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quote History */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-6">
            {translations[lang as keyof typeof translations]["Quote History"]}
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translations[lang as keyof typeof translations]["Quote ID"]}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translations[lang as keyof typeof translations]["Customer Name"]}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translations[lang as keyof typeof translations]["Date"]}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translations[lang as keyof typeof translations]["Total"]}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translations[lang as keyof typeof translations]["Status"]}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translations[lang as keyof typeof translations]["Actions"]}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quotes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      {translations[lang as keyof typeof translations]["No quotes found."]}
                    </td>
                  </tr>
                ) : (
                  quotes.map((quote) => (
                    <tr key={quote.quoteId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{quote.quoteId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{quote.customer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{quote.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(isPt ? quote.totalBrl : quote.totalUsd, isPt ? "BRL" : "USD")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(
                            quote.status,
                          )}`}
                        >
                          {getTranslatedStatus(quote.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button onClick={() => handleViewDetails(quote)} className="text-blue-600 hover:text-blue-900">
                          {translations[lang as keyof typeof translations]["View Details"]}
                        </button>
                        {quote.status === "pending" && (
                          <button
                            onClick={() => handleAcceptQuote(quote.quoteId)}
                            className="text-green-600 hover:text-green-900"
                          >
                            {translations[lang as keyof typeof translations]["Turn into Order"]}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quote Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>{translations[lang as keyof typeof translations]["Quote Details"]}</DialogTitle>
            <DialogDescription>
              {selectedQuote && `${selectedQuote.quoteId} - ${selectedQuote.customer.name}`}
            </DialogDescription>
          </DialogHeader>

          {selectedQuote && (
            <div ref={quoteDetailsRef} className="space-y-6 bg-white p-6 rounded-lg">
              {/* Header */}
              <div className="text-center border-b-2 border-blue-900 pb-4">
                <div className="flex justify-center mb-4">
                  <Image src="/images/logoprint.png" alt="Drakkar Boats Logo" width={300} height={120} />
                </div>
                <h1 className="text-2xl font-bold text-blue-900 mb-2">ORÇAMENTO DE BARCO</h1>
                <p className="text-lg font-semibold">#{selectedQuote.quoteId}</p>
                <p className="text-sm text-gray-600">{selectedQuote.date}</p>
              </div>

              {/* Customer and Quote Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-900 mb-3">INFORMAÇÕES DO CLIENTE</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Nome:</strong> {selectedQuote.customer.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedQuote.customer.email}
                    </p>
                    <p>
                      <strong>Telefone:</strong> {selectedQuote.customer.phone}
                    </p>
                    {selectedQuote.customer.address && (
                      <p>
                        <strong>Endereço:</strong> {selectedQuote.customer.address}
                      </p>
                    )}
                    {selectedQuote.customer.city && (
                      <p>
                        <strong>Cidade:</strong> {selectedQuote.customer.city}
                      </p>
                    )}
                    {selectedQuote.customer.state && (
                      <p>
                        <strong>Estado:</strong> {selectedQuote.customer.state}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-900 mb-3">INFORMAÇÕES DO ORÇAMENTO</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Data:</strong> {selectedQuote.date}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(selectedQuote.status)}`}
                      >
                        {getTranslatedStatus(selectedQuote.status)}
                      </span>
                    </p>
                    {selectedQuote.validUntil && (
                      <p>
                        <strong>Válido até:</strong> {new Date(selectedQuote.validUntil).toLocaleDateString()}
                      </p>
                    )}
                    <p>
                      <strong>Dealer:</strong> {selectedQuote.dealer}
                    </p>
                  </div>
                </div>
              </div>

              {/* Boat Configuration */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-3">CONFIGURAÇÃO DO BARCO</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>Modelo:</strong>
                    <p>{selectedQuote.model}</p>
                  </div>
                  <div>
                    <strong>Motor:</strong>
                    <p>{selectedQuote.engine}</p>
                  </div>
                  <div>
                    <strong>Cor do Casco:</strong>
                    <p>{selectedQuote.hull_color}</p>
                  </div>
                </div>
                {selectedQuote.options.length > 0 && (
                  <div className="mt-4">
                    <strong>Opções Adicionais:</strong>
                    <ul className="list-disc list-inside mt-2">
                      {selectedQuote.options.map((option, index) => (
                        <li key={index}>{option}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-3">VALORES</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-lg font-bold text-green-700">
                    <span>TOTAL (BRL):</span>
                    <span>{fmt(selectedQuote.totalBrl)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-green-700">
                    <span>TOTAL (USD):</span>
                    <span>{fmt(selectedQuote.totalUsd)}</span>
                  </div>
                </div>
              </div>

              {/* Payment and Notes */}
              {(selectedQuote.paymentMethod || selectedQuote.depositAmount || selectedQuote.additionalNotes) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-900 mb-3">INFORMAÇÕES ADICIONAIS</h3>
                  <div className="space-y-2 text-sm">
                    {selectedQuote.paymentMethod && (
                      <p>
                        <strong>Forma de Pagamento:</strong> {selectedQuote.paymentMethod}
                      </p>
                    )}
                    {selectedQuote.depositAmount && (
                      <p>
                        <strong>Valor do Sinal:</strong> {formatCurrency(selectedQuote.depositAmount, "BRL")}
                      </p>
                    )}
                    {selectedQuote.additionalNotes && (
                      <p>
                        <strong>Observações:</strong> {selectedQuote.additionalNotes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="text-center text-xs text-gray-600 mt-6 border-t pt-4">
                <p>
                  Este orçamento é válido até{" "}
                  {selectedQuote.validUntil && new Date(selectedQuote.validUntil).toLocaleDateString()}
                </p>
                <p>Para mais informações, entre em contato conosco.</p>
              </div>
            </div>
          )}

          <DialogFooter className="no-print">
            <Button onClick={handlePrint} variant="outline" disabled={isPrinting}>
              {translations[lang as keyof typeof translations]["Print"]}
            </Button>
            <Button onClick={generatePDF} variant="outline" disabled={isPrinting}>
              {isPrinting
                ? translations[lang as keyof typeof translations]["Generating PDF..."]
                : translations[lang as keyof typeof translations]["Generate PDF"]}
            </Button>
            <Button onClick={() => setIsDetailsModalOpen(false)}>
              {translations[lang as keyof typeof translations]["Close"]}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="bg-white">
          {" "}
          {/* Added bg-white here */}
          <DialogHeader>
            <DialogTitle>{translations[lang as keyof typeof translations]["Confirm Conversion"]}</DialogTitle>
            <DialogDescription className="bg-white p-2 rounded-md">
              {
                translations[lang as keyof typeof translations][
                  "Are you sure you want to convert this quote into an order?"
                ]
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelAcceptQuote}>
              {translations[lang as keyof typeof translations]["Cancel"]}
            </Button>
            <Button onClick={confirmAcceptQuote}>
              {translations[lang as keyof typeof translations]["Turn into Order"]}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
