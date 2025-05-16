export interface Produto {
  id: number;
  nome: string;
  codigo: string;
  quantidade_estoque: number;
  preco_atacado?: number;
  preco_venda: number; // Tornado obrigatório
  promocoes?: Promocao[];
}

export interface Cliente {
  id: number;
  nome: string;
  email: string | null;
  telefone?: string; // Adicionado para consistência com clienteInput
  endereco?: string; // Adicionado para consistência com clienteInput
}

export interface CartItem extends Omit<Produto, 'quantidade_estoque'> {
  quantidade: number; // Renomeado para diferenciar do estoque
  preco: number;
  modoPreco: "varejo" | "atacado";
  promocoes: Promocao[];
}

export interface Promocao {
  tipo: string;
  valor: number;
}

export interface clienteInput {
  nome: string;
  email: string | null;
  telefone: string;
  endereco: string;
  preferencias: Record<string, string>;
  observacoes: string;
}

// Tipos para padronização dos valores de pagamento
export type PaymentMethod = "dinheiro" | "cartao" | "transferencia" | "pix";
export type PaymentType = "avista" | "aprazo";

export interface ProdutoVendaPayload {
  produto_id: number;
  quantidade: number; // Corrigido o nome
  preco_unitario: number;
  tipo: "varejo" | "atacado";
}

export interface VendaPayload {
  cliente_id: number;
  produtos: ProdutoVendaPayload[];
  payment_method: PaymentMethod;
  payment_type: PaymentType;
  installments: number;
}