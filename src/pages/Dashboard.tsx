import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Plus, LogOut, TrendingUp, DollarSign, Box } from "lucide-react";
import { ProductTable } from "@/components/ProductTable";
import { ProductDialog } from "@/components/ProductDialog";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  nome: string;
  descricao: string | null;
  quantidade: number;
  valor_custo: number;
  valor_venda: number;
  criado_em: string;
}

const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .order("criado_em", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar produtos",
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMargin = (custo: number, venda: number) => {
    if (custo === 0) return 0;
    return ((venda - custo) / custo) * 100;
  };

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.valor_venda * p.quantidade, 0);
  const averageMargin = products.length > 0
    ? products.reduce((sum, p) => sum + calculateMargin(p.valor_custo, p.valor_venda), 0) / products.length
    : 0;

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("produtos").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Produto excluído",
        description: "O produto foi removido com sucesso.",
      });

      fetchProducts();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir produto",
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingProduct(undefined);
    fetchProducts();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Package className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gestão de Estoque</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Box className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                produtos cadastrados
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                R$ {totalValue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                em estoque
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Margem Média</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${averageMargin >= 0 ? "text-success" : "text-destructive"}`}>
                {averageMargin.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                lucro médio
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Produtos</CardTitle>
                <CardDescription>Gerencie seu estoque de produtos</CardDescription>
              </div>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Produto
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ProductTable
              products={products}
              onEdit={handleEdit}
              onDelete={handleDelete}
              calculateMargin={calculateMargin}
            />
          </CardContent>
        </Card>
      </main>

      <ProductDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        product={editingProduct}
      />
    </div>
  );
};

export default Dashboard;
