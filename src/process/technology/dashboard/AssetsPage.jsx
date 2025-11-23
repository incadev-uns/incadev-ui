import React, { useState, useEffect } from "react";
import {Card, CardContent} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import TechnologyLayout from "@/process/technology/TechnologyLayout"
import { Button } from "@/components/ui/button";



export default function AssetsPage() {

    const [assets, setAssets] = useState([]);
    const [filterType, setFilterType] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [assignedLicenses, setAssignedLicenses] = useState([]);
    
    async function fetchAssets(){
      try{
        const res = await fetch("http://localhost:8000/api/infrastructure/assets");
        const data = await res.json();
        setAssets(data);
      
      } catch(e){
        console.error("Error cargando activos tecnológicos: ", e);
      }

    }

    async function fetchAssignedLicenses(assetId){
      const res = await fetch(`http://localhost:8000/api/infrastructure/assignments`);
      const data = await res.json();

      const filtered = data.data.filter((item) => item.asset_id === assetId);
      setAssignedLicenses(filtered);
    }

    const handleViewDetails= (asset) => {
      setSelectedAsset(asset);
      fetchAssignedLicenses(asset.id);
    };
    const filteredAssets = assets.filter((asset) => {
      const typeMatch = filterType ? asset.type.toLowerCase() === filterType : true;
      const statusMatch = filterStatus ? asset.status === filterStatus : true;
      return typeMatch && statusMatch;
    });
    useEffect(() => {
      fetchAssets();
    }, []);


  return (
      <TechnologyLayout breadcrumbs={[{ label: "Chatbot" }]}>
        <div className="flex gap-4 mb-6">
          <select
            className="bg-gray-900 border border-gray-700 rounded-xl p-2"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value={""}>Todos</option>
            <option value="desktop">Desktop</option>
            <option value="laptop">Laptop</option>
            <option value="server">Server</option>
          </select>
          <select
            className="bg-gray-900 border border-gray-700 rounded-xl p-2"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value={""}>Todos</option>
            <option value="in_use">Activo</option>
            <option value="in_storage">Storage</option>
            <option value="in_repair">En reparación</option>
            <option value="disposed">Disposed</option>
            <option value="lost">Pérdida</option>
          </select>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => (
          <Card key={asset.id} className="rounded-2xl shadow-md hover:shadow-lg transition">
          <CardContent className="p-5 space-y-4">
          <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{asset.name}</h2>
          <Badge>{asset.status}</Badge>
          </div>


          <div className="space-y-1 text-sm text-gray-300">
          <p><span className="font-semibold">Tipo:</span> {asset.type}</p>
          <p><span className="font-semibold">Fecha adquisición:</span> {asset.acquisition_date}</p>
          </div>
          <Button
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            onClick={() => handleViewDetails(asset)}
          >
            Ver detalle
          </Button>

         
          </CardContent>
          </Card>
          ))}

        {selectedAsset && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-gray-900 p-6 rounded-2x1 w-11/12 md:w-2/3 lg:w-1/2 overflow-y-auto max-h-[80vh]">
              <h2 className="text-2x1 font-bold mb-4">{selectedAsset.name} - Detalle</h2>

              <h3 className="font-semibold mb-2">Hardware</h3>
              <p><span className="font-semibold">Modelo:</span> {selectedAsset.hardware.model}</p>
              <p><span className="font-semibold">Serie:</span> {selectedAsset.hardware.serial_number}</p>
              <p><span className="font-semibold">Garantía:</span> {selectedAsset.hardware.warranty_expiration}</p>
              <p><span className="font-semibold">Especificaciones:</span> {selectedAsset.hardware.specs}</p>
              <h3 className="font-semibold mt-4 mb-2">Licencias asignadas</h3>
              {assignedLicenses.length > 0 ?(
                <ul className="list-disc ml-5">
                  {assignedLicenses.map( (item) => (
                    <li key={item.id}>
                      {item.license.software.software_name} - Expira: {item.license.expiration_date}
                    </li>
                  ))}
                </ul>
              ): (
                <p> No hay licencias registradas</p>
              )}

          <Button
            className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            onClick={() => setSelectedAsset(null)}
          >
            Cerrar
          </Button>
            </div>
          </div>
        
        )}
        </div>
      </TechnologyLayout>
      );
}

function AssetForm({ onAdd }) {
  const [tag, setTag] = useState("");
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [serial, setSerial] = useState("");
  const [status, setStatus] = useState("in_service");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tag.trim() || !name.trim()) {
      alert("Tag y Nombre son obligatorios");
      return;
    }
    onAdd({
      tag: tag.trim(),
      name: name.trim(),
      model: model.trim(),
      serial: serial.trim(),
      status
    });
    setTag(""); setName(""); setModel(""); setSerial(""); setStatus("in_service");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input value={tag} onChange={e => setTag(e.target.value)} placeholder="Tag / Código" required />
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del activo" required />
        <input value={model} onChange={e => setModel(e.target.value)} placeholder="Modelo" />
        <input value={serial} onChange={e => setSerial(e.target.value)} placeholder="Serial" />
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="in_service">in_service</option>
          <option value="out_of_service">out_of_service</option>
          <option value="maintenance">maintenance</option>
        </select>
        <button type="submit">Agregar</button>
      </div>
    </form>
  );
}
