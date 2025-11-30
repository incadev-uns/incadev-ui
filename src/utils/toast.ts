// src/utils/toast.tsx
import { IconCheck, IconX, IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

class ToastManager {
  private container: HTMLDivElement | null = null;

  private ensureContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  private getIcon(type: ToastType) {
    const icons = {
      success: { component: IconCheck, color: '#10b981', bg: '#d1fae5' },
      error: { component: IconX, color: '#ef4444', bg: '#fee2e2' },
      warning: { component: IconAlertTriangle, color: '#f59e0b', bg: '#fef3c7' },
      info: { component: IconInfoCircle, color: '#3b82f6', bg: '#dbeafe' }
    };
    return icons[type];
  }

  private getColors(type: ToastType) {
    const colors = {
      success: {
        bg: '#f0fdf4',
        border: '#10b981',
        text: '#065f46',
        iconBg: '#d1fae5'
      },
      error: {
        bg: '#fef2f2',
        border: '#ef4444',
        text: '#991b1b',
        iconBg: '#fee2e2'
      },
      warning: {
        bg: '#fffbeb',
        border: '#f59e0b',
        text: '#92400e',
        iconBg: '#fef3c7'
      },
      info: {
        bg: '#eff6ff',
        border: '#3b82f6',
        text: '#1e40af',
        iconBg: '#dbeafe'
      }
    };
    return colors[type];
  }

  show(options: ToastOptions) {
    const {
      title,
      message,
      type = 'info',
      duration = 4000
    } = options;

    const container = this.ensureContainer();
    const colors = this.getColors(type);
    const icon = this.getIcon(type);

    // Crear el toast
    const toast = document.createElement('div');
    toast.style.cssText = `
      pointer-events: auto;
      background: ${colors.bg};
      border: 2px solid ${colors.border};
      border-radius: 12px;
      padding: 16px;
      min-width: 320px;
      max-width: 420px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: start;
      gap: 12px;
      animation: slideInRight 0.3s ease-out;
      transition: all 0.3s ease;
    `;

    // Animación CSS
    if (!document.getElementById('toast-animations')) {
      const style = document.createElement('style');
      style.id = 'toast-animations';
      style.textContent = `
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Icono
    const iconContainer = document.createElement('div');
    iconContainer.style.cssText = `
      background: ${colors.iconBg};
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    `;
    
    // Crear SVG del icono
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", icon.color);
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");

    // Paths según tipo
    if (type === 'success') {
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", "M20 6L9 17l-5-5");
      svg.appendChild(path);
    } else if (type === 'error') {
      const path1 = document.createElementNS(svgNS, "path");
      path1.setAttribute("d", "M18 6L6 18");
      const path2 = document.createElementNS(svgNS, "path");
      path2.setAttribute("d", "M6 6l12 12");
      svg.appendChild(path1);
      svg.appendChild(path2);
    } else if (type === 'warning') {
      const path1 = document.createElementNS(svgNS, "path");
      path1.setAttribute("d", "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z");
      const path2 = document.createElementNS(svgNS, "path");
      path2.setAttribute("d", "M12 9v4");
      const path3 = document.createElementNS(svgNS, "path");
      path3.setAttribute("d", "M12 17h.01");
      svg.appendChild(path1);
      svg.appendChild(path2);
      svg.appendChild(path3);
    } else {
      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", "12");
      circle.setAttribute("cy", "12");
      circle.setAttribute("r", "10");
      const path1 = document.createElementNS(svgNS, "path");
      path1.setAttribute("d", "M12 16v-4");
      const path2 = document.createElementNS(svgNS, "path");
      path2.setAttribute("d", "M12 8h.01");
      svg.appendChild(circle);
      svg.appendChild(path1);
      svg.appendChild(path2);
    }

    iconContainer.appendChild(svg);

    // Contenido
    const content = document.createElement('div');
    content.style.cssText = `
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    `;

    if (title) {
      const titleEl = document.createElement('div');
      titleEl.textContent = title;
      titleEl.style.cssText = `
        font-weight: 700;
        font-size: 15px;
        color: ${colors.text};
        line-height: 1.4;
      `;
      content.appendChild(titleEl);
    }

    const messageEl = document.createElement('div');
    messageEl.textContent = message;
    messageEl.style.cssText = `
      font-size: 14px;
      color: ${colors.text};
      line-height: 1.5;
      opacity: 0.9;
    `;
    content.appendChild(messageEl);

    // Botón cerrar
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: ${colors.text};
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.6;
      transition: opacity 0.2s;
      flex-shrink: 0;
      line-height: 1;
      margin-top: -4px;
    `;
    closeBtn.onmouseover = () => closeBtn.style.opacity = '1';
    closeBtn.onmouseout = () => closeBtn.style.opacity = '0.6';
    closeBtn.onclick = () => this.remove(toast);

    // Ensamblar
    toast.appendChild(iconContainer);
    toast.appendChild(content);
    toast.appendChild(closeBtn);
    container.appendChild(toast);

    // Auto-cerrar
    if (duration > 0) {
      setTimeout(() => this.remove(toast), duration);
    }

    return toast;
  }

  private remove(toast: HTMLElement) {
    toast.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => {
      toast.remove();
      // Limpiar contenedor si está vacío
      if (this.container && this.container.children.length === 0) {
        this.container.remove();
        this.container = null;
      }
    }, 300);
  }

  success(message: string, title?: string) {
    return this.show({ message, title, type: 'success' });
  }

  error(message: string, title?: string) {
    return this.show({ message, title, type: 'error' });
  }

  warning(message: string, title?: string) {
    return this.show({ message, title, type: 'warning' });
  }

  info(message: string, title?: string) {
    return this.show({ message, title, type: 'info' });
  }
}

// Exportar instancia única
export const toast = new ToastManager();

// Para compatibilidad con imports nombrados
export const showToast = (options: ToastOptions) => toast.show(options);
export const successToast = (message: string, title?: string) => toast.success(message, title);
export const errorToast = (message: string, title?: string) => toast.error(message, title);
export const warningToast = (message: string, title?: string) => toast.warning(message, title);
export const infoToast = (message: string, title?: string) => toast.info(message, title);