import { createServerClient } from "./supabase"

const supabase = createServerClient()

// Tipos para facilitar o uso
export interface EnginePackage {
  id?: number
  name: string
  name_pt: string
  usd: number
  brl: number
  compatible_models?: string[]
  created_at?: string
}

export interface HullColor {
  id?: number
  name: string
  name_pt: string
  usd: number
  brl: number
  compatible_models?: string[]
  created_at?: string
}

export interface AdditionalOption {
  id?: number
  name: string
  name_pt: string
  usd: number
  brl: number
  created_at?: string
}

export interface BoatModel {
  id?: number
  name: string
  name_pt: string
  usd: number
  brl: number
  created_at?: string
}

export interface Dealer {
  id?: string // Changed from number to string for UUID
  name: string
  email: string
  password: string
  country: string
  created_at?: string
}

export interface Order {
  id?: number
  order_id: string
  dealer_id: string // Changed from number to string for UUID
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address?: string
  customer_city?: string
  customer_state?: string
  customer_zip?: string
  customer_country?: string
  boat_model: string
  engine_package: string
  hull_color: string
  additional_options: string[]
  payment_method: string
  deposit_amount: number
  additional_notes?: string
  total_usd: number
  total_brl: number
  status: string
  created_at?: string
}

export interface ServiceRequest {
  id?: number
  request_id: string
  dealer_id: string // Changed from number to string for UUID
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address?: string
  boat_model: string
  hull_id: string
  purchase_date: string
  engine_hours?: string
  request_type: string
  issues: any[]
  status: string
  created_at?: string
}

export interface Quote {
  id?: number
  quote_id: string
  dealer_id: string // Changed from number to string for UUID
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address?: string
  customer_city?: string
  customer_state?: string
  customer_zip?: string
  customer_country?: string
  boat_model: string
  engine_package: string
  hull_color: string
  additional_options: string[]
  payment_method?: string
  deposit_amount?: number
  additional_notes?: string
  total_usd: number
  total_brl: number
  status: string
  valid_until?: string
  created_at?: string
  updated_at?: string
}

export class DatabaseService {
  // Testar conexão
  static async testConnection(): Promise<boolean> {
    try {
      const { error } = await supabase.from("dealers").select("id").limit(1)

      if (error) {
        console.error("❌ Erro na conexão:", error)
        return false
      }

      console.log("✅ Conexão com Supabase funcionando!")
      return true
    } catch (error) {
      console.error("❌ Erro ao conectar com Supabase:", error)
      return false
    }
  }

  // CRUD para Engine Packages
  static async getEnginePackages(): Promise<EnginePackage[]> {
    try {
      const { data, error } = await supabase.from("engine_packages").select("*").order("id")

      if (error) {
        console.error("Erro ao buscar pacotes de motor:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Erro inesperado:", error)
      return []
    }
  }

  static async saveEnginePackages(packages: EnginePackage[]) {
    try {
      const newItems = packages
        .filter((item) => !item.id)
        .map((item) => ({
          name: item.name,
          name_pt: item.name_pt,
          usd: item.usd,
          brl: item.brl,
          compatible_models: item.compatible_models || [],
        }))

      const existingItems = packages
        .filter((item) => item.id)
        .map((item) => ({
          id: item.id,
          name: item.name,
          name_pt: item.name_pt,
          usd: item.usd,
          brl: item.brl,
          compatible_models: item.compatible_models || [],
        }))

      if (newItems.length > 0) {
        const { error: insertError } = await supabase.from("engine_packages").insert(newItems)
        if (insertError) {
          console.error("Erro ao inserir pacotes de motor:", insertError)
          throw insertError
        }
      }

      for (const item of existingItems) {
        const { error: updateError } = await supabase
          .from("engine_packages")
          .update({
            name: item.name,
            name_pt: item.name_pt,
            usd: item.usd,
            brl: item.brl,
            compatible_models: item.compatible_models,
          })
          .eq("id", item.id!)

        if (updateError) {
          console.error(`Erro ao atualizar pacote de motor ID ${item.id}:`, updateError)
          throw updateError
        }
      }

      console.log("✅ Pacotes de motor salvos com sucesso!")
    } catch (error) {
      console.error("❌ Erro ao salvar pacotes de motor:", error)
      throw error
    }
  }

  // CRUD para Hull Colors
  static async getHullColors(): Promise<HullColor[]> {
    try {
      const { data, error } = await supabase.from("hull_colors").select("*").order("id")

      if (error) {
        console.error("Erro ao buscar cores de casco:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Erro inesperado:", error)
      return []
    }
  }

  static async saveHullColors(colors: HullColor[]) {
    try {
      const newItems = colors
        .filter((item) => !item.id)
        .map((item) => ({
          name: item.name,
          name_pt: item.name_pt,
          usd: item.usd,
          brl: item.brl,
          compatible_models: item.compatible_models || [],
        }))

      const existingItems = colors
        .filter((item) => item.id)
        .map((item) => ({
          id: item.id,
          name: item.name,
          name_pt: item.name_pt,
          usd: item.usd,
          brl: item.brl,
          compatible_models: item.compatible_models || [],
        }))

      if (newItems.length > 0) {
        const { error: insertError } = await supabase.from("hull_colors").insert(newItems)
        if (insertError) {
          console.error("Erro ao inserir cores de casco:", insertError)
          throw insertError
        }
      }

      for (const item of existingItems) {
        const { error: updateError } = await supabase
          .from("hull_colors")
          .update({
            name: item.name,
            name_pt: item.name_pt,
            usd: item.usd,
            brl: item.brl,
            compatible_models: item.compatible_models,
          })
          .eq("id", item.id!)

        if (updateError) {
          console.error(`Erro ao atualizar cor de casco ID ${item.id}:`, updateError)
          throw updateError
        }
      }

      console.log("✅ Cores de casco salvas com sucesso!")
    } catch (error) {
      console.error("❌ Erro ao salvar cores de casco:", error)
      throw error
    }
  }

  // CRUD para Additional Options
  static async getAdditionalOptions(): Promise<AdditionalOption[]> {
    try {
      const { data, error } = await supabase.from("additional_options").select("*").order("id")

      if (error) {
        console.error("Erro ao buscar opções adicionais:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Erro inesperado:", error)
      return []
    }
  }

  static async saveAdditionalOptions(options: AdditionalOption[]) {
    try {
      const newItems = options
        .filter((option) => !option.id)
        .map((option) => ({
          name: option.name,
          name_pt: option.name_pt,
          usd: option.usd,
          brl: option.brl,
        }))

      const existingItems = options
        .filter((option) => option.id)
        .map((option) => ({
          id: option.id,
          name: option.name,
          name_pt: option.name_pt,
          usd: option.usd,
          brl: option.brl,
        }))

      if (newItems.length > 0) {
        const { error: insertError } = await supabase.from("additional_options").insert(newItems)
        if (insertError) throw insertError
      }

      for (const item of existingItems) {
        const { error: updateError } = await supabase
          .from("additional_options")
          .update({
            name: item.name,
            name_pt: item.name_pt,
            usd: item.usd,
            brl: item.brl,
          })
          .eq("id", item.id)

        if (updateError) throw updateError
      }

      console.log("✅ Opções adicionais salvas com sucesso!")
    } catch (error) {
      console.error("❌ Erro ao salvar opções adicionais:", error)
      throw error
    }
  }

  // CRUD para Boat Models
  static async getBoatModels(): Promise<BoatModel[]> {
    try {
      const { data, error } = await supabase.from("boat_models").select("*").order("id")

      if (error) {
        console.error("Erro ao buscar modelos de barco:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Erro inesperado:", error)
      return []
    }
  }

  static async saveBoatModels(models: BoatModel[]) {
    try {
      const newItems = models
        .filter((model) => !model.id)
        .map((model) => ({
          name: model.name,
          name_pt: model.name_pt,
          usd: model.usd || 0,
          brl: model.brl || 0,
        }))

      const existingItems = models
        .filter((model) => model.id)
        .map((model) => ({
          id: model.id,
          name: model.name,
          name_pt: model.name_pt,
          usd: model.usd || 0,
          brl: model.brl || 0,
        }))

      if (newItems.length > 0) {
        const { error: insertError } = await supabase.from("boat_models").insert(newItems)
        if (insertError) throw insertError
      }

      for (const item of existingItems) {
        const { error: updateError } = await supabase
          .from("boat_models")
          .update({
            name: item.name,
            name_pt: item.name_pt,
            usd: item.usd || 0,
            brl: item.brl || 0,
          })
          .eq("id", item.id)

        if (updateError) throw updateError
      }

      console.log("✅ Modelos de barco salvos com sucesso!")
    } catch (error) {
      console.error("❌ Erro ao salvar modelos de barco:", error)
      throw error
    }
  }

  // CRUD para Dealers
  static async getDealers(): Promise<Dealer[]> {
    try {
      const { data, error } = await supabase.from("dealers").select("*").order("id")

      if (error) {
        console.error("Erro ao buscar dealers:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Erro inesperado:", error)
      return []
    }
  }

  static async saveDealers(dealers: Dealer[]) {
    try {
      const uniqueByEmail = Array.from(new Map(dealers.map((d) => [d.email?.toLowerCase().trim(), d])).values())

      const { error } = await supabase.from("dealers").upsert(
        uniqueByEmail.map((d) => ({
          name: d.name,
          email: d.email,
          password: d.password,
          country: d.country,
        })),
        { onConflict: "email" },
      )

      if (error) throw error
      console.log("✅ Dealers salvos/atualizados com sucesso!")
    } catch (error) {
      console.error("❌ Erro ao salvar dealers:", error)
      throw error
    }
  }

  // Autenticação de dealer
  static async authenticateDealer(email: string, password: string): Promise<Dealer | null> {
    try {
      const { data, error } = await supabase
        .from("dealers")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single()

      if (error) return null
      return data
    } catch (error) {
      console.error("Erro na autenticação:", error)
      return null
    }
  }

  // CRUD para Orders
  static async getOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error)
      return []
    }
  }

  static async saveOrders(orders: Pick<Order, "order_id" | "status">[]) {
    try {
      for (const order of orders) {
        const { error } = await supabase.from("orders").update({ status: order.status }).eq("order_id", order.order_id)

        if (error) {
          console.error(`Erro ao atualizar o pedido ${order.order_id}:`, error)
        }
      }
      console.log("✅ Status dos pedidos atualizados com sucesso!")
    } catch (error) {
      console.error("❌ Erro ao salvar status dos pedidos:", error)
      throw error
    }
  }

  static async getOrdersByDealer(dealerId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("dealer_id", dealerId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao buscar pedidos do dealer:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Erro inesperado:", error)
      return []
    }
  }

  static async createOrder(orderData: Omit<Order, "id" | "created_at">) {
    try {
      const { data, error } = await supabase.from("orders").insert([orderData]).select().single()

      if (error) {
        console.error("Erro ao criar pedido:", error)
        throw error
      }

      console.log("✅ Pedido criado com sucesso!")
      return data
    } catch (error) {
      console.error("❌ Erro ao criar pedido:", error)
      throw error
    }
  }

  static async updateOrderStatus(orderId: string, status: string) {
    try {
      const { error } = await supabase.from("orders").update({ status }).eq("order_id", orderId)

      if (error) {
        console.error("Erro ao atualizar status do pedido:", error)
        throw error
      }

      console.log("✅ Status do pedido atualizado!")
    } catch (error) {
      console.error("❌ Erro ao atualizar status:", error)
      throw error
    }
  }

  // CRUD para Service Requests
  static async getServiceRequests(): Promise<ServiceRequest[]> {
    try {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Erro ao buscar solicitações:", error)
      return []
    }
  }

  static async getServiceRequestsByDealer(dealerId: string): Promise<ServiceRequest[]> {
    try {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*")
        .eq("dealer_id", dealerId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao buscar solicitações do dealer:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Erro inesperado:", error)
      return []
    }
  }

  static async createServiceRequest(requestData: Omit<ServiceRequest, "id" | "created_at">) {
    try {
      requestData.status = requestData.status?.toLowerCase() ?? "open"

      const { data, error } = await supabase
        .from("service_requests")
        .upsert([requestData], { onConflict: "request_id" })
        .select()
        .single()

      if (error) {
        console.error("Erro ao criar/atualizar solicitação:", error)
        throw error
      }

      console.log("✅ Solicitação criada/atualizada com sucesso!")
      return data
    } catch (error) {
      console.error("❌ Erro ao criar/atualizar solicitação:", error)
      throw error
    }
  }

  static async updateServiceRequestStatus(requestId: string, status: string) {
    try {
      const { error } = await supabase.from("service_requests").update({ status }).eq("request_id", requestId)

      if (error) {
        console.error("Erro ao atualizar status da solicitação:", error)
        throw error
      }

      console.log("✅ Status da solicitação atualizado!")
    } catch (error) {
      console.error("❌ Erro ao atualizar status:", error)
      throw error
    }
  }

  static async deleteServiceRequest(requestId: string) {
    try {
      const { error } = await supabase.from("service_requests").delete().eq("request_id", requestId)

      if (error) {
        console.error("Erro ao deletar solicitação:", error)
        throw error
      }

      console.log("✅ Solicitação deletada com sucesso!")
    } catch (error) {
      console.error("❌ Erro ao deletar solicitação:", error)
      throw error
    }
  }

  // CRUD para Quotes
  static async getQuotes(): Promise<Quote[]> {
    try {
      const { data, error } = await supabase.from("quotes").select("*").order("created_at", { ascending: false })

      if (error) {
        if (error.code === "42P01") {
          console.warn("quotes table not found – run scripts/create-quotes-table-fixed.sql to create it.")
          return []
        }
        console.error("Erro ao buscar orçamentos:", error)
        throw error
      }
      return data || []
    } catch (error) {
      console.error("Erro ao buscar orçamentos:", error)
      return []
    }
  }

  static async getQuotesByDealer(dealerId: string): Promise<Quote[]> {
    try {
      console.log("Buscando orçamentos para dealer ID:", dealerId)

      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("dealer_id", dealerId)
        .order("created_at", { ascending: false })

      if (error) {
        if (error.code === "42P01") {
          console.warn("quotes table not found – run scripts/create-quotes-table-fixed.sql to create it.")
          return []
        }
        console.error("Erro ao buscar orçamentos do dealer:", error)
        throw error
      }

      console.log("Orçamentos encontrados no banco:", data?.length || 0)
      return data || []
    } catch (error) {
      console.error("Erro inesperado ao buscar orçamentos:", error)
      return []
    }
  }

  static async getQuoteById(quoteId: string): Promise<Quote | null> {
    try {
      const { data, error } = await supabase.from("quotes").select("*").eq("quote_id", quoteId).single()

      if (error) {
        if (error.code === "PGRST116") {
          console.log("Orçamento não encontrado:", quoteId)
          return null
        }
        console.error("Erro ao buscar orçamento:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Erro inesperado:", error)
      return null
    }
  }

  static async createQuote(quoteData: Omit<Quote, "id" | "created_at" | "updated_at">) {
    try {
      console.log("Criando orçamento com dados:", quoteData)

      // Validate that dealer_id is not null
      if (!quoteData.dealer_id) {
        throw new Error("dealer_id é obrigatório para criar um orçamento")
      }

      // Ensure additional_options is properly formatted for JSONB
      const cleanData = {
        ...quoteData,
        additional_options: Array.isArray(quoteData.additional_options) ? quoteData.additional_options : [],
      }

      console.log("Dados limpos para inserção:", cleanData)

      const { data, error } = await supabase.from("quotes").insert([cleanData]).select().single()

      if (error) {
        console.error("Erro detalhado do Supabase:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        throw new Error(`Erro ao inserir orçamento: ${error.message}`)
      }

      console.log("✅ Orçamento criado com sucesso!")
      return data
    } catch (error) {
      console.error("❌ Erro ao criar orçamento:", error)
      throw error
    }
  }

  static async updateQuoteStatus(quoteId: string, status: string) {
    try {
      console.log("Atualizando status do orçamento:", quoteId, "para:", status)

      const { error } = await supabase.from("quotes").update({ status }).eq("quote_id", quoteId)

      if (error) {
        console.error("Erro ao atualizar status do orçamento:", error)
        throw error
      }

      console.log("✅ Status do orçamento atualizado!")
    } catch (error) {
      console.error("❌ Erro ao atualizar status:", error)
      throw error
    }
  }

  // Funções utilitárias
  static generateOrderId(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const timestamp = now.getTime().toString().slice(-4)

    return `ORD-${year}${month}${day}-${timestamp}`
  }

  static generateServiceRequestId(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const timestamp = now.getTime().toString().slice(-4)

    return `SR-${year}${month}${day}-${timestamp}`
  }

  static generateQuoteId(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const timestamp = now.getTime().toString().slice(-4)

    return `QUO-${year}${month}${day}-${timestamp}`
  }

  // Subscrições em tempo real
  static subscribeToOrders(callback: (orders: Order[]) => void) {
    return supabase
      .channel("orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        DatabaseService.getOrders().then(callback)
      })
      .subscribe()
  }

  static subscribeToServiceRequests(callback: (requests: ServiceRequest[]) => void) {
    return supabase
      .channel("service_requests")
      .on("postgres_changes", { event: "*", schema: "public", table: "service_requests" }, () => {
        DatabaseService.getServiceRequests().then(callback)
      })
      .subscribe()
  }

  // Funções de Delete
  static async deleteEnginePackage(id: number) {
    try {
      const { error } = await supabase.from("engine_packages").delete().eq("id", id)
      if (error) throw error
      console.log("✅ Pacote de motor deletado com sucesso!")
    } catch (error) {
      console.error("❌ Erro ao deletar pacote de motor:", error)
      throw error
    }
  }

  static async deleteHullColor(id: number) {
    try {
      const { error } = await supabase.from("hull_colors").delete().eq("id", id)
      if (error) throw error
      console.log("✅ Cor de casco deletada com sucesso!")
    } catch (error) {
      console.error("❌ Erro ao deletar cor de casco:", error)
      throw error
    }
  }

  static async deleteAdditionalOption(id: number) {
    try {
      const { error } = await supabase.from("additional_options").delete().eq("id", id)
      if (error) throw error
      console.log("✅ Opção adicional deletada com sucesso!")
    } catch (error) {
      console.error("❌ Erro ao deletar opção adicional:", error)
      throw error
    }
  }

  static async deleteBoatModel(id: number) {
    try {
      const { error } = await supabase.from("boat_models").delete().eq("id", id)
      if (error) throw error
      console.log("✅ Modelo de barco deletado com sucesso!")
    } catch (error) {
      console.error("❌ Erro ao deletar modelo de barco:", error)
      throw error
    }
  }

  static async deleteDealer(id: string) {
    try {
      const { error } = await supabase.from("dealers").delete().eq("id", id)
      if (error) throw error
      console.log("✅ Dealer deletado com sucesso!")
    } catch (error) {
      console.error("❌ Erro ao deletar dealer:", error)
      throw error
    }
  }

  // Funções para senha do Admin
  static async getAdminPassword(): Promise<string | null> {
    try {
      const { data, error } = await supabase.from("admin_settings").select("value").eq("key", "admin_password").single()

      if (error) {
        if (error.code === "PGRST116") {
          console.warn("Senha do admin não encontrada no banco. Usando padrão 'drakkar'.")
          return "drakkar"
        }
        throw error
      }
      return data?.value || "drakkar"
    } catch (error) {
      console.error("❌ Erro ao buscar senha do admin:", error)
      return "drakkar"
    }
  }

  static async updateAdminPassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.from("admin_settings").update({ value: newPassword }).eq("key", "admin_password")

      if (error) throw error
      console.log("✅ Senha do admin atualizada com sucesso!")
    } catch (error) {
      console.error("❌ Erro ao atualizar senha do admin:", error)
      throw error
    }
  }

  // Funções para email de notificação
  static async getNotificationEmail(): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", "notification_email")
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          console.warn("Email de notificação não encontrado no banco.")
          return null
        }
        throw error
      }
      return data?.value || null
    } catch (error) {
      console.error("❌ Erro ao buscar email de notificação:", error)
      return null
    }
  }

  static async updateNotificationEmail(email: string): Promise<void> {
    try {
      const { error } = await supabase.from("admin_settings").upsert({ key: "notification_email", value: email })

      if (error) throw error
      console.log("✅ Email de notificação atualizado com sucesso!")
    } catch (error) {
      console.error("❌ Erro ao atualizar email de notificação:", error)
      throw error
    }
  }
}
