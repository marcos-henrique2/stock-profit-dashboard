import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Product {
  id: string;
  nome: string;
  descricao: string | null;
  quantidade: number;
  valor_custo: number;
  valor_venda: number;
}

interface ProductDialogProps {
  open: boolean;
  onClose: () => void;
  product?: Product;
}

export function ProductDialog({ open, onClose, product }: ProductDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    quantidade: 0,
    valor_custo: 0,
    valor_venda: 0,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        nome: product.nome,
        descricao: product.descricao || "",
        quantidade: product.quantidade,
        valor_custo: Number(product.valor_custo),
        valor_venda: Number(product.valor_venda),
      });
    } else {
      setFormData({
        nome: "",
        descricao: "",
        quantidade: 0,
        valor_custo: 0,
        valor_venda: 0,
      });
    }
  }, [product, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (product) {
        // Atualizar produto existente
        const { error } = await supabase
          .from("produtos")
          .update(formData)
          .eq("id", product.id);

        if (error) throw error;

        toast({
          title: "Produto atualizado",
          description: "As alterações foram salvas com sucesso.",
        });
      } else {
        // Criar novo produto
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error("Usuário não autenticado");
        }

        const { error } = await supabase
          .from("produtos")
          .insert([{ ...formData, user_id: user.id }]);

        if (error) throw error;

        toast({
          title: "Produto criado",
          description: "O produto foi adicionado com sucesso.",
        });
      }

      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar produto",
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          <DialogDescription>
            {product 
              ? "Atualize as informações do produto abaixo"
              : "Preencha os dados para cadastrar um novo produto"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
              disabled={loading}
              placeholder="Ex: Notebook Dell"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              disabled={loading}
              placeholder="Descreva o produto..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input
                id="quantidade"
                type="number"
                min="0"
                value={formData.quantidade}
                onChange={(e) => setFormData({ ...formData, quantidade: Number(e.target.value) })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_custo">Custo (R$) *</Label>
              <Input
                id="valor_custo"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_custo}
                onChange={(e) => setFormData({ ...formData, valor_custo: Number(e.target.value) })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_venda">Venda (R$) *</Label>
              <Input
                id="valor_venda"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_venda}
                onChange={(e) => setFormData({ ...formData, valor_venda: Number(e.target.value) })}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                product ? "Atualizar" : "Criar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
