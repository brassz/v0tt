import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dealerName = searchParams.get("dealerName")

    if (!dealerName) {
      return NextResponse.json(
        {
          success: false,
          error: "Nome do dealer é obrigatório",
        },
        { status: 400 },
      )
    }

    console.log("Buscando orçamentos para dealer:", dealerName)

    // Buscar o dealer pelo nome para obter o UUID
    const dealers = await DatabaseService.getDealers()
    const dealer = dealers.find((d) => d.name === dealerName)

    if (!dealer || !dealer.id) {
      console.error("Dealer não encontrado:", dealerName)
      return NextResponse.json(
        {
          success: false,
          error: "Dealer não encontrado",
        },
        { status: 404 },
      )
    }

    console.log("Dealer encontrado:", dealer)

    // Buscar orçamentos do dealer usando o UUID
    const quotes = await DatabaseService.getQuotesByDealer(dealer.id)

    console.log("Orçamentos encontrados:", quotes.length)

    // Transformar os dados para o formato esperado pelo frontend
    const formattedQuotes = quotes.map((quote) => ({
      quoteId: quote.quote_id,
      dealer: dealerName,
      customer: {
        name: quote.customer_name,
        email: quote.customer_email,
        phone: quote.customer_phone,
        address: quote.customer_address,
        city: quote.customer_city,
        state: quote.customer_state,
        zip: quote.customer_zip,
        country: quote.customer_country,
      },
      model: quote.boat_model,
      engine: quote.engine_package,
      hull_color: quote.hull_color,
      options: Array.isArray(quote.additional_options)
        ? quote.additional_options
        : typeof quote.additional_options === "string"
          ? JSON.parse(quote.additional_options)
          : [],
      paymentMethod: quote.payment_method,
      depositAmount: quote.deposit_amount,
      additionalNotes: quote.additional_notes,
      date: quote.created_at,
      status: quote.status,
      totalUsd: quote.total_usd,
      totalBrl: quote.total_brl,
      validUntil: quote.valid_until,
    }))

    return NextResponse.json({
      success: true,
      data: formattedQuotes,
    })
  } catch (error) {
    console.error("Erro ao buscar orçamentos:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
