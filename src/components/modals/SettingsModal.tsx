import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Users, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PersonalProfileSection } from "./settings/PersonalProfileSection";
import { UserManagementSection } from "./settings/UserManagementSection";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { profile, isDirector, canAccessModule } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const canManageUsers = isDirector() || canAccessModule('user_management');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configurações
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil Pessoal
            </TabsTrigger>
            {canManageUsers && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Gestão de Usuários
              </TabsTrigger>
            )}
          </TabsList>

          <div className="mt-6 max-h-[calc(90vh-160px)] overflow-y-auto">
            <TabsContent value="profile" className="space-y-6">
              <PersonalProfileSection onClose={() => onOpenChange(false)} />
            </TabsContent>

            {canManageUsers && (
              <TabsContent value="users" className="space-y-6">
                <UserManagementSection />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}