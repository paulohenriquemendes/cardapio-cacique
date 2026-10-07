export type Menu = "CAFE_DA_MANHA" | "REFEICOES";
export type OptionValue = { id: string; name: string; price: number };
export type OptionGroup = {
  id: string;
  name: string;
  min: number;
  max: number;
  values: OptionValue[];
};
export type Product = {
  id: string;
  menu: Menu;
  category: string;
  code: string | null;
  name: string;
  description: string;
  price: number;
  unit: string;
  image: string | null;
  active: boolean;
  sort_order: number;
  source_page: number;
  options: OptionGroup[];
};
export type CartItem = {
  key: string;
  productId: string;
  quantity: number;
  options: string[];
  note: string;
};
export const statuses = [
  "NOVO",
  "CONFIRMADO",
  "EM_PREPARO",
  "PRONTO",
  "FINALIZADO",
  "CANCELADO",
] as const;
export type Status = (typeof statuses)[number];
export type OrderItem = CartItem & {
  name: string;
  code: string | null;
  menu: Menu;
  unit: string;
  unitPrice: number;
  total: number;
  selected: OptionValue[];
};
export type Order = {
  sessionCode?: string;
  receivedAt?: string | null;
  session?: CustomerSession;
  version?: number;
  history?: OrderEvent[];
  customerName: string;
  trackingToken?: string;
  id: string;
  number: number;
  table: string;
  status: Status;
  created_at: string;
  total: number;
  note: string;
  items: OrderItem[];
  requestId: string;
};
export type CustomerSession = {
  token: string;
  code: string;
  table: string;
  customerName: string;
  status: "ABERTA" | "ENCERRADA" | "EXPIRADA";
  expiresAt: string;
  closedAt: string | null;
  orders: {
    number: number;
    status: Status;
    total: number;
    receivedAt: string | null;
    trackingToken: string;
  }[];
};
export type OrderEvent = {
  action: "STATUS" | "EDIT";
  from: Status;
  to: Status;
  actor: string;
  role: string;
  at: string;
  reason?: string;
  before?: {
    items: OrderItem[];
    total: number;
    note: string;
    customerName: string;
  };
};
