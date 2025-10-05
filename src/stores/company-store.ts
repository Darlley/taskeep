"use client";

import { useCallback, useState } from "react";

type Company = {
  id: string;
  name: string;
};

export function useCompanyStore() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);

  const fetchCompanies = useCallback(async (teamId: string) => {
    const list: Company[] = [
      { id: `${teamId}-1`, name: "Minha Empresa" },
      { id: `${teamId}-2`, name: "Outra Empresa" },
    ];
    setCompanies(list);
    setCurrentCompany(list[0]);
  }, []);

  return {
    companies,
    currentCompany,
    setCurrentCompany,
    fetchCompanies,
  };
}