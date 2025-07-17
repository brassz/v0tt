"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { Notification, useNotification } from "@/components/notification"
import { MultiSelectDropdown } from "@/components/multi-select-dropdown"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface DataItem {
  name: string
  name_pt?: string
  usd?: number
  brl?: number
  email?: string
  password?: string
  id?: string
  country?: string
  compatible_models?: string[]
}

interface Order {
  order_id: string
  dealer_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  customer_city: string
  customer_state: string
  customer_zip: string
  customer_country: string
  boat_model: string
  engine_package: string
  hull_color: string
  additional_options: string[]
  payment_method: string
  deposit_amount: number
  total_usd: number
  total_brl: number
  notes: string
  status: string
  created_at: string
}

interface ServiceRequestIssue {
  text: string
  imageUrl?: string
}

interface ServiceRequest {
  request_id: string
  dealer_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  boat_model: string
  hull_id: string
  purchase_date: string
  engine_hours: string
  request_type: string
  issues: ServiceRequestIssue[]
  status: string
  created_at: string
}

interface ServiceMessage {
  id: number
  service_request_id: string
  sender_type: "admin" | "dealer"
  sender_name: string
  message: string
  created_at: string
  read_at?: string
}

export default function AdministratorPage() {
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showAddEmail, setShowAddEmail] = useState(false)
  const [notificationEmail, setNotificationEmail] = useState("")
  const [currentNotificationEmail, setCurrentNotificationEmail] = useState("")

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState("engines")
  const [lang, setLang] = useState("en")

  const { notification, showNotification, hideNotification } = useNotification()

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ type: string; index: number; item: DataItem } | null>(null)

  // New state for problems modal
  const [showProblemsModal, setShowProblemsModal] = useState(false)
  const [selectedProblems, setSelectedProblems] = useState<ServiceRequestIssue[]>([])

  // New state for messaging
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [selectedServiceRequest, setSelectedServiceRequest] = useState<ServiceRequest | null>(null)
  const [messages, setMessages] = useState<ServiceMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)

  // State for email sending
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const [enginePackages, setEnginePackages] = useState<DataItem[]>([])
  const [hullColors, setHullColors] = useState<DataItem[]>([])
  const [additionalOptions, setAdditionalOptions] = useState<DataItem[]>([])
  const [boatModels, setBoatModels] = useState<DataItem[]>([])
  const [dealers, setDealers] = useState<DataItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])

  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null)
  const [serviceRequestToPrint, setServiceRequestToPrint] = useState<ServiceRequest | null>(null)

  const statusOptions = [
    { value: "pending", label: "Pendente" },
    { value: "production", label: "Em produção" },
    { value: "finishing", label: "Acabamento" },
    { value: "assembly", label: "Montagem" },
    { value: "final_inspection", label: "Inspeção final" },
    { value: "shipped", label: "Enviado" },
    { value: "delivered", label: "Entregue" },
    { value: "sold", label: "Vendido" },
    { value: "canceled", label: "Cancelado" },
  ]

  const getStatusLabel = (value: string) => statusOptions.find((o) => o.value === value)?.label || value

  const handleStatusChange = (orderId: string, newValue: string) => {
    setOrders((prev) => prev.map((o) => (o.order_id === orderId ? { ...o, status: newValue } : o)))
  }

  const translations = {
    pt: {
      Login: "Login",
      Password: "Senha",
      Enter: "Entrar",
      "Invalid password": "Senha inválida",
      "Engine Packages": "Pacotes de Motor",
      "Hull Colors": "Cores de Casco",
      "Additional Options": "Opcionais Adicionais",
      Dealers: "Concessionárias",
      "Boat Models": "Modelos de Barco",
      "Track Orders": "Acompanhar Pedidos",
      "Sold Boats": "Barcos Vendidos",
      "Canceled Boats": "Barcos Cancelados",
      "No sold boats found": "Nenhum barco vendido encontrado",
      "No canceled boats found": "Nenhum barco cancelado encontrado",
      "After Sales": "Pós-Venda",
      "Save All": "Salvar Tudo",
      "Add Row": "Adicionar Linha",
      "Name (EN)": "Nome (EN)",
      "Name (PT)": "Nome (PT)",
      "Order ID": "ID do Pedido",
      Dealer: "Concessionária",
      Customer: "Cliente",
      Model: "Modelo",
      Date: "Data",
      Status: "Status",
      Email: "Email",
      Country: "País",
      "Order Details": "Detalhes do Pedido",
      Phone: "Telefone",
      Address: "Endereço",
      City: "Cidade",
      State: "Estado",
      "ZIP Code": "CEP",
      "Boat Information": "Informações do Barco",
      "Boat Model": "Modelo do Barco",
      "Boat Name": "Nome do Barco",
      Engine: "Motor",
      "Hull Color": "Cor do Casco",
      Color: "Cor",
      "Selected Options": "Opcionais Selecionados",
      "Additional Options": "Opcionais Adicionais",
      "No options selected": "Nenhum opcional selecionado",
      "Payment Information": "Informações de Pagamento",
      "Payment Method": "Método de Pagamento",
      "Deposit Amount": "Valor do Depósito",
      "Cost Price": "Preço de Custo",
      "Sale Price": "Preço de Venda",
      Total: "Total",
      "Additional Notes": "Observações Adicionais",
      Notes: "Observações",
      "Service Request Details": "Detalhes da Solicitação de Serviço",
      ID: "ID",
      "Hull ID": "ID do Casco",
      "Purchase Date": "Data da Compra",
      "Engine Hours": "Horas do Motor",
      "Request Type": "Tipo de Solicitação",
      Issues: "Problemas",
      Actions: "Ações",
      "Download PDF": "Baixar PDF",
      "Send Message": "Enviar Mensagem",
      "Message Dealer": "Mensagem para Dealer",
      "Type your message...": "Digite sua mensagem...",
      Send: "Enviar",
      Cancel: "Cancelar",
      Messages: "Mensagens",
      "No messages yet": "Nenhuma mensagem ainda",
      Administrator: "Administrador",
      "Send Email": "Enviar Email",
    },
    en: {
      Login: "Login",
      Password: "Password",
      Enter: "Enter",
      "Invalid password": "Invalid password",
      "Engine Packages": "Engine Packages",
      "Hull Colors": "Hull Colors",
      "Additional Options": "Additional Options",
      Dealers: "Dealers",
      "Boat Models": "Boat Models",
      "Track Orders": "Track Orders",
      "Sold Boats": "Sold Boats",
      "Canceled Boats": "Canceled Boats",
      "No sold boats found": "No sold boats found",
      "No canceled boats found": "No canceled boats found",
      "After Sales": "After Sales",
      "Save All": "Save All",
      "Add Row": "Add Row",
      "Name (EN)": "Name (EN)",
      "Name (PT)": "Name (PT)",
      "Order ID": "Order ID",
      Dealer: "Dealer",
      Customer: "Customer",
      Model: "Model",
      Date: "Date",
      Status: "Status",
      Email: "Email",
      Country: "Country",
      "Order Details": "Order Details",
      Phone: "Phone",
      Address: "Address",
      City: "City",
      State: "State",
      "ZIP Code": "ZIP Code",
      "Boat Information": "Boat Information",
      "Boat Model": "Boat Model",
      "Boat Name": "Boat Name",
      Engine: "Engine",
      "Hull Color": "Hull Color",
      Color: "Color",
      "Selected Options": "Selected Options",
      "Additional Options": "Additional Options",
      "No options selected": "No options selected",
      "Payment Information": "Payment Information",
      "Payment Method": "Payment Method",
      "Deposit Amount": "Deposit Amount",
      "Cost Price": "Cost Price",
      "Sale Price": "Sale Price",
      Total: "Total",
      "Additional Notes": "Additional Notes",
      Notes: "Notes",
      "Service Request Details": "Service Request Details",
      ID: "ID",
      "Hull ID": "Hull ID",
      "Purchase Date": "Purchase Date",
      "Engine Hours": "Engine Hours",
      "Request Type": "Request Type",
      Issues: "Issues",
      Actions: "Actions",
      "Download PDF": "Download PDF",
      "Send Message": "Send Message",
      "Message Dealer": "Message Dealer",
      "Type your message...": "Type your message...",
      Send: "Send",
      Cancel: "Cancel",
      Messages: "Messages",
      "No messages yet": "No messages yet",
      Administrator: "Administrator",
      "Send Email": "Send Email",
    },
    es: {
      Login: "Acceder",
      Password: "Contraseña",
      Enter: "Entrar",
      "Invalid password": "Contraseña inválida",
      "Engine Packages": "Paquetes de Motor",
      "Hull Colors": "Colores de Casco",
      "Additional Options": "Opciones Adicionales",
      Dealers: "Concesionarios",
      "Boat Models": "Modelos de Barcos",
      "Track Orders": "Rastrear Pedidos",
      "Sold Boats": "Barcos Vendidos",
      "Canceled Boats": "Barcos Cancelados",
      "No sold boats found": "No se encontraron barcos vendidos",
      "No canceled boats found": "No se encontraron barcos cancelados",
      "After Sales": "Postventa",
      "Save All": "Guardar Todo",
      "Add Row": "Agregar Fila",
      "Name (EN)": "Nombre (EN)",
      "Name (PT)": "Nombre (PT)",
      "Order ID": "ID de Pedido",
      Dealer: "Concesionario",
      Customer: "Cliente",
      Model: "Modelo",
      Date: "Fecha",
      Status: "Estado",
      Email: "Email",
      Country: "País",
      "Order Details": "Detalles del Pedido",
      Phone: "Teléfono",
      Address: "Dirección",
      City: "Ciudad",
      State: "Estado",
      "ZIP Code": "Código Postal",
      "Boat Information": "Información del Barco",
      "Boat Model": "Modelo de Barco",
      "Boat Name": "Nombre del Barco",
      Engine: "Motor",
      "Hull Color": "Color del Casco",
      Color: "Color",
      "Selected Options": "Opciones Seleccionadas",
      "Additional Options": "Opciones Adicionales",
      "No options selected": "No hay opciones seleccionadas",
      "Payment Information": "Información de Pago",
      "Payment Method": "Método de Pago",
      "Deposit Amount": "Monto del Depósito",
      "Cost Price": "Precio de Costo",
      "Sale Price": "Precio de Venta",
      Total: "Total",
      "Additional Notes": "Notas Adicionales",
      Notes: "Notas",
      "Service Request Details": "Detalles de la Solicitud de Servicio",
      ID: "ID",
      "Hull ID": "ID de Casco",
      "Purchase Date": "Fecha de Compra",
      "Engine Hours": "Horas del Motor",
      "Request Type": "Tipo de Solicitud",
      Issues: "Problemas",
      Actions: "Acciones",
      "Download PDF": "Descargar PDF",
      "Send Message": "Enviar Mensaje",
      "Message Dealer": "Mensaje al Concesionario",
      "Type your message...": "Escriba su mensaje...",
      Send: "Enviar",
      Cancel: "Cancelar",
      Messages: "Mensajes",
      "No messages yet": "No hay mensajes aún",
      Administrator: "Administrador",
      "Send Email": "Enviar Email",
    },
  }

  const t = (key: keyof (typeof translations)["en"]) => {
    return translations[lang as keyof typeof translations][key] || key
  }

  const formatCurrency = (value: number | undefined, currency: "BRL" | "USD") => {
    if (value === undefined) return "N/A"
    return new Intl.NumberFormat(lang === "pt" ? "pt-BR" : "en-US", {
      style: "currency",
      currency: currency,
    }).format(value)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "production":
        return "bg-blue-100 text-blue-800"
      case "shipping":
        return "bg-green-100 text-green-800"
      case "delivered":
        return "bg-gray-100 text-gray-800"
      case "available":
        return "bg-green-100 text-green-800"
      case "sold":
        return "bg-red-100 text-red-800"
      case "canceled":
        return "bg-red-200 text-red-900"
      case "reserved":
        return "bg-yellow-100 text-yellow-800"
      case "maintenance":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const loadNotificationEmail = async () => {
    try {
      const response = await fetch("/api/notification-email")
      const result = await response.json()

      if (result.success) {
        setCurrentNotificationEmail(result.email || "")
        setNotificationEmail(result.email || "")
      }
    } catch (error) {
      console.error("Erro ao carregar email de notificação:", error)
    }
  }

  const handleSaveNotificationEmail = async () => {
    if (!notificationEmail.trim()) {
      showNotification("Email é obrigatório.", "error")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(notificationEmail)) {
      showNotification("Email inválido.", "error")
      return
    }

    try {
      const response = await fetch("/api/notification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: notificationEmail }),
      })

      const result = await response.json()

      if (result.success) {
        showNotification("✅ Email de notificação salvo com sucesso!", "success")
        setCurrentNotificationEmail(notificationEmail)
        setShowAddEmail(false)
      } else {
        showNotification(`❌ Erro: ${result.error}`, "error")
      }
    } catch (error) {
      console.error("Erro ao salvar email:", error)
      showNotification("❌ Erro ao conectar com o servidor.", "error")
    }
  }

  const handleSendEmail = async (type: "order" | "service_request", id: string) => {
    if (!currentNotificationEmail) {
      showNotification("❌ Configure um email de notificação primeiro!", "error")
      return
    }

    setIsSendingEmail(true)
    try {
      const response = await fetch("/api/send-email-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id }),
      })

      const result = await response.json()

      if (result.success) {
        showNotification("✅ Email enviado com sucesso!", "success")
      } else {
        showNotification(`❌ Erro ao enviar email: ${result.error}`, "error")
      }
    } catch (error) {
      console.error("Erro ao enviar email:", error)
      showNotification("❌ Erro ao enviar email", "error")
    } finally {
      setIsSendingEmail(false)
    }
  }

  useEffect(() => {
    const savedLang = localStorage.getItem("selectedLang") || "en"
    setLang(savedLang)
    if (isLoggedIn) {
      loadDataFromDatabase()
      loadNotificationEmail()
    }
  }, [isLoggedIn])

  const handleLogin = async () => {
    try {
      const response = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const result = await response.json()

      if (result.success) {
        setIsLoggedIn(true)
      } else {
        showNotification(t("Invalid password"), "error")
      }
    } catch (error) {
      console.error("Login error:", error)
      showNotification("Error during login.", "error")
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showNotification("As novas senhas não coincidem.", "error")
      return
    }
    if (newPassword.length < 4) {
      showNotification("A nova senha deve ter pelo menos 4 caracteres.", "error")
      return
    }

    try {
      const response = await fetch("/api/change-admin-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const result = await response.json()

      if (result.success) {
        showNotification("✅ Senha alterada com sucesso!", "success")
        setShowChangePassword(false)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        showNotification(`❌ Erro: ${result.error}`, "error")
      }
    } catch (error) {
      console.error("Change password error:", error)
      showNotification("❌ Erro ao conectar com o servidor.", "error")
    }
  }

  const addRow = (type: string) => {
    const newItem: DataItem =
      type === "dealers"
        ? { name: "", email: "", password: "", country: "Brazil" }
        : { name: "", name_pt: "", usd: 0, brl: 0, compatible_models: [] }

    switch (type) {
      case "engines":
        setEnginePackages([...enginePackages, newItem])
        break
      case "hulls":
        setHullColors([...hullColors, newItem])
        break
      case "options":
        setAdditionalOptions([...additionalOptions, newItem])
        break
      case "models":
        setBoatModels([...boatModels, newItem])
        break
      case "dealers":
        setDealers([...dealers, newItem])
        break
    }
  }

  const removeRow = (type: string, index: number) => {
    switch (type) {
      case "engines":
        setEnginePackages(enginePackages.filter((_, i) => i !== index))
        break
      case "hulls":
        setHullColors(hullColors.filter((_, i) => i !== index))
        break
      case "options":
        setAdditionalOptions(additionalOptions.filter((_, i) => i !== index))
        break
      case "models":
        setBoatModels(boatModels.filter((_, i) => i !== index))
        break
      case "dealers":
        setDealers(dealers.filter((_, i) => i !== index))
        break
    }
  }

  const updateItem = (type: string, index: number, field: string, value: string | number | string[]) => {
    const updateArray = (arr: DataItem[]) => {
      const newArr = [...arr]
      newArr[index] = { ...newArr[index], [field]: value }
      return newArr
    }

    switch (type) {
      case "engines":
        setEnginePackages(updateArray(enginePackages))
        break
      case "hulls":
        setHullColors(updateArray(hullColors))
        break
      case "options":
        setAdditionalOptions(updateArray(additionalOptions))
        break
      case "models":
        setBoatModels(updateArray(boatModels))
        break
      case "dealers":
        setDealers(updateArray(dealers))
        break
    }
  }

  const deleteItem = (type: string, index: number, item: DataItem) => {
    setItemToDelete({ type, index, item })
    setIsConfirmModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return

    const { type, index, item } = itemToDelete

    try {
      if (item.id) {
        const response = await fetch("/api/delete-admin-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: getTableName(type),
            id: item.id,
          }),
        })

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error)
        }
      }

      removeRow(type, index)
      showNotification("✅ Item deletado com sucesso!", "success")
    } catch (error) {
      console.error("Erro ao deletar item:", error)
      showNotification("❌ Erro ao deletar item: " + String(error), "error")
    } finally {
      setIsConfirmModalOpen(false)
      setItemToDelete(null)
    }
  }

  const getTableName = (type: string) => {
    const tableMap: { [key: string]: string } = {
      engines: "engine_packages",
      hulls: "hull_colors",
      options: "additional_options",
      models: "boat_models",
      dealers: "dealers",
    }
    return tableMap[type] || type
  }

  const saveAll = async () => {
    try {
      const response = await fetch("/api/save-admin-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enginePackages,
          hullColors,
          additionalOptions,
          boatModels,
          dealers,
          orders: orders.map(({ order_id, status }) => ({ order_id, status })),
          mode: "upsert",
        }),
      })

      const result = await response.json()

      if (result.success) {
        showNotification("✅ Dados salvos no banco de dados com sucesso!", "success")
        await loadDataFromDatabase()
      } else {
        showNotification("❌ Erro ao salvar: " + result.error, "error")
      }
    } catch (error) {
      console.error("Erro ao salvar:", error)
      showNotification("❌ Erro ao conectar com o banco", "error")
    }
  }

  const handleViewProblems = (issues: ServiceRequestIssue[]) => {
    setSelectedProblems(issues)
    setShowProblemsModal(true)
  }

  const handleMessageDealer = async (request: ServiceRequest) => {
    setSelectedServiceRequest(request)
    setShowMessageModal(true)
    await loadMessages(request.request_id)
  }

  const loadMessages = async (serviceRequestId: string) => {
    setIsLoadingMessages(true)
    try {
      const response = await fetch(`/api/service-messages?serviceRequestId=${encodeURIComponent(serviceRequestId)}`)

      if (response.ok) {
        const result = (await response.json()) as { messages: ServiceMessage[] }
        setMessages(result.messages ?? [])
      } else {
        const err = await response.json()
        console.error("Error loading messages:", err.error ?? err)
        setMessages([])
      }
    } catch (error) {
      console.error("Error loading messages:", error)
      setMessages([])
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedServiceRequest) return

    setIsSendingMessage(true)
    try {
      const response = await fetch("/api/service-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceRequestId: selectedServiceRequest.request_id,
          senderType: "admin",
          senderName: "Administrator",
          message: newMessage.trim(),
        }),
      })

      if (response.ok) {
        const result = (await response.json()) as { data: ServiceMessage }
        setMessages((prev) => [...prev, result.data])
        setNewMessage("")
        showNotification("✅ Mensagem enviada com sucesso!", "success")
      } else {
        const err = await response.json()
        showNotification("❌ Erro ao enviar mensagem: " + (err.error ?? "unknown error"), "error")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      showNotification("❌ Erro ao enviar mensagem", "error")
    } finally {
      setIsSendingMessage(false)
    }
  }

  const renderTable = (data: DataItem[], type: string) => {
    const isDealer = type === "dealers"
    const isEngine = type === "engines"
    const isHull = type === "hulls"

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              {isDealer ? (
                <>
                  <th className="border border-gray-300 p-3 text-left">{t("Name (EN)")}</th>
                  <th className="border border-gray-300 p-3 text-left">Email</th>
                  <th className="border border-gray-300 p-3 text-left">Password</th>
                  <th className="border border-gray-300 p-3 text-left">{t("Country")}</th>
                </>
              ) : (
                <>
                  <th className="border border-gray-300 p-3 text-left">{t("Name (EN)")}</th>
                  <th className="border border-gray-300 p-3 text-left">{t("Name (PT)")}</th>
                  <th className="border border-gray-300 p-3 text-left">USD</th>
                  <th className="border border-gray-300 p-3 text-left">BRL</th>
                  {(isEngine || isHull) && (
                    <th className="border border-gray-300 p-3 text-left">Modelos Compatíveis</th>
                  )}
                </>
              )}
              <th className="border border-gray-300 p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {isDealer ? (
                  <>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(type, index, "name", e.target.value)}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="email"
                        value={item.email || ""}
                        onChange={(e) => updateItem(type, index, "email", e.target.value)}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="password"
                        value={item.password || ""}
                        onChange={(e) => updateItem(type, index, "password", e.target.value)}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <select
                        value={item.country || ""}
                        onChange={(e) => updateItem(type, index, "country", e.target.value)}
                        className="w-full p-1.5 border rounded bg-white"
                      >
                        <option value="All">All</option>
                        <option value="Brazil">Brazil</option>
                        <option value="USA">USA</option>
                        <option value="Spain">Spain</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(type, index, "name", e.target.value)}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        value={item.name_pt || ""}
                        onChange={(e) => updateItem(type, index, "name_pt", e.target.value)}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="number"
                        step="0.01"
                        value={item.usd || 0}
                        onChange={(e) => updateItem(type, index, "usd", Number.parseFloat(e.target.value))}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="number"
                        step="0.01"
                        value={item.brl || 0}
                        onChange={(e) => updateItem(type, index, "brl", Number.parseFloat(e.target.value))}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    {(isEngine || isHull) && (
                      <td className="border border-gray-300 p-2">
                        <MultiSelectDropdown
                          options={boatModels.map((model) => ({ value: model.name, label: model.name }))}
                          selected={item.compatible_models || []}
                          onChange={(selected) => updateItem(type, index, "compatible_models", selected)}
                          placeholder="Selecionar modelos..."
                        />
                      </td>
                    )}
                  </>
                )}
                <td className="border border-gray-300 p-2">
                  <button
                    onClick={() => deleteItem(type, index, item)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    title="Deletar permanentemente"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={() => addRow(type)}
          className="mt-3 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          {t("Add Row")}
        </button>
      </div>
    )
  }

  const loadDataFromDatabase = async () => {
    try {
      const response = await fetch("/api/get-admin-data")

      // ────────────────────────────────────────────────────────
      // 1) Garante que veio uma resposta 200-299
      // 2) Garante que o conteúdo é JSON antes de tentar parsear
      // ────────────────────────────────────────────────────────
      if (!response.ok) {
        const fallbackText = await response.text()
        console.error("Falha no GET /api/get-admin-data:", fallbackText)
        showNotification(
          `❌ Erro ${response.status}: ${fallbackText?.slice(0, 120) || "Falha ao carregar dados do servidor."}`,
          "error",
        )
        return
      }

      const contentType = response.headers.get("content-type") || ""
      if (!contentType.includes("application/json")) {
        const fallbackText = await response.text()
        console.error("Resposta não-JSON:", fallbackText)
        showNotification("❌ O servidor respondeu com conteúdo inesperado.", "error")
        return
      }

      const result = await response.json()

      if (result.success) {
        const { data } = result
        setEnginePackages(data.enginePackages || [])
        setHullColors(data.hullColors || [])
        setAdditionalOptions(data.additionalOptions || [])
        setBoatModels(data.boatModels || [])
        setDealers(data.dealers || [])
        setOrders(data.orders || [])
        setServiceRequests(data.serviceRequests || [])

        showNotification("✅ Dados carregados do banco de dados!", "success")
      } else {
        showNotification(`❌ Erro ao carregar dados: ${result.error}`, "error")
      }
    } catch (error) {
      console.error("Erro ao carregar dados do banco:", error)
      showNotification("❌ Erro inesperado ao conectar com o servidor.", "error")
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setPassword("")
    window.location.href = "/"
  }

  const activeOrders = orders.filter((order) => order.status !== "sold" && order.status !== "canceled")
  const soldOrders = orders.filter((order) => order.status === "sold")
  const canceledOrders = orders.filter((order) => order.status === "canceled")

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <Image src="/images/logo.png" alt="Drakkar Logo" width={200} height={80} className="mx-auto mb-6" />
          <h5 className="text-xl font-semibold mb-6">{t("Login")}</h5>
          <div className="mb-4">
            <label className="block text-left mb-2 font-medium">{t("Password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg"
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
          <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
            {t("Enter")}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Image src="/images/logo.png" alt="Drakkar Logo" width={150} height={40} />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowChangePassword(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
            >
              🔑 Alterar Senha
            </button>
            <button
              onClick={() => setShowAddEmail(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
            >
              📧 {currentNotificationEmail ? "Editar Email" : "Adicionar Email"}
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2 border-b">
            {[
              { key: "engines", label: t("Engine Packages") },
              { key: "hulls", label: t("Hull Colors") },
              { key: "options", label: t("Additional Options") },
              { key: "dealers", label: t("Dealers") },
              { key: "models", label: t("Boat Models") },
              { key: "orders", label: t("Track Orders") },
              { key: "sold-boats", label: t("Sold Boats") },
              { key: "canceled-boats", label: t("Canceled Boats") },
              { key: "service", label: t("After Sales") },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 font-medium ${
                  activeTab === tab.key
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          {activeTab === "engines" && renderTable(enginePackages, "engines")}
          {activeTab === "hulls" && renderTable(hullColors, "hulls")}
          {activeTab === "options" && renderTable(additionalOptions, "options")}
          {activeTab === "models" && renderTable(boatModels, "models")}
          {activeTab === "dealers" && renderTable(dealers, "dealers")}

          {activeTab === "orders" && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 p-3 text-left">ID do Pedido</th>
                    <th className="border border-gray-300 p-3 text-left">Dealer</th>
                    <th className="border border-gray-300 p-3 text-left">Cliente</th>
                    <th className="border border-gray-300 p-3 text-left">Email</th>
                    <th className="border border-gray-300 p-3 text-left">Telefone</th>
                    <th className="border border-gray-300 p-3 text-left">Modelo</th>
                    <th className="border border-gray-300 p-3 text-left">Motor</th>
                    <th className="border border-gray-300 p-3 text-left">Cor</th>
                    <th className="border border-gray-300 p-3 text-left">Total USD</th>
                    <th className="border border-gray-300 p-3 text-left">Status</th>
                    <th className="border border-gray-300 p-3 text-left">Data</th>
                    <th className="border border-gray-300 p-3 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {activeOrders.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="border border-gray-300 p-4 text-center text-gray-500">
                        Nenhum pedido encontrado
                      </td>
                    </tr>
                  ) : (
                    activeOrders.map((order, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-3 font-mono text-sm">{order.order_id}</td>
                        <td className="border border-gray-300 p-3">
                          {dealers.find((d) => d.id === order.dealer_id)?.name || `ID: ${order.dealer_id}`}
                        </td>
                        <td className="border border-gray-300 p-3">{order.customer_name}</td>
                        <td className="border border-gray-300 p-3">{order.customer_email}</td>
                        <td className="border border-gray-300 p-3">{order.customer_phone}</td>
                        <td className="border border-gray-300 p-3">{order.boat_model}</td>
                        <td className="border border-gray-300 p-3 text-sm">{order.engine_package}</td>
                        <td className="border border-gray-300 p-3">{order.hull_color}</td>
                        <td className="border border-gray-300 p-3 font-semibold">
                          ${order.total_usd?.toLocaleString() || "0"}
                        </td>
                        <td className="border border-gray-300 p-2">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                            className="w-full p-1.5 border rounded bg-white"
                          >
                            {statusOptions.map(({ value, label }) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="border border-gray-300 p-3 text-sm">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString("pt-BR") : "-"}
                        </td>
                        <td className="border border-gray-300 p-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => setOrderToPrint(order)}
                              className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 text-xs"
                            >
                              {t("Download PDF")}
                            </button>
                            <button
                              onClick={() => handleSendEmail("order", order.order_id)}
                              disabled={isSendingEmail || !currentNotificationEmail}
                              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              title={
                                !currentNotificationEmail
                                  ? "Configure um email de notificação primeiro"
                                  : "Enviar por email"
                              }
                            >
                              {isSendingEmail ? "..." : "📧"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "sold-boats" && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 p-3 text-left">ID do Pedido</th>
                    <th className="border border-gray-300 p-3 text-left">Dealer</th>
                    <th className="border border-gray-300 p-3 text-left">Cliente</th>
                    <th className="border border-gray-300 p-3 text-left">Email</th>
                    <th className="border border-gray-300 p-3 text-left">Telefone</th>
                    <th className="border border-gray-300 p-3 text-left">Modelo</th>
                    <th className="border border-gray-300 p-3 text-left">Motor</th>
                    <th className="border border-gray-300 p-3 text-left">Cor</th>
                    <th className="border border-gray-300 p-3 text-left">Total USD</th>
                    <th className="border border-gray-300 p-3 text-left">Status</th>
                    <th className="border border-gray-300 p-3 text-left">Data</th>
                    <th className="border border-gray-300 p-3 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {soldOrders.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="border border-gray-300 p-4 text-center text-gray-500">
                        {t("No sold boats found")}
                      </td>
                    </tr>
                  ) : (
                    soldOrders.map((order, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-3 font-mono text-sm">{order.order_id}</td>
                        <td className="border border-gray-300 p-3">
                          {dealers.find((d) => d.id === order.dealer_id)?.name || `ID: ${order.dealer_id}`}
                        </td>
                        <td className="border border-gray-300 p-3">{order.customer_name}</td>
                        <td className="border border-gray-300 p-3">{order.customer_email}</td>
                        <td className="border border-gray-300 p-3">{order.customer_phone}</td>
                        <td className="border border-gray-300 p-3">{order.boat_model}</td>
                        <td className="border border-gray-300 p-3 text-sm">{order.engine_package}</td>
                        <td className="border border-gray-300 p-3">{order.hull_color}</td>
                        <td className="border border-gray-300 p-3 font-semibold">
                          ${order.total_usd?.toLocaleString() || "0"}
                        </td>
                        <td className="border border-gray-300 p-2">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                            className="w-full p-1.5 border rounded bg-white"
                          >
                            {statusOptions.map(({ value, label }) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="border border-gray-300 p-3 text-sm">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString("pt-BR") : "-"}
                        </td>
                        <td className="border border-gray-300 p-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => setOrderToPrint(order)}
                              className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 text-xs"
                            >
                              {t("Download PDF")}
                            </button>
                            <button
                              onClick={() => handleSendEmail("order", order.order_id)}
                              disabled={isSendingEmail || !currentNotificationEmail}
                              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              title={
                                !currentNotificationEmail
                                  ? "Configure um email de notificação primeiro"
                                  : "Enviar por email"
                              }
                            >
                              {isSendingEmail ? "..." : "📧"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "canceled-boats" && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 p-3 text-left">ID do Pedido</th>
                    <th className="border border-gray-300 p-3 text-left">Dealer</th>
                    <th className="border border-gray-300 p-3 text-left">Cliente</th>
                    <th className="border border-gray-300 p-3 text-left">Email</th>
                    <th className="border border-gray-300 p-3 text-left">Telefone</th>
                    <th className="border border-gray-300 p-3 text-left">Modelo</th>
                    <th className="border border-gray-300 p-3 text-left">Motor</th>
                    <th className="border border-gray-300 p-3 text-left">Cor</th>
                    <th className="border border-gray-300 p-3 text-left">Total USD</th>
                    <th className="border border-gray-300 p-3 text-left">Status</th>
                    <th className="border border-gray-300 p-3 text-left">Data</th>
                    <th className="border border-gray-300 p-3 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {canceledOrders.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="border border-gray-300 p-4 text-center text-gray-500">
                        {t("No canceled boats found")}
                      </td>
                    </tr>
                  ) : (
                    canceledOrders.map((order, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-3 font-mono text-sm">{order.order_id}</td>
                        <td className="border border-gray-300 p-3">
                          {dealers.find((d) => d.id === order.dealer_id)?.name || `ID: ${order.dealer_id}`}
                        </td>
                        <td className="border border-gray-300 p-3">{order.customer_name}</td>
                        <td className="border border-gray-300 p-3">{order.customer_email}</td>
                        <td className="border border-gray-300 p-3">{order.customer_phone}</td>
                        <td className="border border-gray-300 p-3">{order.boat_model}</td>
                        <td className="border border-gray-300 p-3 text-sm">{order.engine_package}</td>
                        <td className="border border-gray-300 p-3">{order.hull_color}</td>
                        <td className="border border-gray-300 p-3 font-semibold">
                          ${order.total_usd?.toLocaleString() || "0"}
                        </td>
                        <td className="border border-gray-300 p-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(order.status)}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="border border-gray-300 p-3 text-sm">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString("pt-BR") : "-"}
                        </td>
                        <td className="border border-gray-300 p-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => setOrderToPrint(order)}
                              className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 text-xs"
                            >
                              {t("Download PDF")}
                            </button>
                            <button
                              onClick={() => handleSendEmail("order", order.order_id)}
                              disabled={isSendingEmail || !currentNotificationEmail}
                              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              title={
                                !currentNotificationEmail
                                  ? "Configure um email de notificação primeiro"
                                  : "Enviar por email"
                              }
                            >
                              {isSendingEmail ? "..." : "📧"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "service" && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 p-3 text-left">ID</th>
                    <th className="border border-gray-300 p-3 text-left">Dealer</th>
                    <th className="border border-gray-300 p-3 text-left">Cliente</th>
                    <th className="border border-gray-300 p-3 text-left">Email</th>
                    <th className="border border-gray-300 p-3 text-left">Telefone</th>
                    <th className="border border-gray-300 p-3 text-left">Modelo</th>
                    <th className="border border-gray-300 p-3 text-left">Hull ID</th>
                    <th className="border border-gray-300 p-3 text-left">Tipo</th>
                    <th className="border border-gray-300 p-3 text-left">Problemas</th>
                    <th className="border border-gray-300 p-3 text-left">Status</th>
                    <th className="border border-gray-300 p-3 text-left">Data</th>
                    <th className="border border-gray-300 p-3 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceRequests.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="border border-gray-300 p-4 text-center text-gray-500">
                        Nenhuma solicitação de serviço encontrada
                      </td>
                    </tr>
                  ) : (
                    serviceRequests.map((request, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-3 font-mono text-sm">{request.request_id}</td>
                        <td className="border border-gray-300 p-3">
                          {dealers.find((d) => d.id === request.dealer_id)?.name || `ID: ${request.dealer_id}`}
                        </td>
                        <td className="border border-gray-300 p-3">{request.customer_name}</td>
                        <td className="border border-gray-300 p-3">{request.customer_email}</td>
                        <td className="border border-gray-300 p-3">{request.customer_phone}</td>
                        <td className="border border-gray-300 p-3">{request.boat_model}</td>
                        <td className="border border-gray-300 p-3 font-mono text-sm">{request.hull_id}</td>
                        <td className="border border-gray-300 p-3">{request.request_type}</td>
                        <td className="border border-gray-300 p-3">
                          <button
                            onClick={() => handleViewProblems(request.issues)}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                          >
                            👁️ Visualizar
                          </button>
                        </td>
                        <td className="border border-gray-300 p-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">{request.status}</span>
                        </td>
                        <td className="border border-gray-300 p-3 text-sm">
                          {request.created_at ? new Date(request.created_at).toLocaleDateString("pt-BR") : "-"}
                        </td>
                        <td className="border border-gray-300 p-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => setServiceRequestToPrint(request)}
                              className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 text-xs"
                            >
                              {t("Download PDF")}
                            </button>
                            <button
                              onClick={() => handleMessageDealer(request)}
                              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-xs"
                            >
                              💬 {t("Send Message")}
                            </button>
                            <button
                              onClick={() => handleSendEmail("service_request", request.request_id)}
                              disabled={isSendingEmail || !currentNotificationEmail}
                              className="bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              title={
                                !currentNotificationEmail
                                  ? "Configure um email de notificação primeiro"
                                  : "Enviar por email"
                              }
                            >
                              {isSendingEmail ? "..." : "📧"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={saveAll}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
          >
            {t("Save All")}
          </button>
          <button
            onClick={loadDataFromDatabase}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            🔄 Recarregar do Banco
          </button>
        </div>
      </div>

      {orderToPrint && (
        <OrderPDFGenerator
          order={orderToPrint}
          onGenerated={() => setOrderToPrint(null)}
          t={t}
          lang={lang}
          getStatusBadgeClass={getStatusBadgeClass}
          formatCurrency={formatCurrency}
        />
      )}

      {serviceRequestToPrint && (
        <ServiceRequestPDFGenerator
          request={serviceRequestToPrint}
          onGenerated={() => setServiceRequestToPrint(null)}
          t={t}
        />
      )}

      {/* Message Modal */}
      {showMessageModal && selectedServiceRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {t("Message Dealer")} - {selectedServiceRequest.request_id}
                </h2>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="text-lg font-semibold mb-4">{t("Messages")}</h3>
              {isLoadingMessages ? (
                <div className="text-center py-4">Carregando mensagens...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-4 text-gray-500">{t("No messages yet")}</div>
              ) : (
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.sender_type === "admin" ? "bg-blue-100 ml-8" : "bg-gray-100 mr-8"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-sm">
                          {message.sender_type === "admin" ? t("Administrator") : message.sender_name}
                        </span>
                        <span className="text-xs text-gray-500">{new Date(message.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t">
              <div className="flex gap-4">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t("Type your message...")}
                  className="flex-1 p-3 border border-gray-300 rounded-lg resize-none"
                  rows={3}
                />
                <div className="flex flex-col gap-2">
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isSendingMessage}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSendingMessage ? "..." : t("Send")}
                  </button>
                  <button
                    onClick={() => setShowMessageModal(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    {t("Cancel")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">
              {currentNotificationEmail ? "Editar Email de Notificação" : "Adicionar Email de Notificação"}
            </h2>
            <p className="text-gray-600 mb-4">
              Este email receberá notificações sobre pedidos (Track Orders) e solicitações de pós-venda (After Sales).
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email de Notificação</label>
                <input
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  placeholder="exemplo@empresa.com"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {currentNotificationEmail && (
                <div className="text-sm text-gray-500">
                  Email atual: <span className="font-medium">{currentNotificationEmail}</span>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowAddEmail(false)
                  setNotificationEmail(currentNotificationEmail)
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNotificationEmail}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                {currentNotificationEmail ? "Atualizar Email" : "Salvar Email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showProblemsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Detalhes dos Problemas</h2>
                <button
                  onClick={() => setShowProblemsModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                {Array.isArray(selectedProblems) ? (
                  selectedProblems.length > 0 ? (
                    selectedProblems.map((issue, i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4">
                        <div className="space-y-3">
                          <p className="text-gray-800 font-medium">{issue.text}</p>
                          {issue.imageUrl && (
                            <div className="flex justify-center">
                              <Image
                                src={issue.imageUrl || "/placeholder.svg"}
                                alt={issue.text || "Imagem do problema"}
                                width={300}
                                height={200}
                                className="rounded-lg border border-gray-300 object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">Nenhum problema reportado</p>
                  )
                ) : (
                  <p className="text-gray-500 text-center py-8">Formato de problema não reconhecido</p>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowProblemsModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Alterar Senha do Administrador</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Senha Atual</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowChangePassword(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja deletar este item? Esta ação não pode ser desfeita."
      />
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </div>
  )
}

const OrderPDFGenerator = ({
  order,
  onGenerated,
  t,
  lang,
  getStatusBadgeClass,
  formatCurrency,
}: {
  order: Order
  onGenerated: () => void
  t: (key: string) => string
  lang: string
  getStatusBadgeClass: (status: string) => string
  formatCurrency: (value: number | undefined, currency: "BRL" | "USD") => string
}) => {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (order && contentRef.current) {
      const input = contentRef.current
      html2canvas(input, { scale: 2, useCORS: true, allowTaint: true }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF("p", "mm", "a4")
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight > 297 ? 297 : pdfHeight)
        pdf.save(`pedido-${order.order_id}.pdf`)
        onGenerated()
      })
    }
  }, [order, onGenerated])

  if (!order) return null

  const renderOptionsList = (options: string[]) => {
    if (!options || options.length === 0) {
      return <p>{t("No options selected")}</p>
    }
    return (
      <ul className="list-disc list-inside space-y-1 bg-gray-50 p-3 rounded-lg">
        {options.map((option, index) => (
          <li key={index} className="text-sm">
            {option}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div style={{ position: "fixed", left: -9999, top: -9999, width: "210mm" }} className="bg-white" ref={contentRef}>
      <div className="p-6">
        <div className="text-center mb-6 pb-4 border-b-2 border-blue-900">
          <Image src="/images/logo_drakkar.png" alt="Drakkar Boats" width={300} height={80} className="mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-blue-900 mt-2">{t("Order Details")}</h2>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <strong>{t("Order ID")}:</strong>
              <br />
              <span className="font-mono text-sm">{order.order_id}</span>
            </div>
            <div>
              <strong>{t("Date")}:</strong>
              <br />
              {new Date(order.created_at).toLocaleDateString()}
            </div>
            <div>
              <strong>{t("Status")}:</strong>
              <br />
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-3">{t("Customer")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>{t("Name (EN)")}:</strong> {order.customer_name}
              </div>
              <div>
                <strong>{t("Email")}:</strong> {order.customer_email}
              </div>
              <div>
                <strong>{t("Phone")}:</strong> {order.customer_phone}
              </div>
              {order.customer_address && (
                <div>
                  <strong>{t("Address")}:</strong> {order.customer_address}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-3">{t("Boat Information")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>{t("Boat Model")}:</strong> {order.boat_model}
              </div>
              <div>
                <strong>{t("Engine")}:</strong> {order.engine_package}
              </div>
              <div>
                <strong>{t("Hull Color")}:</strong> {order.hull_color}
              </div>
              <div className="col-span-2">
                <strong>{t("Selected Options")}:</strong>
                <div className="mt-2">{renderOptionsList(order.additional_options)}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-3">{t("Payment Information")}</h3>
            <div className="grid grid-cols-2 gap-4">
              {order.payment_method && (
                <div>
                  <strong>{t("Payment Method")}:</strong> {order.payment_method}
                </div>
              )}
              {order.deposit_amount && (
                <div>
                  <strong>{t("Deposit Amount")}:</strong>{" "}
                  {formatCurrency(order.deposit_amount, lang === "pt" ? "BRL" : "USD")}
                </div>
              )}
              <div className={`text-lg font-bold ${lang === "pt" ? "text-green-700" : "text-blue-900"}`}>
                <strong>{t("Total")}:</strong>{" "}
                {formatCurrency(lang === "pt" ? order.total_brl : order.total_usd, lang === "pt" ? "BRL" : "USD")}
              </div>
            </div>
          </div>

          {order.notes && (
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-3">{t("Additional Notes")}</h3>
              <p className="bg-gray-50 p-4 rounded-lg">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const ServiceRequestPDFGenerator = ({
  request,
  onGenerated,
  t,
}: {
  request: ServiceRequest
  onGenerated: () => void
  t: (key: string) => string
}) => {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (request && contentRef.current) {
      const input = contentRef.current
      html2canvas(input, { scale: 2, useCORS: true, allowTaint: true }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF("p", "mm", "a4")
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight > 297 ? 297 : pdfHeight)
        pdf.save(`solicitacao-${request.request_id}.pdf`)
        onGenerated()
      })
    }
  }, [request, onGenerated])

  if (!request) return null

  return (
    <div style={{ position: "fixed", left: -9999, top: -9999, width: "210mm" }} className="bg-white" ref={contentRef}>
      <div className="p-6">
        <div className="text-center mb-6 pb-4 border-b-2 border-blue-900">
          <Image src="/images/logo_drakkar.png" alt="Drakkar Boats" width={300} height={80} className="mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-blue-900 mt-2">{t("Service Request Details")}</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>{t("ID")}:</strong> {request.request_id}
            </div>
            <div>
              <strong>{t("Date")}:</strong> {new Date(request.created_at).toLocaleDateString()}
            </div>
          </div>
          <div>
            <strong>{t("Status")}:</strong>{" "}
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {request.status}
            </span>
          </div>
          <hr />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>{t("Customer")}:</strong> {request.customer_name}
            </div>
            <div>
              <strong>{t("Email")}:</strong> {request.customer_email}
            </div>
            <div>
              <strong>{t("Phone")}:</strong> {request.customer_phone}
            </div>
            <div>
              <strong>{t("Address")}:</strong> {request.customer_address}
            </div>
          </div>
          <hr />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>{t("Boat Model")}:</strong> {request.boat_model}
            </div>
            <div>
              <strong>{t("Hull ID")}:</strong> {request.hull_id}
            </div>
            <div>
              <strong>{t("Purchase Date")}:</strong> {request.purchase_date}
            </div>
            <div>
              <strong>{t("Engine Hours")}:</strong> {request.engine_hours}
            </div>
          </div>
          <div>
            <strong>{t("Request Type")}:</strong> {request.request_type}
          </div>
          <div>
            <strong>{t("Issues")}:</strong>
            <ul className="list-disc list-inside mt-2 space-y-2">
              {request.issues.map((issue, index) => (
                <li key={index} className="p-2 border rounded-md">
                  <p>{issue.text}</p>
                  {issue.imageUrl && (
                    <Image
                      src={issue.imageUrl || "/placeholder.svg"}
                      alt={`Image for ${issue.text}`}
                      width={100}
                      height={100}
                      className="mt-2 rounded-lg object-cover"
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
