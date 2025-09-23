// Create a custom hook for document expiry management
    import React from "react";
    import { addToast } from "@heroui/react";
    
    interface Document {
      id: number | string;
      title: string;
      expiryDate: string | null;
      category: string;
    }
    
    interface ExpiryCheckOptions {
      warningDays?: number;
      criticalDays?: number;
      onExpiringSoon?: (docs: Document[]) => void;
      onExpired?: (docs: Document[]) => void;
    }
    
    export const useDocumentExpiry = (documents: Document[], options: ExpiryCheckOptions = {}) => {
      const {
        warningDays = 30,
        criticalDays = 7,
        onExpiringSoon,
        onExpired
      } = options;
      
      const [expiringDocuments, setExpiringDocuments] = React.useState<Document[]>([]);
      const [expiredDocuments, setExpiredDocuments] = React.useState<Document[]>([]);
      
      React.useEffect(() => {
        if (!documents || documents.length === 0) return;
        
        const today = new Date();
        const warningDate = new Date();
        warningDate.setDate(today.getDate() + warningDays);
        
        const criticalDate = new Date();
        criticalDate.setDate(today.getDate() + criticalDays);
        
        const expiring: Document[] = [];
        const expired: Document[] = [];
        
        documents.forEach(doc => {
          if (!doc.expiryDate) return;
          
          const expiryDate = new Date(doc.expiryDate);
          
          if (expiryDate <= today) {
            expired.push(doc);
          } else if (expiryDate <= warningDate) {
            expiring.push(doc);
          }
        });
        
        setExpiringDocuments(expiring);
        setExpiredDocuments(expired);
        
        // Call callbacks if provided
        if (expiring.length > 0 && onExpiringSoon) {
          onExpiringSoon(expiring);
        }
        
        if (expired.length > 0 && onExpired) {
          onExpired(expired);
        }
        
        // Show toast notifications
        if (expiring.length > 0) {
          addToast({
            title: "Documents Expiring Soon",
            description: `${expiring.length} document(s) will expire in the next ${warningDays} days.`,
            color: "warning",
          });
        }
        
        if (expired.length > 0) {
          addToast({
            title: "Expired Documents",
            description: `${expired.length} document(s) have expired and need attention.`,
            color: "danger",
          });
        }
      }, [documents, warningDays, criticalDays, onExpiringSoon, onExpired]);
      
      const getDaysUntilExpiry = (expiryDate: string | null): number | null => {
        if (!expiryDate) return null;
        
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
      };
      
      const getExpiryStatus = (expiryDate: string | null): 'active' | 'expiring_soon' | 'expired' | 'no_expiry' => {
        if (!expiryDate) return 'no_expiry';
        
        const daysUntil = getDaysUntilExpiry(expiryDate);
        
        if (daysUntil === null) return 'no_expiry';
        if (daysUntil <= 0) return 'expired';
        if (daysUntil <= warningDays) return 'expiring_soon';
        return 'active';
      };
      
      return {
        expiringDocuments,
        expiredDocuments,
        getDaysUntilExpiry,
        getExpiryStatus
      };
    };
