import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Product {
  id: string;
  nome: string;
  descricao: string | null;
  quantidade: number;
  valor_custo: number;
  valor_venda: number;
}

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  calculateMargin: (custo: number, venda: number) => number;
}

export function ProductTable({ products, onEdit, onDelete, calculateMargin }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">Nenhum produto cadastrado</p>
        <p className="text-sm mt-2">Clique em "Novo Produto" para adicionar o primeiro</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Nome</TableHead>
            <TableHead className="font-semibold">Descrição</TableHead>
            <TableHead className="font-semibold text-right">Qtd</TableHead>
            <TableHead className="font-semibold text-right">Custo</TableHead>
            <TableHead className="font-semibold text-right">Venda</TableHead>
            <TableHead className="font-semibold text-right">Margem</TableHead>
            <TableHead className="font-semibold text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const margin = calculateMargin(product.valor_custo, product.valor_venda);
            const marginColor = margin >= 0 ? "text-success" : "text-destructive";

            return (
              <TableRow key={product.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">{product.nome}</TableCell>
                <TableCell className="text-muted-foreground max-w-xs truncate">
                  {product.descricao || "-"}
                </TableCell>
                <TableCell className="text-right">{product.quantidade}</TableCell>
                <TableCell className="text-right">
                  R$ {Number(product.valor_custo).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  R$ {Number(product.valor_venda).toFixed(2)}
                </TableCell>
                <TableCell className={`text-right font-semibold ${marginColor}`}>
                  {margin.toFixed(2)}%
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o produto "{product.nome}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(product.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
