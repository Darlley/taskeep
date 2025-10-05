import { USER_LABELS } from "@/lib/constants";
import { useAuthStore } from "@/stores";

const usePermissions = () => {
  const { user, membership } = useAuthStore();

  const getUserRoles = (): string[] => {
    if (!user || !membership) return [];
    return membership.roles || [];
  };
  
  const hasRole = (role: string): boolean => {
    const userRoles = getUserRoles();
    return userRoles.includes(role);
  };
  
  const hasAnyRole = (roles: string[]): boolean => {
    if (roles.length === 0) return true;
    return roles.some(role => hasRole(role));
  };
  
  const isSaaSOwner = (): boolean => hasRole(USER_LABELS.SAAS_OWNER);
  const isSaaSClient = (): boolean => hasRole(USER_LABELS.SAAS_CLIENT);
  const isCompanyOwner = (): boolean => hasRole(USER_LABELS.COMPANY_OWNER);
  const isCompanyEmployee = (): boolean => hasRole(USER_LABELS.COMPANY_EMPLOYEE);
  const isCompanyClient = (): boolean => hasRole(USER_LABELS.COMPANY_CLIENT);
  
  return {
    getUserRoles,
    hasRole,
    hasAnyRole,
    isSaaSOwner,
    isSaaSClient,
    isCompanyOwner,
    isCompanyEmployee,
    isCompanyClient,
    user,
    membership
  };
};

export default usePermissions