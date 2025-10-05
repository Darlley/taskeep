import { databases, ID, Query } from '@/lib/appwrite';
import { APPWRITE_CONFIG } from '@/lib/constants';
import { Address } from '@/types/address.type';
import { AppwriteError } from '@/types/appwrite-error.type';
import { useEffect, useState } from 'react';

const DATABASE_ID = APPWRITE_CONFIG.CLIENT.DATABASE_ID;
const ADDRESSES_COLLECTION_ID = APPWRITE_CONFIG.CLIENT.COLLECTIONS.ADDRESSES;

export const useAddresses = ({
  userId,
  userRole
}: {
  userId: string
  userRole: 'admin' | 'collaborator' | 'client'
}) => {
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar endereços do Appwrite
  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar endereços dos userIds
      const queries = [Query.orderDesc('$createdAt')];
      
      if(userRole === 'collaborator' && userId) {
        queries.push(
          Query.equal('userId', userId),
          Query.equal('isAdminAddress', true)
        );
      }

      const { documents } = await databases.listDocuments(
        DATABASE_ID,
        ADDRESSES_COLLECTION_ID,
        queries
      );

      const formattedAddresses: Address[] = documents.map((doc: any) => ({
        id: doc.$id,
        cep: doc.cep,
        street: doc.street,
        number: doc.number,
        complement: doc.complement || '',
        neighborhood: doc.neighborhood,
        city: doc.city,
        state: doc.state,
        userId: doc.userId,
        isDefault: doc.isDefault,
        description: doc.description,
        createdAt: new Date(doc.$createdAt),
        updatedAt: new Date(doc.$updatedAt),
        isAdminAddress: doc.isAdminAddress ?? false,
      }));

      setAddresses(formattedAddresses);
    } catch (err: AppwriteError | any | unknown ) {
      if (typeof err === 'object' && err !== null && typeof err.code === 'number' && typeof err.message === 'string' && typeof err.type === 'string' && typeof err.version === 'string') {
        if (err.type === "document_already_exists") {
          setError("Este endereço já foi cadastrado");
        } else {
          setError(err.message);
        }
      } else if (err instanceof TypeError) {
        setError(err.message);
      } else {
        setError("Erro desconhecido");
      }
    
      console.error("Erro ao carregar os endereços:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const addAddress = async (address: Omit<Address, 'id' | 'createdAt' | 'updatedAt' | 'isAdminAddress'>) => {

    try {
      const { $id, $createdAt, $updatedAt } = await databases.createDocument(
        DATABASE_ID,
        ADDRESSES_COLLECTION_ID,
        ID.unique(),
        {
          cep: address.cep.replace('-', ''),
          street: address.street,
          number: Number(address.number),
          complement: address.complement || null,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          userId: userId,
          isDefault: address.isDefault,
          description: address.description,
          isAdminAddress: userRole === 'admin'
        }
      );

      const newAddress: Address = {
        id: $id,
        cep: address.cep,
        street: address.street,
        number: address.number,
        complement: address.complement || '',
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        userId: address.userId,
        isDefault: address.isDefault,
        description: address.description,
        isAdminAddress: userRole === 'admin',
        createdAt: new Date($createdAt),
        updatedAt: new Date($updatedAt),
      };

      setAddresses(prev => [newAddress, ...prev]);
    } catch (err: AppwriteError | any | unknown ) {
      console.error("Erro ao adicionar endereço:", err);
      
      if (err.type === "document_already_exists") {
        throw new Error("Este endereço já foi cadastrado.");
      } else {
        throw new Error("Erro ao adicionar endereço.");
      }
    
    } finally {
      loadAddresses()
    }
  };

  const updateAddress = async (id: string, updates: Partial<Address>) => {
    try {
      const { $updatedAt } = await databases.updateDocument(
        DATABASE_ID,
        ADDRESSES_COLLECTION_ID,
        id,
        {
          cep: updates.cep,
          street: updates.street,
          number: updates.number,
          complement: updates.complement || null,
          neighborhood: updates.neighborhood,
          city: updates.city,
          state: updates.state,
          userId: updates.userId,
          isDefault: updates.isDefault,
          description: updates.description,
        }
      );

      setAddresses(prev => prev.map(addr => 
        addr.id === id 
          ? { ...addr, ...updates, updatedAt: new Date($updatedAt) }
          : addr
      ));
    } catch (err) {
      console.error('Erro ao atualizar endereço:', err);
      setError('Erro ao atualizar endereço');
      throw err;
    } finally {
      loadAddresses()
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        ADDRESSES_COLLECTION_ID,
        id
      );

      setAddresses(prev => prev.filter(addr => addr.id !== id));
    } catch (err) {
      console.error('Erro ao excluir endereço:', err);
      setError('Erro ao excluir endereço');
      throw err;
    } finally {
      loadAddresses()
    }
  };

  const getAddress = (id: string): Address | undefined => {
    return addresses.find(addr => addr.id === id);
  };

  return {
    addresses,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    getAddress,
    refreshAddresses: loadAddresses,
  };
}; 