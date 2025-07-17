import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function POST(request: Request) {
  try {
    const quoteData = await request.json()
    console.log("Dados recebidos para salvar orçamento:", quoteData)

    // Buscar o dealer pelo nome para obter o UUID
    const dealers = await DatabaseService.getDealers()
    const dealer = dealers.find((d) => d.name === quoteData.dealerName)

    if (!dealer || !dealer.id) {
      console.error("Dealer não encontrado:", quoteData.dealerName)
      return NextResponse.json(
        {
          success: false,
          error: "Dealer não encontrado",
        },
        { status: 404 },
      )
    }

    console.log("Dealer encontrado:", dealer)

    // Preparar dados para inserção com dealer_id como UUID
    const quoteToSave = {
      quote_id: quoteData.quoteId,
      dealer_id: dealer.id, // UUID do dealer
      customer_name: quoteData.customer.name,
      customer_email: quoteData.customer.email,
      customer_phone: quoteData.customer.phone,
      customer_address: quoteData.customer.address || null,
      customer_city: quoteData.customer.city || null,
      customer_state: quoteData.customer.state || null,
      customer_zip: quoteData.customer.zip || null,
      customer_country: quoteData.customer.country || null,
      boat_model: quoteData.model,
      engine_package: quoteData.engine,
      hull_color: quoteData.hull_color,
      additional_options: quoteData.options || [],
      payment_method: quoteData.payment_method || null,
      deposit_amount: quoteData.deposit_amount || 0,
      additional_notes: quoteData.additional_notes || null,
      total_usd: quoteData.totalUsd,
      total_brl: quoteData.totalBrl,
      status: quoteData.status || "pending",
      valid_until: quoteData.valid_until || null,
    }

    console.log("Dados preparados para inserção:", quoteToSave)

    // Salvar o orçamento
    const savedQuote = await DatabaseService.createQuote(quoteToSave)

    return NextResponse.json({
      success: true,
      data: savedQuote,
    })
  } catch (error) {
    console.error("Erro ao salvar orçamento:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
