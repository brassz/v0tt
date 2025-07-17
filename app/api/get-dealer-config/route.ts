import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dealerId = searchParams.get("dealer_id")

    // Carregar dados básicos (preços de custo)
    const [enginePackages, hullColors, additionalOptions, boatModels] = await Promise.all([
      DatabaseService.getEnginePackages(),
      DatabaseService.getHullColors(),
      DatabaseService.getAdditionalOptions(),
      DatabaseService.getBoatModels(),
    ])

    // Se dealer_id for fornecido, buscar preços específicos do dealer
    let dealerPricing: any[] = []
    if (dealerId) {
      const { data: pricing, error } = await supabase.from("dealer_pricing").select("*").eq("dealer_id", dealerId)

      if (!error && pricing) {
        dealerPricing = pricing
      }
    }

    // Função para aplicar preços do dealer aos itens
    const applyDealerPricing = (items: any[], itemType: string) => {
      return items.map((item) => {
        const dealerPrice = dealerPricing.find((p) => p.item_type === itemType && String(p.item_id) === String(item.id))

        if (dealerPrice) {
          // Se dealer tem preço configurado, usar preço de venda do dealer
          return {
            ...item,
            usd: dealerPrice.sale_price_usd || item.usd,
            brl: dealerPrice.sale_price_brl || item.brl,
            cost_usd: item.usd, // Manter preço de custo original
            cost_brl: item.brl, // Manter preço de custo original
            dealer_configured: true,
            margin_percentage: dealerPrice.margin_percentage || 0,
          }
        }

        // Se dealer não tem preço configurado, usar preço de custo como preço de venda
        return {
          ...item,
          cost_usd: item.usd,
          cost_brl: item.brl,
          dealer_configured: false,
          margin_percentage: 0,
        }
      })
    }

    // Aplicar preços do dealer a todos os tipos de itens
    const processedData = {
      enginePackages: applyDealerPricing(enginePackages, "engine_package"),
      hullColors: applyDealerPricing(hullColors, "hull_color"),
      additionalOptions: applyDealerPricing(additionalOptions, "additional_option"),
      boatModels: applyDealerPricing(boatModels, "boat_model"),
    }

    return NextResponse.json({
      success: true,
      data: processedData,
      message: dealerId ? `Preços aplicados para dealer ${dealerId}` : "Preços de custo padrão",
    })
  } catch (error) {
    console.error("Erro ao buscar configurações:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
