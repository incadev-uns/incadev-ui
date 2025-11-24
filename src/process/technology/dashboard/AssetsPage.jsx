import React, { useState, useEffect } from "react";
import {Card, CardContent} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import TechnologyLayout from "@/process/technology/TechnologyLayout"



export default function AssetsPage() {

    const [assets, setAssets] = useState([]);
    const [filterType, setFilterType] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    async function fetchAssets(){
      try{
        const res = await fetch("http://localhost:8000/api/infrastructure/assets");
        const data = await res.json();
        setAssets(data);
      
      } catch(e){
        console.error("Error cargando activos tecnológicos: ", e);
      }

    }

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


          <div className="mt-4 p-3 bg-gray-900/40 rounded-xl border border-gray-700">
          <h3 className="font-semibold mb-2 flex items-center gap-1">
          Hardware <ChevronRight size={16} />
          </h3>
          <p className="text-sm"><span className="font-semibold">Modelo:</span> {asset.hardware.model}</p>
          <p className="text-sm"><span className="font-semibold">Serie:</span> {asset.hardware.serial_number}</p>
          <p className="text-sm"><span className="font-semibold">Garantía:</span> {asset.hardware.warranty_expiration}</p>
          <p className="text-sm"><span className="font-semibold">Specs:</span> {asset.hardware.specs}</p>
          </div>
          </CardContent>
          </Card>
          ))}
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

function AssetsTable({ assets }) {
  return (
    <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          <th>ID</th><th>Tag</th><th>Nombre</th><th>Modelo</th><th>Serial</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        {assets.map(a => (
          <tr key={a.id}>
            <td>{a.id}</td>
            <td>{a.tag}</td>
            <td>{a.name}</td>
            <td>{a.model ?? ""}</td>
            <td>{a.serial ?? ""}</td>
            <td>{a.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
