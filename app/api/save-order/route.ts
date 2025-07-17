import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function POST(request: Request) {
  try {
    const orderData = await request.json()
    console.log("Received order data:", orderData)

    // Generate order ID if not provided
    const orderId = orderData.orderId || DatabaseService.generateOrderId()

    // Get dealer info
    const dealers = await DatabaseService.getDealers()
    const dealer = dealers.find((d) => d.name === orderData.dealerName)

    if (!dealer || !dealer.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Dealer não encontrado",
        },
        { status: 404 },
      )
    }

    // Handle both nested customer object (legacy) and flat fields (new)
    const customerName = orderData.customer?.name || orderData.customer_name
    const customerEmail = orderData.customer?.email || orderData.customer_email
    const customerPhone = orderData.customer?.phone || orderData.customer_phone
    const customerAddress = orderData.customer?.address || orderData.customer_address || ""
    const customerCity = orderData.customer?.city || orderData.customer_city || ""
    const customerState = orderData.customer?.state || orderData.customer_state || ""
    const customerZip = orderData.customer?.zip || orderData.customer_zip || ""
    const customerCountry = orderData.customer?.country || orderData.customer_country || ""

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados do cliente incompletos",
        },
        { status: 400 },
      )
    }

    // Build the database order data
    const dbOrderData = {
      order_id: orderId,
      dealer_id: dealer.id,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      customer_city: customerCity,
      customer_state: customerState,
      customer_zip: customerZip,
      customer_country: customerCountry,
      boat_model: orderData.model || orderData.boat_model || "",
      engine_package: orderData.engine || orderData.engine_package || "",
      hull_color: orderData.hull_color || "",
      additional_options: Array.isArray(orderData.options)
        ? orderData.options
        : Array.isArray(orderData.additional_options)
          ? orderData.additional_options
          : [],
      payment_method: orderData.paymentMethod || orderData.payment_method || "",
      deposit_amount: Number(orderData.depositAmount || orderData.deposit_amount || 0),
      additional_notes: orderData.additionalNotes || orderData.additional_notes || "",
      total_usd: Number(orderData.totalUsd || orderData.total_usd || 0),
      total_brl: Number(orderData.totalBrl || orderData.total_brl || 0),
      status: orderData.status || "pending",
    }

    console.log("Processed order data for database:", dbOrderData)

    // Create the order
    const result = await DatabaseService.createOrder(dbOrderData)

    return NextResponse.json({
      success: true,
      data: result,
      orderId: orderId,
    })
  } catch (error) {
    console.error("Erro ao salvar pedido:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
