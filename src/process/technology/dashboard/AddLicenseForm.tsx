import React, {useEffect, useState} from "react";
import { ChevronUp, ChevronDown, Pencil, Trash } from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export default function AddLicenseForm({ open, onClose, softwareList, onCreate }) {
  const licenseStatuses = [
        {value: "active", label: "Activa"},
        {value: "expired", label: "Expirada"},
        {value: "pending", label: "Pendiente de renovación"},
        {value: "deactivated", label: "Desactivada"},
  ]

  const [softList, setSoftwareList] = softwareList;
  const [showNewSoftwareForm, setShowNewSoftwareForm] = useState(false);
  const [newSoftware, setNewSoftware] = useState({
    software_name: "",
    version: "",
    type:""
  });
  const [form, setForm] = useState({
    software_id: "",
    key_code:"",
    provider:"",
    purchase_date:"",
    expiration_date:"",
    cost:"",
    status:""
  });

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    
   const res = await fetch("http://localhost:8000/api/infrastructure/licenses", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(form)
      });
    
    const newLic = await res.json();
    onCreate(newLic);

    setForm({ software_id: "",
    key_code:"",
    provider:"",
    purchase_date:"",
    expiration_date:"",
    cost:"",
    status:"",
});


    if (typeof onClose === "function") onClose();
  };
  return (
    <Card className="p-4 mb-6">
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Software */}
          <div className="md:col-span-1">
            <Label>Software</Label>
            <Select
              value={form.software_id}
              onValueChange={(value) =>{
                if (value === "new"){
                  setShowNewSoftwareForm(true);
                } else {
                  setShowNewSoftwareForm(false);
                }
               setForm({ ...form, software_id: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione software" />
              </SelectTrigger>
              <SelectContent>
                {softwareList.map((soft: { id: React.Key | null | undefined; software_name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; version: any; }) => (
                  <SelectItem key={soft.id} value={String(soft.id)}>
                    {soft.software_name} {soft.version && `(${soft.version})`}
                  </SelectItem>
                ))}
                <SelectItem
                  value= "new"
                  className="text-blue-500 font-semibold"
                >
                  Nuevo Software
                </SelectItem>
              </SelectContent>
            </Select>
            {showNewSoftwareForm && (
            <div className="mt-4 p-4 border rounded-xl bg-gray-900">
              <h3 className="font-semibold mb-2">Registrar nuevo software</h3>

              <div className="grid gap-3">
                <div>
                  <Label>Nombre</Label>
                  <input
                    className="bg-gray-800 border border-gray-700 p-2 w-full rounded"
                    value={newSoftware.software_name}
                    onChange={(e) =>
                      setNewSoftware({ ...newSoftware, software_name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Versión</Label>
                  <input
                    className="bg-gray-800 border border-gray-700 p-2 w-full rounded"
                    value={newSoftware.version}
                    onChange={(e) =>
                      setNewSoftware({ ...newSoftware, version: e.target.value })
                    }
                  />
                </div>
                <Select
                  value={newSoftware.type}
                  onValueChange={(value) => setNewSoftware({ ... newSoftware, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de software" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desktop">Desktop</SelectItem>
                      <SelectItem value="web">Web</SelectItem>
                    </SelectContent>
                </Select>
                <button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white"
                  onClick={async () => {
                    // Aquí llamas a tu API Laravel
                    const res = await fetch("http://localhost:8000/api/infrastructure/softwares", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify(newSoftware)
                      });
    

                    // Actualizar lista local
                    const data = await res.json();
                    setSoftwareList((prev: any) => [...prev, data.data]);

                    // Seleccionar el nuevo software
                    setForm({
                      ...form,
                      software_id: String(data.data.id),
                    });

                    setShowNewSoftwareForm(false);
                    setNewSoftware({ software_name: "", version: "", type:""});
                  }}
                >
                  Guardar software
                </button>
              </div>
            </div>
            )}
          </div>
          
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            {/* Clave */}
          <div>
            <Label>Clave / License Key</Label>
            <Input
              placeholder="Ej: XXXX-XXXX-XXXX"
              value={form.key_code}
              onChange={(e) =>
                setForm({ ...form, key_code: e.target.value })
              }
            />
          </div>
          {/* Proveedor */}
          <div>
            <Label>Proveedor</Label>
            <Input
              placeholder="Ej: Microsoft, Google, Salesforce"
              value={form.provider}
              onChange={(e) =>
                setForm({ ...form, provider: e.target.value })
              }
            />
          </div>

         {/* Fecha de compra */}
          <div>
            <Label>Fecha de compra</Label>
            <Input
              type="date"
              value={form.purchase_date}
              onChange={(e) =>
                setForm({ ...form, purchase_date: e.target.value })
              }
            />
          </div>
          {/* Fecha de expiración */}
          <div>
            <Label>Fecha de expiración</Label>
            <Input
              type="date"
              value={form.expiration_date}
              onChange={(e) =>
                setForm({ ...form, expiration_date: e.target.value })
              }
            />
          </div>
          {/*Costo*/}
         <div>
            <Label>Costo de licencia</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.cost}
              onChange={(e) =>
                setForm({ ...form, cost: e.target.value })
              }
            />
          </div>
        {/* Estado de licencia */} 
          <div>
            <Label>Estado de licencia</Label>
            <Select
                value={form.status}
                onValueChange={(value) => setForm({...form, status: value})}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Seleccion estado"></SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {licenseStatuses.map((st) => (
                        <SelectItem key={st.value} value={st.value}>
                            {st.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>

          {/* Botón */}
          <Button type="submit" className="w-fit">
            Registrar licencia
          </Button>
          </div>
          
        </form>
      </CardContent>
    </Card>
  );
}