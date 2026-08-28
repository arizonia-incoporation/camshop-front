export const ORDER_STATES = {
  pending: "pending",
  confirmed: "confirmed",
  assignable: "assignable",
  assigned: "assigned",
  accepted: "accepted",
  picked_up: "picked_up",
  delivered: "delivered",
  cancelled: "cancelled",
};

export const STATUS_META = {
  [ORDER_STATES.pending]: {
    label: "Pending",
    accent: "#f59e0b",
    background: "#fff7ed",
    icon: "hourglass",
    summary: "Waiting for vendor confirmation.",
  },
  [ORDER_STATES.confirmed]: {
    label: "Confirmed",
    accent: "#3b82f6",
    background: "#eff6ff",
    icon: "checkmark-circle",
    summary:
      "Order confirmed. Delivery can now be assigned or left open for claim.",
  },
  [ORDER_STATES.assignable]: {
    label: "Assignable",
    accent: "#8b5cf6",
    background: "#f5f3ff",
    icon: "person-add",
    summary: "Delivery is open for drivers to claim.",
  },
  [ORDER_STATES.assigned]: {
    label: "Assigned",
    accent: "#8b5cf6",
    background: "#f5f3ff",
    icon: "person",
    summary: "A driver has been assigned to this order.",
  },
  [ORDER_STATES.accepted]: {
    label: "Accepted",
    accent: "#10b981",
    background: "#ecfdf5",
    icon: "checkmark-circle",
    summary:
      "The driver has accepted the delivery and is preparing to collect it.",
  },
  [ORDER_STATES.picked_up]: {
    label: "Shipped",
    accent: "#14b8a6",
    background: "#ecfeff",
    icon: "bag-handle",
    summary: "The package has been picked up and is on the way.",
  },
  [ORDER_STATES.delivered]: {
    label: "Delivered",
    accent: "#22c55e",
    background: "#dcfce7",
    icon: "checkmark-done-circle",
    summary: "This order has been delivered successfully.",
  },
  [ORDER_STATES.cancelled]: {
    label: "Cancelled",
    accent: "#ef4444",
    background: "#fee2e2",
    icon: "close-circle",
    summary: "This order has been cancelled.",
  },
};

const STATUS_ALIASES = {
  pending: ORDER_STATES.pending,
  pending_confirmation: ORDER_STATES.pending,
  processing: ORDER_STATES.pending,
  awaiting_confirmation: ORDER_STATES.pending,
  waiting_for_confirmation: ORDER_STATES.pending,

  confirmed: ORDER_STATES.confirmed,
  confirmed_open: ORDER_STATES.assignable,
  assignable: ORDER_STATES.assignable,
  open_pool: ORDER_STATES.assignable,
  available_for_claim: ORDER_STATES.assignable,

  assigned: ORDER_STATES.assigned,
  confirmed_assigned: ORDER_STATES.assigned,
  assigned_to_driver: ORDER_STATES.assigned,

  accepted: ORDER_STATES.accepted,
  accepted_by_driver: ORDER_STATES.accepted,
  driver_accepted: ORDER_STATES.accepted,
  claimed: ORDER_STATES.accepted,

  picked_up: ORDER_STATES.picked_up,
  pickup_started: ORDER_STATES.picked_up,
  collected: ORDER_STATES.picked_up,

  in_transit: ORDER_STATES.picked_up,
  on_the_way: ORDER_STATES.picked_up,
  shipped: ORDER_STATES.picked_up,

  delivered: ORDER_STATES.delivered,
  completed: ORDER_STATES.delivered,

  cancelled: ORDER_STATES.cancelled,
  canceled: ORDER_STATES.cancelled,
  rejected: ORDER_STATES.cancelled,
};

export const normalizeOrderStatus = (value) => {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "_");

  if (!raw) return ORDER_STATES.pending;
  if (STATUS_ALIASES[raw]) return STATUS_ALIASES[raw];

  if (raw.includes("pending")) return ORDER_STATES.pending;
  if (raw.includes("confirm")) return ORDER_STATES.confirmed;
  if (
    raw.includes("open") ||
    raw.includes("claim") ||
    raw.includes("assignable")
  )
    return ORDER_STATES.assignable;
  if (raw.includes("assign") || raw.includes("driver"))
    return ORDER_STATES.assigned;
  if (raw.includes("accept")) return ORDER_STATES.accepted;
  if (raw.includes("pick") || raw.includes("collect"))
    return ORDER_STATES.picked_up;
  if (raw.includes("transit") || raw.includes("ship") || raw.includes("travel"))
    return ORDER_STATES.picked_up;
  if (raw.includes("deliver") || raw.includes("done"))
    return ORDER_STATES.delivered;
  if (raw.includes("cancel") || raw.includes("reject"))
    return ORDER_STATES.cancelled;

  return ORDER_STATES.pending;
};

export const getOrderProgress = (status) => {
  const normalized = normalizeOrderStatus(status);

  const progressMap = {
    [ORDER_STATES.pending]: [
      "Order placed",
      "Waiting for vendor confirmation",
      "Delivery setup",
      "Picked up",
      "Delivered",
    ],
    [ORDER_STATES.confirmed]: [
      "Order placed",
      "Vendor confirmed",
      "Delivery assigned or opened",
      "Driver accepted",
      "Delivered",
    ],
    [ORDER_STATES.assignable]: [
      "Order placed",
      "Vendor confirmed",
      "Open for claim",
      "Driver accepted",
      "Delivered",
    ],
    [ORDER_STATES.assigned]: [
      "Order placed",
      "Vendor confirmed",
      "Driver assigned",
      "Driver accepted",
      "Delivered",
    ],
    [ORDER_STATES.accepted]: [
      "Order placed",
      "Vendor confirmed",
      "Driver accepted",
      "Picked up",
      "Delivered",
    ],
    [ORDER_STATES.picked_up]: [
      "Order placed",
      "Vendor confirmed",
      "Driver accepted",
      "Picked up",
      "Delivered",
    ],
    [ORDER_STATES.delivered]: [
      "Order placed",
      "Vendor confirmed",
      "Driver accepted",
      "Delivered",
      "Completed",
    ],
    [ORDER_STATES.cancelled]: [
      "Order placed",
      "Cancelled",
      "Closed",
      "Done",
      "Finished",
    ],
  };

  return progressMap[normalized] || progressMap[ORDER_STATES.pending];
};

export const normalizeOrderShape = (order = {}) => {
  const product = order.product || {};
  const nestedOrder = order.order || {};
  const deliveryAgent = order.deliveries || {};

  return {
    ...order,
    id: order.id || order._id || "unknown",
    status: normalizeOrderStatus(order.status || order.deliveryStatus),
    amount: Number(order.amount ?? order.total ?? 0),
    quantity: Number(order.quantity ?? order.items?.length ?? 0),
    product: {
      ...product,
      name: product.name || nestedOrder.productName || "Order item",
      image: product.image || nestedOrder.image || "",
      price: Number(product.price ?? nestedOrder.price ?? 0),
    },
    order: {
      ...nestedOrder,
      location: nestedOrder.location || order.destination || "Not specified",
      note: nestedOrder.note || order.note || "",
    },
    deliveryMode:
      order.delivery_mode || order.deliveryMode || order.delivery || "",
    deliveryDriverId:
      deliveryAgent?.transporterId ||
      order.delivery_agent_id ||
      order.deliveryAgentId ||
      order.deliveryAgent?._id ||
      null,
    deliveryDriverName:
      order.deliveryAgent?.name ||
      deliveryAgent?.transporter?.name ||
      order.deliveryGuyName ||
      order.delivery_driver_name ||
      "",
  };
};

export const buildOrderCapabilities = (order, role, transporterId) => {
  const normalized = normalizeOrderShape(order);
  const status = normalized.status;
  const transporter = String(transporterId ?? "");
  const assignedTotransporter =
    transporter && String(normalized.deliveryDriverId || "") === transporter;

  const canCancelUser =
    role === "user" &&
    [
      ORDER_STATES.pending,
      ORDER_STATES.confirmed,
      ORDER_STATES.assignable,
      ORDER_STATES.assigned,
      ORDER_STATES.accepted,
    ].includes(status);

  const canCancelVendor =
    role === "vendor" &&
    [
      ORDER_STATES.pending,
      ORDER_STATES.confirmed,
      ORDER_STATES.assignable,
      ORDER_STATES.assigned,
      ORDER_STATES.accepted,
    ].includes(status);

  const canCancel = canCancelUser || canCancelVendor;

  const canConfirm =
    role === "vendor" &&
    [ORDER_STATES.pending, ORDER_STATES.confirmed].includes(status);
  const canClaim =
    role === "transporter" &&
    status === ORDER_STATES.assignable &&
    !normalized.deliveryDriverId;
  const canAcceptAssignment =
    role === "transporter" &&
    status === ORDER_STATES.assigned &&
    assignedTotransporter;
  const canRejectAssignment =
    role === "transporter" &&
    status === ORDER_STATES.assigned &&
    assignedTotransporter;
  const canPickUp =
    role === "transporter" &&
    status === ORDER_STATES.accepted &&
    assignedTotransporter;
  const canVendorPickUp = role === "vendor" && status === ORDER_STATES.accepted;
  const canDeliver =
    role === "transporter" &&
    status === ORDER_STATES.picked_up &&
    assignedTotransporter;
  const canReview = role === "user" && status === ORDER_STATES.delivered;

  const buttons = [];

  if (canCancel) {
    buttons.push({ id: "cancel", label: "Cancel", kind: "danger" });
  }

  if (canConfirm) {
    buttons.push({
      id: "confirm",
      label: status === ORDER_STATES.confirmed ? "Assign Delivery Guy" : "Confirm",
      kind: "primary",
    });
  }

  if (canClaim) {
    buttons.push({ id: "claim", label: "Claim Delivery", kind: "primary" });
  }

  if (canAcceptAssignment) {
    buttons.push({ id: "accept", label: "Accept Offer", kind: "primary" });
  }

  if (canRejectAssignment) {
    buttons.push({ id: "reject", label: "Reject", kind: "secondary" });
  }

  if (canPickUp) {
    buttons.push({ id: "pick_up", label: "Pick Up", kind: "primary" });
  }

  if (canVendorPickUp) {
    buttons.push({ id: "vendor_pick_up", label: "Pick Up", kind: "primary" });
  }

  if (canDeliver) {
    buttons.push({ id: "deliver", label: "Deliver", kind: "primary" });
  }

  if (canReview) {
    buttons.push({ id: "review", label: "Review", kind: "primary" });
  }

  const actions = buttons.slice(0, 2);

  return {
    status,
    normalized,
    canCancel,
    canConfirm,
    canClaim,
    canAcceptAssignment,
    canRejectAssignment,
    canPickUp,
    canVendorPickUp,
    canDeliver,
    canReview,
    actions,
    statusSummary: STATUS_META[status]?.summary || "Order is being processed.",
    progress: getOrderProgress(status),
    meta: STATUS_META[status] || STATUS_META[ORDER_STATES.pending],
  };
};
