import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Phone, Mail, Clock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  category: string;
}

const contactInfo = [
  {
    icon: MapPin,
    label: "Dirección",
    value: "Av. Universidad 123, Nuevo Chimbote"
  },
  {
    icon: Phone,
    label: "Teléfono",
    value: "+51 999 888 777"
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@incadev.edu"
  },
  {
    icon: Clock,
    label: "Horario de Atención",
    value: "Lunes a Viernes: 8am - 6pm",
    extra: "Sábados: 9am - 1pm"
  }
];

export default function ContactSection() {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: ''
  });
  const [status, setStatus] = useState<{ type: '' | 'loading' | 'success' | 'error', message: string }>({
    type: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Enviando mensaje...' });

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      setStatus({
        type: 'success',
        message: 'Tu mensaje ha sido enviado exitosamente. Te responderemos pronto.'
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        category: ''
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Error al enviar el mensaje. Por favor intenta nuevamente.'
      });
    }
  };

  const handleChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Contáctanos
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          ¿Tienes alguna pregunta? Estamos aquí para ayudarte
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Información de Contacto */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
              <CardDescription>
                Encuentra toda la información para comunicarte con nosotros
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <div key={index} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground mb-1">
                        {info.label}
                      </p>
                      <p className="text-sm text-muted-foreground">{info.value}</p>
                      {info.extra && (
                        <p className="text-sm text-muted-foreground">{info.extra}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Formulario de Contacto */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Envíanos un mensaje</CardTitle>
              <CardDescription>
                Completa el formulario y nos pondremos en contacto contigo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="juan@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+51 999 888 777"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría *</Label>
                    <Select
                      required
                      value={formData.category}
                      onValueChange={(value) => handleChange('category', value)}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Consulta General</SelectItem>
                        <SelectItem value="courses">Cursos</SelectItem>
                        <SelectItem value="support">Soporte Técnico</SelectItem>
                        <SelectItem value="tech_assets">Gestión Tecnológica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Asunto *</Label>
                  <Input
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    placeholder="Consulta sobre cursos"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje *</Label>
                  <Textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    placeholder="Escribe tu mensaje aquí..."
                  />
                </div>

                {status.message && (
                  <Alert variant={status.type === 'error' ? 'destructive' : 'default'}>
                    {status.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                    {status.type === 'error' && <AlertCircle className="h-4 w-4" />}
                    {status.type === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
                    <AlertDescription>{status.message}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={status.type === 'loading'}
                >
                  {status.type === 'loading' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Mensaje'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
