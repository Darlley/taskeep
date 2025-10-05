"use client";

import PageContainer from "@/components/page-container";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores";
import { Pen } from "lucide-react";

export default function Page() {
  const { user } = useAuthStore();

  return (
    <PageContainer title="Painel" className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Gerencie sua empresa</h2>
          <p className="text-gray-500 text-sm">Controle e gerencie o site da sua empresa</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild></Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="cursor-pointer">
                Renomear empresa
                <Pen className="w-4 h-4 ml-2" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Renomeando empresa</DialogTitle>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div>infos</div>
    </PageContainer>
  );
}