import { LeadData, AgencySiteConfig } from './types';

interface EmailTemplateParams {
  lead: LeadData;
  agencyConfig: AgencySiteConfig;
  confirmUrl: string;
  meetingLink: string;
}

/**
 * Generates responsive, high-converting HTML email with Infinity Impact Agency's official styling
 * (Dark slate luxury background, glowing cyan and emerald gradients, clean data card, and prominent confirmation button)
 */
export function generateClientConfirmationEmailHtml({
  lead,
  agencyConfig,
  confirmUrl,
  meetingLink,
}: EmailTemplateParams): string {
  const cleanPhone = lead.phone ? lead.phone.replace(/[^0-9]/g, '') : '';
  const waSupportLink = `https://wa.me/${agencyConfig.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hola ${agencyConfig.agencyName}, tengo una consulta sobre mi cita agendada para el ${lead.date} a las ${lead.timeSlot} hrs.`
  )}`;

  // Construct Google Calendar 1-click add link
  let gCalUrl = 'https://calendar.google.com';
  try {
    const startIso = `${lead.date}T${lead.timeSlot}:00`;
    const startDate = new Date(startIso);
    const durationMin = agencyConfig.hoursConfig.slotDurationMinutes || 45;
    const endDate = new Date(startDate.getTime() + durationMin * 60000);
    const formatGDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dates = `${formatGDate(startDate)}/${formatGDate(endDate)}`;
    const title = `Llamada Estratégica IA: ${lead.name} & ${agencyConfig.agencyName}`;
    const details = `Sesión Estratégica con ${agencyConfig.agencyName}.\nServicio: ${lead.serviceInterest || 'Consultoría IA'}\nSala Google Meet: ${meetingLink}\n\nAgendado y respaldado por Infinity Impact Agency.`;
    gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(meetingLink)}&add=${encodeURIComponent('infinityimpactagency@gmail.com')}&ctz=America/Bogota`;
  } catch (e) {
    console.error(e);
  }

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Cita - ${agencyConfig.agencyName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #07090e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #f1f5f9;">
  
  <!-- Outer Wrapper Table -->
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #07090e; padding: 32px 12px;">
    <tr>
      <td align="center">
        
        <!-- Email Container Card (max-width 620px) -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #0c1018; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          
          <!-- Top Gradient Accent Bar -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #06b6d4 0%, #10b981 50%, #8b5cf6 100%);"></td>
          </tr>

          <!-- Header with Logo and Title -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: center;">
              
              <!-- Infinity Dual Ring Logo Badge -->
              <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto 18px auto;">
                <tr>
                  <td style="background-color: #111726; border: 1px solid #06b6d4; border-radius: 14px; padding: 10px 18px; text-align: center;">
                    <span style="font-size: 24px; font-weight: 900; color: #06b6d4; letter-spacing: 2px;">∞</span>
                    <span style="font-size: 15px; font-weight: 800; color: #ffffff; margin-left: 8px; letter-spacing: 1.5px; text-transform: uppercase;">INFINITY IMPACT</span>
                  </td>
                </tr>
              </table>

              <div style="display: inline-block; padding: 4px 14px; background-color: rgba(6, 182, 212, 0.12); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 50px; font-size: 11px; font-weight: 700; color: #06b6d4; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 12px;">
                ⚡ SESIÓN ESTRATÉGICA 1 A 1
              </div>

              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; line-height: 1.25;">
                ¡Tu cita ha sido agendada con éxito!
              </h1>
              
              <p style="margin: 12px 0 0 0; font-size: 14px; color: #94a3b8; line-height: 1.5;">
                Hola <strong style="color: #ffffff;">${lead.name}</strong>, hemos reservado tu sesión exclusiva en nuestro calendario para analizar cómo la Inteligencia Artificial puede impulsar tus ventas y optimizar tu negocio.
              </p>
            </td>
          </tr>

          <!-- CRITICAL ACTION: Prominent Confirmation Button Banner -->
          <tr>
            <td style="padding: 0 36px 28px 36px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(180deg, rgba(6, 182, 212, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 16px; padding: 24px; text-align: center;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 1px;">
                      Paso Final Obligatorio
                    </p>
                    <p style="margin: 0 0 18px 0; font-size: 15px; color: #e2e8f0; font-weight: 600;">
                      Por favor confirma tu asistencia haciendo clic en el botón a continuación:
                    </p>

                    <!-- Large Confirmation Button -->
                    <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto;">
                      <tr>
                        <td align="center" style="border-radius: 50px; background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%); box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35);">
                          <a href="${confirmUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; font-size: 15px; font-weight: 800; color: #07090e; text-decoration: none; border-radius: 50px; letter-spacing: 0.5px; text-transform: uppercase; font-family: inherit;">
                            ✅ CONFIRMAR MI CITA AHORA
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 14px 0 6px 0; font-size: 12px; color: #a7f3d0; font-weight: 600;">
                      📅 Al hacer clic, la cita se agendará automáticamente en el Google Calendar de la agencia.
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #64748b;">
                      Tu espacio quedará 100% blindado y garantizado en la agenda del equipo directivo.
                    </p>

                    <!-- Direct Add to Google Calendar Link for Client -->
                    <div style="margin-top: 14px; pt-2;">
                      <a href="${gCalUrl}" target="_blank" style="display: inline-block; padding: 7px 16px; font-size: 11px; font-weight: 600; color: #38bdf8; text-decoration: none; border-radius: 20px; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.3);">
                        📅 Añadir a mi Google Calendar personal
                      </a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Booking Details Card -->
          <tr>
            <td style="padding: 0 36px 28px 36px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #121824; border: 1px solid #1e293b; border-radius: 14px; padding: 20px;">
                <tr>
                  <td style="border-bottom: 1px solid #1e293b; padding-bottom: 14px;">
                    <span style="font-size: 11px; font-weight: 700; color: #06b6d4; text-transform: uppercase; letter-spacing: 1px;">
                      📋 DATOS REGISTRADOS DE LA SESIÓN
                    </span>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding-top: 14px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="6">
                      <tr>
                        <td width="36%" style="font-size: 13px; color: #94a3b8;">📅 <strong>Fecha:</strong></td>
                        <td style="font-size: 14px; color: #ffffff; font-weight: 700;">${lead.date}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #94a3b8;">⏰ <strong>Horario:</strong></td>
                        <td style="font-size: 14px; color: #10b981; font-weight: 700;">${lead.timeSlot} hrs <span style="font-size: 11px; color: #64748b; font-weight: normal;">(Duración: 45 min)</span></td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #94a3b8;">👤 <strong>Nombre:</strong></td>
                        <td style="font-size: 13px; color: #ffffff;">${lead.name}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #94a3b8;">🏢 <strong>Empresa:</strong></td>
                        <td style="font-size: 13px; color: #ffffff;">${lead.businessName || 'No indicada'} <span style="color: #64748b;">(${lead.businessCategory || 'Negocio'})</span></td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #94a3b8;">📱 <strong>WhatsApp:</strong></td>
                        <td style="font-size: 13px; color: #ffffff;">${lead.phone}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #94a3b8;">🚀 <strong>Plan / Servicio:</strong></td>
                        <td style="font-size: 13px; color: #06b6d4; font-weight: 600;">${lead.serviceInterest || 'INFINITY GROWTH'}</td>
                      </tr>
                      ${
                        lead.notes
                          ? `
                      <tr>
                        <td style="font-size: 13px; color: #94a3b8; vertical-align: top;">📝 <strong>Objetivo / Reto:</strong></td>
                        <td style="font-size: 12px; color: #cbd5e1; font-style: italic;">"${lead.notes}"</td>
                      </tr>`
                          : ''
                      }
                    </table>
                  </td>
                </tr>

                <!-- Google Meet Join Button inside card -->
                <tr>
                  <td style="padding-top: 18px; border-top: 1px dashed #1e293b; text-align: center;">
                    <a href="${meetingLink}" target="_blank" style="display: inline-block; background-color: #1e293b; border: 1px solid #334155; color: #ffffff; text-decoration: none; padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 600;">
                      📹 Sala de Google Meet: <span style="color: #06b6d4;">Entrar a la videollamada</span>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Call Agenda Details -->
          <tr>
            <td style="padding: 0 36px 28px 36px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0a0e17; border: 1px solid #172033; border-radius: 12px; padding: 18px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.8px;">
                      💡 ¿Qué lograremos en esta sesión de 45 minutos?
                    </p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #94a3b8; line-height: 1.6;">
                      <li style="margin-bottom: 6px;"><strong style="color: #e2e8f0;">Auditoría personalizada:</strong> Evaluamos tus canales actuales de captación, tiempos de respuesta y embudo de conversión.</li>
                      <li style="margin-bottom: 6px;"><strong style="color: #e2e8f0;">Demostración de IA:</strong> Te mostramos agentes automatizados funcionando en tiempo real para agendar clientes 24/7.</li>
                      <li><strong style="color: #e2e8f0;">Plan de Acción Inmediato:</strong> Estrategia clara y números proyectados para escalar tu facturación sin contratar más personal.</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contact & Reprogramming Section -->
          <tr>
            <td style="padding: 0 36px 36px 36px; text-align: center;">
              <p style="margin: 0 0 14px 0; font-size: 13px; color: #94a3b8;">
                ¿Necesitas reprogramar o tienes alguna consulta previa?
              </p>
              
              <a href="${waSupportLink}" target="_blank" style="display: inline-block; background-color: #10b981; color: #07090e; text-decoration: none; padding: 10px 22px; border-radius: 8px; font-size: 13px; font-weight: 700;">
                💬 Chatear por WhatsApp Oficial (${agencyConfig.whatsappNumber})
              </a>

              <p style="margin: 16px 0 0 0; font-size: 12px; color: #64748b;">
                O responde directamente a este correo: <a href="mailto:${agencyConfig.contactEmail}" style="color: #06b6d4; text-decoration: none;">${agencyConfig.contactEmail}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #080c14; border-top: 1px solid #1e293b; padding: 24px 36px; text-align: center;">
              <p style="margin: 0; font-size: 12px; font-weight: 700; color: #cbd5e1;">
                ${agencyConfig.agencyName}
              </p>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">
                Automatización e Inteligencia Artificial para Negocios de Alto Rendimiento
              </p>
              <p style="margin: 8px 0 0 0; font-size: 10px; color: #475569;">
                Horario de atención: ${agencyConfig.supportHoursText} • © 2026 Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
        
      </td>
    </tr>
  </table>

</body>
</html>
  `;
}

/**
 * Generates notification HTML email for the agency admin
 */
export function generateAdminNotificationEmailHtml({
  lead,
  agencyConfig,
  confirmUrl,
  adminUrl,
}: EmailTemplateParams & { adminUrl: string }): string {
  const cleanPhone = lead.phone ? lead.phone.replace(/[^0-9]/g, '') : '';
  const waClientLink = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Hola ${lead.name}, te contacto desde ${agencyConfig.agencyName} respecto a tu llamada agendada para el ${lead.date} a las ${lead.timeSlot} hrs.`
      )}`
    : '#';

  const meetingLink = agencyConfig.notifications.customMeetingLink || 'https://meet.google.com/inf-agen-impact';
  let gCalAgencyUrl = 'https://calendar.google.com';
  try {
    const startIso = `${lead.date}T${lead.timeSlot}:00`;
    const startDate = new Date(startIso);
    const durationMin = agencyConfig.hoursConfig.slotDurationMinutes || 45;
    const endDate = new Date(startDate.getTime() + durationMin * 60000);
    const formatGDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dates = `${formatGDate(startDate)}/${formatGDate(endDate)}`;
    const title = `Llamada Estratégica IA: ${lead.name} (${lead.businessName || 'Empresa'}) - Infinity Impact`;
    const details = `Sesión Estratégica con ${lead.name}.\nEmpresa: ${lead.businessName || ''}\nWhatsApp: ${lead.phone}\nEmail: ${lead.email}\nServicio: ${lead.serviceInterest || 'Consultoría IA'}\nSala Google Meet: ${meetingLink}\n\nAgendada en Infinity Impact Agency.`;
    gCalAgencyUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(meetingLink)}&add=${encodeURIComponent('infinityimpactagency@gmail.com')}&src=${encodeURIComponent('infinityimpactagency@gmail.com')}&ctz=America/Bogota`;
  } catch (e) {
    console.error(e);
  }

  const gCalEmbedUrl = agencyConfig.notifications.googleCalendarEmbedUrl || 'https://calendar.google.com/calendar/embed?src=infinityimpactagency%40gmail.com&ctz=America%2FBogota';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Nueva Cita Agendada - ${agencyConfig.agencyName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #07090e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f1f5f9;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #07090e; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0c1018; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden;">
          
          <tr>
            <td style="height: 5px; background: linear-gradient(90deg, #10b981 0%, #06b6d4 100%);"></td>
          </tr>

          <tr>
            <td style="padding: 28px 30px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h2 style="margin: 0; font-size: 20px; color: #ffffff;">🔔 ¡Nueva Cita Agendada en la Web!</h2>
              </div>

              <p style="font-size: 14px; color: #94a3b8; margin: 0 0 20px 0;">
                Un prospecto ha completado el formulario de reserva en la página de <strong style="color: #ffffff;">${agencyConfig.agencyName}</strong>:
              </p>

              <table width="100%" border="0" cellspacing="0" cellpadding="8" style="background-color: #121824; border: 1px solid #1e293b; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td width="35%" style="color: #94a3b8; font-size: 13px;">👤 <strong>Nombre:</strong></td>
                  <td style="color: #ffffff; font-size: 14px; font-weight: bold;">${lead.name}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; font-size: 13px;">🏢 <strong>Empresa:</strong></td>
                  <td style="color: #ffffff; font-size: 13px;">${lead.businessName || 'No indicada'} (${lead.businessCategory || 'General'})</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; font-size: 13px;">📱 <strong>WhatsApp:</strong></td>
                  <td style="color: #10b981; font-size: 14px; font-weight: bold;">${lead.phone}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; font-size: 13px;">✉️ <strong>Email:</strong></td>
                  <td style="color: #06b6d4; font-size: 13px;">${lead.email}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; font-size: 13px;">📅 <strong>Fecha Solicitada:</strong></td>
                  <td style="color: #ffffff; font-size: 14px; font-weight: bold;">${lead.date}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; font-size: 13px;">⏰ <strong>Hora (Bogotá):</strong></td>
                  <td style="color: #ffffff; font-size: 14px; font-weight: bold;">${lead.timeSlot} hrs (GMT-5)</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; font-size: 13px;">🚀 <strong>Plan Solicitado:</strong></td>
                  <td style="color: #06b6d4; font-size: 13px; font-weight: 600;">${lead.serviceInterest || 'INFINITY GROWTH'}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; font-size: 13px;">📹 <strong>Sala Google Meet:</strong></td>
                  <td style="color: #a7f3d0; font-size: 13px; font-weight: 600;"><a href="${meetingLink}" target="_blank" style="color: #38bdf8; text-decoration: underline;">${meetingLink}</a></td>
                </tr>
                ${
                  lead.notes
                    ? `
                <tr>
                  <td style="color: #94a3b8; font-size: 13px; vertical-align: top;">📝 <strong>Notas:</strong></td>
                  <td style="color: #cbd5e1; font-size: 12px; font-style: italic;">"${lead.notes}"</td>
                </tr>`
                    : ''
                }
              </table>

              <!-- Google Calendar Actions for the Agency -->
              <div style="background-color: #0b1526; border: 1px solid #1e3a8a; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: bold; color: #38bdf8;">
                  📅 Sincronización Google Calendar de la Agencia
                </p>
                <div style="margin-bottom: 10px;">
                  <a href="${gCalAgencyUrl}" target="_blank" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: bold; margin: 4px;">
                    📅 Asegurar en Google Calendar (infinityimpactagency@gmail.com)
                  </a>
                  <a href="${gCalEmbedUrl}" target="_blank" style="display: inline-block; background-color: #1e293b; color: #94a3b8; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-size: 12px; border: 1px solid #334155; margin: 4px;">
                    👁️ Ver Calendario Online de la Agencia
                  </a>
                </div>
                <p style="margin: 0; font-size: 11px; color: #64748b;">
                  Zona Horaria configurada: America/Bogota (GMT-5)
                </p>
              </div>

              <!-- Quick action links for admin -->
              <div style="text-align: center; margin-bottom: 20px;">
                ${
                  cleanPhone
                    ? `<a href="${waClientLink}" target="_blank" style="display: inline-block; background-color: #10b981; color: #07090e; text-decoration: none; padding: 12px 22px; border-radius: 10px; font-size: 13px; font-weight: bold; margin: 4px;">💬 Contactar por WhatsApp</a>`
                    : ''
                }
                <a href="${adminUrl}" target="_blank" style="display: inline-block; background-color: #06b6d4; color: #07090e; text-decoration: none; padding: 12px 22px; border-radius: 10px; font-size: 13px; font-weight: bold; margin: 4px;">
                  🔐 Ver en Panel (/admind)
                </a>
              </div>

              <p style="font-size: 11px; color: #64748b; text-align: center; margin: 0;">
                Se ha enviado automáticamente el correo de confirmación al cliente con el enlace oficial de verificación.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
