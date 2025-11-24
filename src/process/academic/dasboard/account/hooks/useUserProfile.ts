import { useState, useEffect } from "react";
import { config } from "@/config/technology-config";
import { routes } from "@/process/academic/academic-site";
import { useAcademicAuth } from "@/process/academic/hooks/useAcademicAuth";

export interface UserData {
  id: number;
  name: string;
  fullname: string;
  email: string;
  dni: string;
  phone: string;
  avatar: string;
  role: string;
}

export const useUserProfile = () => {
  const { token, role, mounted: authMounted } = useAcademicAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  
  const [formData, setFormData] = useState<UserData>({
    id: 0,
    name: "",
    fullname: "",
    email: "",
    dni: "",
    phone: "",
    avatar: "",
    role: role || "student"
  });

  const mapApiDataToForm = (apiData: any): UserData => {
    return {
      id: apiData.id || 0,
      name: apiData.name || "",
      fullname: apiData.fullname || "",
      email: apiData.email || "",
      dni: apiData.dni || "",
      phone: apiData.phone || "",
      avatar: apiData.avatar || `${routes.base}9440461.webp`,
      role: role || "student"
    };
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        if (!token) {
          setLoading(false);
          return;
        }

        const tokenWithoutQuotes = token.replace(/^"|"$/g, '');
        
        const response = await fetch(`${config.apiUrl}${config.endpoints.auth.me}`, {
          headers: {
            "Authorization": `Bearer ${tokenWithoutQuotes}`,
            "Accept": "application/json"
          }
        });

        if (response.ok) {
          const apiData = await response.json();
          console.log("Datos del usuario desde API:", apiData);
          setUser(apiData.data.user);
          setFormData(mapApiDataToForm(apiData.data.user));
        } else {
          console.error("Error fetching profile:", await response.text());
          setMessage({
            type: 'error',
            text: "Error al cargar el perfil del usuario."
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setMessage({
          type: 'error',
          text: "Error al cargar el perfil. Por favor, recarga la página."
        });
      } finally {
        setLoading(false);
      }
    };

    if (authMounted && token) {
      fetchUserProfile();
    }
  }, [token, authMounted, role]);

  const handleChange = (field: keyof UserData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const tokenWithoutQuotes = token?.replace(/^"|"$/g, '');
      
      const response = await fetch(`${config.apiUrl}${config.endpoints.auth.profile}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${tokenWithoutQuotes}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          fullname: formData.fullname,
          email: formData.email,
          dni: formData.dni,
          phone: formData.phone,
          //avatar: formData.avatar descomentar para cuando quiera agregar una imagen de perfil
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar el perfil.");
      }

      const updatedUser = await response.json();
      setUser(updatedUser.data.user);
      setFormData(mapApiDataToForm(updatedUser.data.user));
      localStorage.setItem("user", JSON.stringify(updatedUser.data.user));

      setMessage({
        type: 'success',
        text: "¡Perfil actualizado exitosamente!"
      });
      setIsEditing(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : "Error al actualizar el perfil. Por favor, intenta nuevamente."
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData(mapApiDataToForm(user));
    }
    setIsEditing(false);
    setMessage(null);
  };

  const getRoleLabel = () => {
    const roles: Record<string, string> = {
      student: "Estudiante",
      teacher: "Docente"
    };
    return roles[role] || role;
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    
    const words = name.split(' ').filter(word => word.length > 0);
    if (words.length === 0) return "";
    
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  };

  return {
    mounted: authMounted,
    loading,
    saving,
    message,
    isEditing,
    formData,
    user,
    role: role || "student", 
    roleLabel: getRoleLabel(),
    
    setIsEditing,
    handleChange,
    handleSubmit,
    handleCancel,
    
    getRoleLabel,
    getInitials
  };
};