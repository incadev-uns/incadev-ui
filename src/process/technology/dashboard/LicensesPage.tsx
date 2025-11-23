import TechnologyLayout from "@/process/technology/TechnologyLayout"
import React, {useEffect, useState} from "react";
import { ChevronUp, ChevronDown, Pencil, Trash } from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import AddLicenseForm from "./AddLicenseForm";
import {Trash2} from "lucide-react";

export default function LicensesPage(){

    const [softwareList, setSoftwareList] = useState([]);
    const [licenses, setLicenses] = useState([]);
    const [createModal, setCreateModal] = useState(false);
    async function fetchSoftware(){
      const res = await fetch("http://localhost:8000/api/infrastructure/softwares");
      const data = await res.json();
      setSoftwareList(data);
    }
  
    async function fetchLicenses(){
      const res = await fetch("http://localhost:8000/api/infrastructure/licenses");
      const data = await res.json();
      setLicenses(data);
    }

    useEffect(() => {
      fetchSoftware();
      fetchLicenses();
    }, []);
    
    <AddLicenseForm
      open={createModal}
      onClose={() => setCreateModal(false)}
      softwareList={softwareList}
      onCreate={(newLic) => setLicenses([...licenses, newLic])}/>


    const [editModal, setEditModal] = useState({
      open: false,
      license: null
    });

    const handleEdit = (license) => {
      setEditModal({ open: true, license });
    };

    const handleDelete = async (licenseId: number) => {
      try{
        await fetch(`http://localhost:8000/api/infrastructure/licenses/${licenseId}`, {
        method: "DELETE",
      });
        setLicenses(prev => prev.filter(lic => lic.id !== licenseId));
      } catch(error){
        console.error("Error eliminando la licencia:", error);
        alert("Ocurrió un error al eliminar la licencia");
      }
    }
    const handleUpdate = async (updatedLic) => {
      await fetch(`http://localhost:8000/api/infrastructure/licenses/${updatedLic.id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(updatedLic)
      });

      setLicenses(prev => prev.map(lic => 
        lic.id === updatedLic.id ? updatedLic : lic
      ));

      setEditModal({ open: false, license: null });
    };

    const handleDeleteSoftware = async (softwareId: number) => {

      const hasLicenses = licenses.some((lic) => lic.software_id === softwareId);
      if(hasLicenses){
        alert("No se puede eliminar este software porque tiene licencias asociadas");
        return;
      }

      const confirmDelete = confirm("¿Seguro que deseas eliminar este software?");
      if (!confirmDelete) return;
      try{
        await fetch(`http://localhost:8000/api/infrastructure/softwares/${softwareId}`, {
        method: "DELETE",
      });

      //no quiero que se elimine si tiene licencias asociadas
        setSoftwareList((prev) => prev.filter((soft) => soft.id !== softwareId));
      } catch(error){
        console.error("Error eliminando el software:", error);
        alert("Ocurrió un error al eliminar el software");
      }
    };

    const licensesBySoftware = softwareList.map(soft => ({
      ...soft,
      licenses: licenses.filter(lic => lic.software_id === soft.id)
    }));
      
    return (
        <TechnologyLayout title="Licencias: Infraestructura">
            <h1>Gestión de Licencias</h1>

            <section style={ {maxWidth: 900}}>

              <div className="flex-justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Licencias</h2>
                <Button onClick={() => setCreateModal(true)}>
                  Agregar licencia
                </Button>
              </div>
                <AddLicenseForm open={createModal} onClose={() => setCreateModal(false)} softwareList={softwareList} onCreate={(lic) => setLicenses([...licenses, lic])} />
                {licensesBySoftware.map(soft => (
                <SoftwareCard 
                  key = {soft.id} 
                  soft={soft} 
                  onEdit= {handleEdit}
                  onDelete={handleDelete} //borar licencia
                  onDeleteSoftware = {handleDeleteSoftware} //borrar software
                  />))}
                  {editModal.open && (
                    <EditLicenseModal
                      license = {editModal.license}
                      onClose={() => setEditModal({ open: false, license: null })}
                      onUpdate= {handleUpdate}
                      />
                    )}
            </section>
        </TechnologyLayout>    
        );
 
}
function SoftwareCard({ soft, onEdit, onDelete, onDeleteSoftware }){
  const [open, setOpen] = useState(false);
  return (
    <div style={styles.softwareCard}>
      <div
        onClick={() => setOpen(!open)}
        style={styles.softwareHeader}
      >
        <div>
        <h3 style={{ margin: 0 }}>{soft.software_name}</h3>
        <small>Versión: {soft.version}</small>
      </div>
      <Button
        onClick={() => onDeleteSoftware(soft.id)}
        className="text-red-500 hover:text-red-700"
        title="Eliminar software">
          <Trash2 size={20}/>

      </Button>
      {open ? <ChevronUp/> : <ChevronDown/>}
      </div>
     {open && (
      <div style={styles.licensesContainer}>
        {soft.licenses.length === 0 ? (
          <p style={ {opacity: 0.7}}> Sin licencias registradas</p>
        ): (
          soft.licenses.map(lic => (
            <LicenseRow 
              key = {lic.id} 
              lic={lic}
              onEdit = {onEdit}
              onDelete= {onDelete} 
            />
          ))
        )}
      </div>
    )}
    </div>
  );
}
function LicenseRow({ lic, onEdit, onDelete }){
    return (
        <div style={styles.licenseRow}>
          <div>
            <strong>{lic.key_code}</strong>
             <span style ={{ ...styles.badge, ...statusColor(lic.status)}}>
                {lic.status}
            </span> 
            <p style={ { margin: 0, opacity: 0.8 }}>
              Proveedor: {lic.provider ?? "—"}
            </p>
            <small>
              Compra: {lic.purchase_date} ° Expira{lic.expiration_date}
            </small>
          </div>
           
            <div style={ {display: "flex", gap: 10}}>
              {/* Botón Editar */}
              <button onClick={() => onEdit(lic)} style={styles.iconBtn}>
                <Pencil size = {18} />
              </button>

              <button
                onClick={() => onDelete(lic.id)}
                style={{ background: "none", border: "none", cursor: "pointer"}}
                >
                  <Trash size={18} />
              </button>
            </div>
        </div>
    );
}

function EditLicenseModal({ license, onClose, onUpdate }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    return timestamp.split("T")[0];
  };

  const [form, setForm] = useState({
        key_code: license.key_code,
        provider: license.provider,
        purchase_date: formatDate(license.purchase_date), //necesito convertirlo a fecha ya que me retorna en tipo TIMESTAMP
        expiration_date: formatDate(license.expiration_date),
        status: license.status
  });


  

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate({ ...license, ...form });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg border-gray-700 bg-gray-900">
              <CardContent className="p-6 space-y-6">
                <h2 className="text-xl font-semibold mb-2">Editar licencia</h2>

                <form className="space-y-4" onSubmit={handleSubmit}>
                   <div className="space-y-1">
                    <Label>Key</Label>
                    <Input 
                        name="key_code"
                        value={form.key_code}
                        onChange={handleChange}
                        required
                    />
                   </div>
                   <div className="space-y-1">
                    <Label>Proveedor</Label>
                    <Input 
                        name="provider"
                        value={form.provider}
                        onChange={handleChange}
                    />
                   </div>
                   <div className="space-y-1">
                    <Label>Fecha de compra</Label>
                    <Input 
                        type="date"
                        name="purchase_date"
                        value={form.purchase_date}
                        onChange={handleChange}
                        required
                    />
                   </div>

                   <div className="space-y-1">
                    <Label>Fecha de expiración</Label>
                    <Input 
                        type="date"
                        name="expiration_date"
                        value={form.expiration_date}
                        onChange={handleChange}
                        required
                    />
                   </div>
                   <div className="space-y-1">
                    <label>Estado</label>
                    <Select
                        name="status"
                        value={form.status}
                        onValueChange={(v) => setForm({ ...form, status: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="active">Activa</SelectItem>
                        <SelectItem value="assigned">Asignada</SelectItem>
                        <SelectItem value="expired">Expirada</SelectItem>
                      </SelectContent>     

                    </Select>
                   </div>
                    

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            Guardar
                        </Button>
                    </div>
                </form>
              </CardContent>
            </Card>      
          </div>
    );
}



/* -------------------- Extra styles -------------------- */

const styles = {
    softwareCard: {
        border: "1px solid #444",
        borderRadius: 8,
        marginBottom: 12,
    },
    softwareHeader: {
        padding: 12,
        display: "flex",
        justifyContent: "space-between",
        cursor: "pointer",
    },
    licensesContainer: {
        padding: 12,
        borderTop: "1px solid #333"
    },
    licenseRow: {
        padding: "10px 0",
        display: "flex",
        justifyContent: "space-between",
        borderBottom: "1px solid #333"
    },
    iconBtn: {
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#ddd"
    },
  cardTitle: {
    marginBottom: 8
  },
  badge: {
    marginTop: 8,
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    display: "inline-block",
    textTransform: "capitalize"
  },
  formRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 10
  }
};
const modalStyles = {
    backdrop: {
        position: "fixed",
        top: 0, left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000
    },
    modal: {
        background: "#1f1f1f",
        padding: 20,
        borderRadius: 10,
        width: 400,
        color: "white"
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: 12
    },
    actions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: 10,
        marginTop: 15
    },
    cancelBtn: {
        background: "#444",
        padding: "8px 12px",
        border: "none",
        color: "white",
        cursor: "pointer",
        borderRadius: 6
    },
    saveBtn: {
        background: "#007bff",
        padding: "8px 12px",
        border: "none",
        color: "white",
        cursor: "pointer",
        borderRadius: 6
    }
};

/* -------------------- Badge color by status -------------------- */
function statusColor(status) {
  switch (status) {
    case "active":
      return { background: "#0f7", color: "#000" };
    case "assigned":
      return { background: "#fc3", color: "#000" };
    case "expired":
      return { background: "#f44", color: "#fff" };
    default:
      return { background: "#999" };
  }
};