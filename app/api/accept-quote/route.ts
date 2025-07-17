import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function POST(request: Request) {
  try {
    const { quoteId } = await request.json()

    if (!quoteId) {
      return NextResponse.json(
        {
          success: false,
          error: "ID do orçamento é obrigatório",
        },
        { status: 400 },
      )
    }

    console.log("Aceitando orçamento:", quoteId)

    // Buscar o orçamento
    const quote = await DatabaseService.getQuoteById(quoteId)

    if (!quote) {
      return NextResponse.json(
        {
          success: false,
          error: "Orçamento não encontrado",
        },
        { status: 404 },
      )
    }

    // Atualizar status para aceito
    await DatabaseService.updateQuoteStatus(quoteId, "accepted")

    // Criar um pedido baseado no orçamento
    const orderData = {
      order_id: DatabaseService.generateOrderId(),
      dealer_id: quote.dealer_id,
      customer_name: quote.customer_name,
      customer_email: quote.customer_email,
      customer_phone: quote.customer_phone,
      customer_address: quote.customer_address,
      customer_city: quote.customer_city,
      customer_state: quote.customer_state,
      customer_zip: quote.customer_zip,
      customer_country: quote.customer_country,
      boat_model: quote.boat_model,
      engine_package: quote.engine_package,
      hull_color: quote.hull_color,
      additional_options: quote.additional_options,
      payment_method: quote.payment_method || "cash",
      deposit_amount: quote.deposit_amount || 0,
      additional_notes: quote.additional_notes,
      total_usd: quote.total_usd,
      total_brl: quote.total_brl,
      status: "pending",
    }

    const newOrder = await DatabaseService.createOrder(orderData)

    console.log("Pedido criado a partir do orçamento:", newOrder)

    return NextResponse.json({
      success: true,
      data: {
        quote: quote,
        order: newOrder,
      },
    })
  } catch (error) {
    console.error("Erro ao aceitar orçamento:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
