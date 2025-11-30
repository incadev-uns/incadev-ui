import React, { useState, useEffect } from 'react';
import AdministrativeLayout from '@/process/administrative/AdministrativeLayout';
import { config } from "@/config/administrative-config";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  IconUpload,
  IconSearch,
  IconFileText,
  IconFileTypePdf,
  IconFileTypeCsv,
} from '@tabler/icons-react';
import { toast } from '@/utils/toast'; // ← IMPORTAR TOAST
import DocumentTable from './components/document-table';
import DocumentUploadModal from './components/document-upload-modal';
import DocumentDetailModal from './components/document-detail-modal';

interface Document {
  id: number;
  name: string;
  type: string;
  path: string;
  version: number;
  size?: number;
  size_formatted?: string;
  date_formatted?: string;
  created_at: string;
  updated_at: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface DocumentStats {
  total_documents: number;
  academic_count: number;
  administrative_count: number;
  legal_count: number;
  uploaded_this_month: number;
  updated_this_month: number;
}

export default function DocumentsManagement() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadDocuments();
  }, [paginationMeta.current_page, debouncedSearch]);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: paginationMeta.current_page.toString(),
        per_page: paginationMeta.per_page.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
      });

      const apiUrl = `${config.apiUrl}${config.endpoints.documents}?${params}`;
      console.log('📡 Loading documents from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Documents loaded:', data);
      
      setDocuments(data.data || []);
      setPaginationMeta({
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        per_page: data.per_page || 15,
        total: data.total || 0,
        from: data.from || 0,
        to: data.to || 0
      });
      setError(null);
    } catch (error) {
      console.error('❌ Error loading documents:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      setDocuments([]);
      toast.error('No se pudieron cargar los documentos', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const apiUrl = `${config.apiUrl}${config.endpoints.documents}/statistics`;
      console.log('📊 Loading statistics from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Statistics loaded:', data);
      setStats(data);
    } catch (error) {
      console.error('❌ Error loading statistics:', error);
      setStats({
        total_documents: 0,
        academic_count: 0,
        administrative_count: 0,
        legal_count: 0,
        uploaded_this_month: 0,
        updated_this_month: 0
      });
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const url = `${config.apiUrl}${config.endpoints.documentsDownload}/${document.id}/download`;
      window.open(url, '_blank');
      toast.success('Descarga iniciada correctamente', 'Descargando');
    } catch (error) {
      console.error('Error al descargar documento:', error);
      toast.error('No se pudo descargar el documento', 'Error');
    }
  };

  const handleDelete = async (documentId: number) => {
    if (!confirm('¿Estás seguro de eliminar este documento?')) return;

    try {
      const response = await fetch(`${config.apiUrl}${config.endpoints.documents}/${documentId}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error('Error al eliminar documento');

      loadDocuments();
      loadStatistics();
      setSelectedDocument(null);
      
      // ✅ USAR TOAST EN VEZ DE ALERT
      toast.success('El documento se eliminó correctamente', 'Eliminado');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('No se pudo eliminar el documento', 'Error');
    }
  };

  const exportCSV = () => {
    try {
      const url = `${config.apiUrl}${config.endpoints.documentsExportCsv}`;
      window.open(url, '_blank');
      toast.success('Exportación CSV iniciada', 'Descargando');
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      toast.error('No se pudo exportar el CSV', 'Error');
    }
  };

  const exportPDF = async () => {
    try {
      const url = `${config.apiUrl}${config.endpoints.documentsExportData}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);

      const data = await response.json();
      localStorage.setItem('documentsExportData', JSON.stringify(data));

      const pdfWindow = window.open('/administrativo/gestion-documentaria/export-pdf', '_blank');
      if (!pdfWindow) {
        toast.warning('Por favor, permite las ventanas emergentes', 'Bloqueado');
      }
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      toast.error('No se pudo preparar el PDF', 'Error');
    }
  };

  const handleUpdate = (document: Document) => {
    setEditingDocument(document);
    setIsUpdateModalOpen(true);
  };

  const handleUploadSuccess = () => {
    loadDocuments();
    loadStatistics();
    toast.success('Documento subido exitosamente', 'Éxito');
  };

  const handlePageChange = (newPage: number) => {
    setPaginationMeta(prev => ({ ...prev, current_page: newPage }));
  };

  return (
    <AdministrativeLayout title="Documentos Administrativos">
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* Header */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-gradient-to-br from-sky-500 to-sky-700 px-6 py-7 shadow-xl">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-100/90">Gestión Documentaria</p>
              <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Documentos Administrativos</h1>
              <p className="mt-2 max-w-xl text-sm text-slate-100/80">
                Administra documentos institucionales y control de versiones
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-slate-700"></div>
                <p className="text-sm text-muted-foreground">Cargando documentos...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                  <IconFileText className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">Error al cargar los documentos</p>
                <p className="text-xs text-red-600 dark:text-red-400 mb-4">{error}</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Verifica que el backend esté corriendo en: {config.apiUrl}
                </p>
                <Button onClick={loadDocuments} variant="outline">Reintentar</Button>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-500/10">
                        <IconFileText className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Total Documentos</p>
                        <p className="text-2xl font-bold">{stats?.total_documents || 0}</p>
                        <p className="text-xs text-muted-foreground">En el repositorio</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                        <IconFileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Subidos este mes</p>
                        <p className="text-2xl font-bold">{stats?.uploaded_this_month || 0}</p>
                        <p className="text-xs text-muted-foreground">Nuevos documentos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                        <IconFileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Actualizados</p>
                        <p className="text-2xl font-bold">{stats?.updated_this_month || 0}</p>
                        <p className="text-xs text-muted-foreground">Este mes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Por tipo</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Académico</span>
                          <span className="text-sm font-semibold">{stats?.academic_count || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Administrativo</span>
                          <span className="text-sm font-semibold">{stats?.administrative_count || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Legal</span>
                          <span className="text-sm font-semibold">{stats?.legal_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Table Card */}
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <CardTitle>Repositorio de Documentos</CardTitle>
                      <CardDescription>Busca, visualiza y gestiona documentos institucionales</CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="secondary">{paginationMeta.total} registros</Badge>
                      <Button 
                        size="sm" 
                        onClick={() => setIsUploadModalOpen(true)}
                        className="bg-slate-700 hover:bg-slate-800 text-white"
                      >
                        <IconUpload className="mr-2 h-4 w-4" />
                        Subir Documento
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Filters */}
                  <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[280px]">
                      <IconSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Buscar por nombre o tipo de documento..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={exportCSV}
                      className="gap-2"
                    >
                      <IconFileTypeCsv className="h-4 w-4" />
                      CSV
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={exportPDF}
                      className="gap-2"
                    >
                      <IconFileTypePdf className="h-4 w-4" />
                      PDF
                    </Button>
                  </div>

                  <DocumentTable
                    documents={documents}
                    loading={false}
                    onDocumentSelect={setSelectedDocument}
                    onDownload={handleDownload}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                  />

                  {/* Pagination */}
                  {documents.length > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Mostrando {paginationMeta.from}-{paginationMeta.to} de {paginationMeta.total}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(paginationMeta.current_page - 1)}
                          disabled={paginationMeta.current_page === 1}
                        >
                          Anterior
                        </Button>
                        <span className="flex items-center text-sm text-muted-foreground">
                          Página {paginationMeta.current_page} de {paginationMeta.last_page}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(paginationMeta.current_page + 1)}
                          disabled={paginationMeta.current_page === paginationMeta.last_page}
                        >
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Modals */}
        <DocumentUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={handleUploadSuccess}
        />

        <DocumentUploadModal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setEditingDocument(null);
          }}
          onSuccess={handleUploadSuccess}
          document={editingDocument}
          isUpdate={true}
        />

        <DocumentDetailModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      </div>
    </AdministrativeLayout>
  );
}