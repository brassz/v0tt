import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

/* ------------------------------------------------------------------
   Utilitário de reintento: tenta até 3 vezes caso o Supabase responda
   429 "Too Many Requests".  Atraso progressivo: 0 ms → 250 ms → 500 ms
------------------------------------------------------------------- */
async function fetchTable<T>(table: string): Promise<T[]> {
  const supabase = createServerClient()

  for (let attempt = 0; attempt < 3; attempt++) {
    // Ordena por ID ascendente para manter uma ordem estável na UI
    const { data, error } = await supabase.from(table).select("*").order("id", { ascending: true })

    // Sucesso 🎉
    if (!error) return data as T[]

    // Se não for 429, aborte imediatamente
    if (error.status !== 429) {
      console.error(`Erro (${table}):`, error)
      throw error
    }

    // 429 – esperar e tentar de novo
    const delay = 250 * attempt
    console.warn(`429 em "${table}", tentativa ${attempt + 1}. Aguardando ${delay} ms…`)
    await new Promise((r) => setTimeout(r, delay))
  }

  throw new Error(`Falhou ao carregar a tabela "${table}" após 3 tentativas`)
}

export async function GET() {
  try {
    // Busca sequencial com retry
    const enginePackages = await fetchTable("engine_packages")
    const hullColors = await fetchTable("hull_colors")
    const additionalOptions = await fetchTable("additional_options")
    const boatModels = await fetchTable("boat_models")
    const dealers = await fetchTable("dealers")
    const orders = await fetchTable("orders")
    const serviceRequests = await fetchTable("service_requests")

    let dealerInventory: unknown[] = []

    try {
      dealerInventory = await fetchTable("dealer_inventory")
    } catch (err: any) {
      // Relation doesn’t exist yet – keep portal operational
      if ((err?.message && err.message.includes("does not exist")) || err?.details?.includes("No such relation")) {
        console.warn('Tabela "dealer_inventory" não encontrada — retornando lista vazia.')
        dealerInventory = []
      } else {
        throw err // re-throw any other kind of failure
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        enginePackages,
        hullColors,
        additionalOptions,
        boatModels,
        dealers,
        orders,
        serviceRequests,
        dealerInventory,
      },
    })
  } catch (error) {
    console.error("Erro ao buscar dados do admin:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
