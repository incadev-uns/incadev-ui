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
import { config } from "@/config/technology-config";

interface ContactForm {
  full_name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  form_type: string;
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
    full_name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    form_type: 'general'
  });
  const [status, setStatus] = useState<{ type: '' | 'loading' | 'success' | 'error', message: string }>({
    type: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Enviando mensaje...' });

    try {
      // Preparar datos, enviando null para campos opcionales vacíos
      const dataToSend = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.company || null,
        subject: formData.subject,
        message: formData.message,
        form_type: formData.form_type
      };

      const response = await fetch(`${config.apiUrl}/developer-web/contact-forms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (data.success) {
        setStatus({
          type: 'success',
          message: data.message || '¡Gracias por contactarnos! Te responderemos pronto.'
        });
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          company: '',
          subject: '',
          message: '',
          form_type: 'general'
        });
      } else {
        setStatus({
          type: 'error',
          message: data.message || 'Error al enviar el mensaje. Por favor intenta nuevamente.'
        });
      }
    } catch (error) {
      console.error('Error sending contact form:', error);
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
                    <Label htmlFor="full_name">Nombre Completo *</Label>
                    <Input
                      id="full_name"
                      required
                      value={formData.full_name}
                      onChange={(e) => handleChange('full_name', e.target.value)}
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
                      placeholder="999 888 777"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa / Institución</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleChange('company', e.target.value)}
                      placeholder="Mi Empresa"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="form_type">Tipo de Consulta *</Label>
                    <Select
                      required
                      value={formData.form_type}
                      onValueChange={(value) => handleChange('form_type', value)}
                    >
                      <SelectTrigger id="form_type">
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Consulta General</SelectItem>
                        <SelectItem value="courses">Cursos</SelectItem>
                        <SelectItem value="support">Soporte Técnico</SelectItem>
                        <SelectItem value="partnership">Alianzas / Convenios</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
