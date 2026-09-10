// server.ts
import express from "express";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

// src/emailTemplates.ts
function generateClientConfirmationEmailHtml({
  lead,
  agencyConfig,
  confirmUrl,
  meetingLink
}) {
  const cleanPhone = lead.phone ? lead.phone.replace(/[^0-9]/g, "") : "";
  const waSupportLink = `https://wa.me/${agencyConfig.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Hola ${agencyConfig.agencyName}, tengo una consulta sobre mi cita agendada para el ${lead.date} a las ${lead.timeSlot} hrs.`
  )}`;
  let gCalUrl = "https://calendar.google.com";
  try {
    const startIso = `${lead.date}T${lead.timeSlot}:00`;
    const startDate = new Date(startIso);
    const durationMin = agencyConfig.hoursConfig.slotDurationMinutes || 45;
    const endDate = new Date(startDate.getTime() + durationMin * 6e4);
    const formatGDate = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const dates = `${formatGDate(startDate)}/${formatGDate(endDate)}`;
    const title = `Llamada Estrat\xE9gica IA: ${lead.name} & ${agencyConfig.agencyName}`;
    const details = `Sesi\xF3n Estrat\xE9gica con ${agencyConfig.agencyName}.
Servicio: ${lead.serviceInterest || "Consultor\xEDa IA"}
Sala Google Meet: ${meetingLink}

Agendado y respaldado por Infinity Impact Agency.`;
    gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(meetingLink)}&add=${encodeURIComponent("infinityimpactagency@gmail.com")}&ctz=America/Bogota`;
  } catch (e) {
    console.error(e);
  }
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmaci\xF3n de Cita - ${agencyConfig.agencyName}</title>
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
                    <span style="font-size: 24px; font-weight: 900; color: #06b6d4; letter-spacing: 2px;">\u221E</span>
                    <span style="font-size: 15px; font-weight: 800; color: #ffffff; margin-left: 8px; letter-spacing: 1.5px; text-transform: uppercase;">INFINITY IMPACT</span>
                  </td>
                </tr>
              </table>

              <div style="display: inline-block; padding: 4px 14px; background-color: rgba(6, 182, 212, 0.12); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 50px; font-size: 11px; font-weight: 700; color: #06b6d4; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 12px;">
                \u26A1 SESI\xD3N ESTRAT\xC9GICA 1 A 1
              </div>

              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; line-height: 1.25;">
                \xA1Tu cita ha sido agendada con \xE9xito!
              </h1>
              
              <p style="margin: 12px 0 0 0; font-size: 14px; color: #94a3b8; line-height: 1.5;">
                Hola <strong style="color: #ffffff;">${lead.name}</strong>, hemos reservado tu sesi\xF3n exclusiva en nuestro calendario para analizar c\xF3mo la Inteligencia Artificial puede impulsar tus ventas y optimizar tu negocio.
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
                      Por favor confirma tu asistencia haciendo clic en el bot\xF3n a continuaci\xF3n:
                    </p>

                    <!-- Large Confirmation Button -->
                    <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto;">
                      <tr>
                        <td align="center" style="border-radius: 50px; background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%); box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35);">
                          <a href="${confirmUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; font-size: 15px; font-weight: 800; color: #07090e; text-decoration: none; border-radius: 50px; letter-spacing: 0.5px; text-transform: uppercase; font-family: inherit;">
                            \u2705 CONFIRMAR MI CITA AHORA
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 14px 0 6px 0; font-size: 12px; color: #a7f3d0; font-weight: 600;">
                      \u{1F4C5} Al hacer clic, la cita se agendar\xE1 autom\xE1ticamente en el Google Calendar de la agencia.
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #64748b;">
                      Tu espacio quedar\xE1 100% blindado y garantizado en la agenda del equipo directivo.
                    </p>

                    <!-- Direct Add to Google Calendar Link for Client -->
                    <div style="margin-top: 14px; pt-2;">
                      <a href="${gCalUrl}" target="_blank" style="display: inline-block; padding: 7px 16px; font-size: 11px; font-weight: 600; color: #38bdf8; text-decoration: none; border-radius: 20px; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.3);">
                        \u{1F4C5} A\xF1adir a mi Google Calendar personal
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
                      \u{1F4CB} DATOS REGISTRADOS DE LA SESI\xD3N
                    </span>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding-top: 14px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="6">
                      <tr>
                        <td width="36%" style="font-size: 13px; color: #94a3b8;">\u{1F4C5} <strong>Fecha:</strong></td>
                        <td style="font-size: 14px; color: #ffffff; font-weight: 700;">${lead.date}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #94a3b8;">\u23F0 <strong>Horario:</strong></td>
                        <td style="font-size: 14px; color: #10b981; font-weight: 700;">${lead.timeSlot} hrs <span style="font-size: 11px; color: #64748b; font-weight: normal;">(Duraci\xF3n: 45 min)</span></td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #94a3b8;">\u{1F464} <strong>Nombre:</strong></td>
                        <td style="font-size: 13px; color: #ffffff;">${lead.name}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #94a3b8;">\u{1F3E2} <strong>Empresa:</strong></td>
                        <td style="font-size: 13px; color: #ffffff;">${lead.businessName || "No indicada"} <span style="color: #64748b;">(${lead.businessCategory || "Negocio"})</span></td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #94a3b8;">\u{1F4F1} <strong>WhatsApp:</strong></td>
                        <td style="font-size: 13px; color: #ffffff;">${lead.phone}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #94a3b8;">\u{1F680} <strong>Plan / Servicio:</strong></td>
                        <td style="font-size: 13px; color: #06b6d4; font-weight: 600;">${lead.serviceInterest || "INFINITY GROWTH"}</td>
                      </tr>
                      ${lead.notes ? `
                      <tr>
                        <td style="font-size: 13px; color: #94a3b8; vertical-align: top;">\u{1F4DD} <strong>Objetivo / Reto:</strong></td>
                        <td style="font-size: 12px; color: #cbd5e1; font-style: italic;">"${lead.notes}"</td>
                      </tr>` : ""}
                    </table>
                  </td>
                </tr>

                <!-- Google Meet Join Button inside card -->
                <tr>
                  <td style="padding-top: 18px; border-top: 1px dashed #1e293b; text-align: center;">
                    <a href="${meetingLink}" target="_blank" style="display: inline-block; background-color: #1e293b; border: 1px solid #334155; color: #ffffff; text-decoration: none; padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 600;">
                      \u{1F4F9} Sala de Google Meet: <span style="color: #06b6d4;">Entrar a la videollamada</span>
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
                      \u{1F4A1} \xBFQu\xE9 lograremos en esta sesi\xF3n de 45 minutos?
                    </p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #94a3b8; line-height: 1.6;">
                      <li style="margin-bottom: 6px;"><strong style="color: #e2e8f0;">Auditor\xEDa personalizada:</strong> Evaluamos tus canales actuales de captaci\xF3n, tiempos de respuesta y embudo de conversi\xF3n.</li>
                      <li style="margin-bottom: 6px;"><strong style="color: #e2e8f0;">Demostraci\xF3n de IA:</strong> Te mostramos agentes automatizados funcionando en tiempo real para agendar clientes 24/7.</li>
                      <li><strong style="color: #e2e8f0;">Plan de Acci\xF3n Inmediato:</strong> Estrategia clara y n\xFAmeros proyectados para escalar tu facturaci\xF3n sin contratar m\xE1s personal.</li>
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
                \xBFNecesitas reprogramar o tienes alguna consulta previa?
              </p>
              
              <a href="${waSupportLink}" target="_blank" style="display: inline-block; background-color: #10b981; color: #07090e; text-decoration: none; padding: 10px 22px; border-radius: 8px; font-size: 13px; font-weight: 700;">
                \u{1F4AC} Chatear por WhatsApp Oficial (${agencyConfig.whatsappNumber})
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
                Automatizaci\xF3n e Inteligencia Artificial para Negocios de Alto Rendimiento
              </p>
              <p style="margin: 8px 0 0 0; font-size: 10px; color: #475569;">
                Horario de atenci\xF3n: ${agencyConfig.supportHoursText} \u2022 \xA9 2026 Todos los derechos reservados.
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
function generateAdminNotificationEmailHtml({
  lead,
  agencyConfig,
  confirmUrl,
  adminUrl
}) {
  const cleanPhone = lead.phone ? lead.phone.replace(/[^0-9]/g, "") : "";
  const waClientLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hola ${lead.name}, te contacto desde ${agencyConfig.agencyName} respecto a tu llamada agendada para el ${lead.date} a las ${lead.timeSlot} hrs.`
  )}` : "#";
  const meetingLink = agencyConfig.notifications.customMeetingLink || "https://meet.google.com/inf-agen-impact";
  let gCalAgencyUrl = "https://calendar.google.com";
  try {
    const startIso = `${lead.date}T${lead.timeSlot}:00`;
    const startDate = new Date(startIso);
    const durationMin = agencyConfig.hoursConfig.slotDurationMinutes || 45;
    const endDate = new Date(startDate.getTime() + durationMin * 6e4);
    const formatGDate = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const dates = `${formatGDate(startDate)}/${formatGDate(endDate)}`;
    const title = `Llamada Estrat\xE9gica IA: ${lead.name} (${lead.businessName || "Empresa"}) - Infinity Impact`;
    const details = `Sesi\xF3n Estrat\xE9gica con ${lead.name}.
Empresa: ${lead.businessName || ""}
WhatsApp: ${lead.phone}
Email: ${lead.email}
Servicio: ${lead.serviceInterest || "Consultor\xEDa IA"}
Sala Google Meet: ${meetingLink}

Agendada en Infinity Impact Agency.`;
    gCalAgencyUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(meetingLink)}&add=${encodeURIComponent("infinityimpactagency@gmail.com")}&src=${encodeURIComponent("infinityimpactagency@gmail.com")}&ctz=America/Bogota`;
  } catch (e) {
    console.error(e);
  }
  const gCalEmbedUrl = agencyConfig.notifications.googleCalendarEmbedUrl || "https://calendar.google.com/calendar/embed?src=infinityimpactagency%40gmail.com&ctz=America%2FBogota";
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
                <h2 style="margin: 0; font-size: 20px; color: #ffffff;">\u{1F514} \xA1Nueva Cita Agendada en la Web!</h2>
              </div>

              <p style="font-size: 14px; color: #94a3b8; margin: 0 0 20px 0;">
                Un prospecto ha completado el formulario de reserva en la p\xE1gina de <strong style="color: #ffffff;">${agencyConfig.agencyName}</strong>:
              </p>

              <table width="100%" border="0" cellspacing="0" cellpadding="8" style="background-color: #121824; border: 1px solid #1e293b; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td width="35%" style="color: #94a3b8; font-size: 13px;">\u{1F464} <strong>Nombre:</strong></td>
                  <td style="color: #ffffff; font-size: 14px; font-weight: bold;">${lead.name}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; font-size: 13px;">\u{1F3E2} <strong>Empresa:</strong></td>
                  <td style="color: #ffffff; font-size: 13px;">${lead.businessName || "No indicada"} (${lead.businessCategory || "General"})</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; font-size: 13px;">\u{1F4F1} <strong>WhatsApp:</strong></td>
                  <td style="color: #10b981; font-size: 14px; font-weight: bold;">${lead.phone}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; font-size: 13px;">\u2709\uFE0F <strong>Email:</strong></td>
                  <td style="color: #06b6d4; font-size: 13px;">${lead.email}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; font-size: 13px;">\u{1F4C5} <strong>Fecha Solicitada:</strong></td>
                  <td style="color: #ffffff; font-size: 14px; font-weight: bold;">${lead.date}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; font-size: 13px;">\u23F0 <strong>Hora (Bogot\xE1):</strong></td>
                  <td style="color: #ffffff; font-size: 14px; font-weight: bold;">${lead.timeSlot} hrs (GMT-5)</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; font-size: 13px;">\u{1F680} <strong>Plan Solicitado:</strong></td>
                  <td style="color: #06b6d4; font-size: 13px; font-weight: 600;">${lead.serviceInterest || "INFINITY GROWTH"}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; font-size: 13px;">\u{1F4F9} <strong>Sala Google Meet:</strong></td>
                  <td style="color: #a7f3d0; font-size: 13px; font-weight: 600;"><a href="${meetingLink}" target="_blank" style="color: #38bdf8; text-decoration: underline;">${meetingLink}</a></td>
                </tr>
                ${lead.notes ? `
                <tr>
                  <td style="color: #94a3b8; font-size: 13px; vertical-align: top;">\u{1F4DD} <strong>Notas:</strong></td>
                  <td style="color: #cbd5e1; font-size: 12px; font-style: italic;">"${lead.notes}"</td>
                </tr>` : ""}
              </table>

              <!-- Google Calendar Actions for the Agency -->
              <div style="background-color: #0b1526; border: 1px solid #1e3a8a; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: bold; color: #38bdf8;">
                  \u{1F4C5} Sincronizaci\xF3n Google Calendar de la Agencia
                </p>
                <div style="margin-bottom: 10px;">
                  <a href="${gCalAgencyUrl}" target="_blank" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: bold; margin: 4px;">
                    \u{1F4C5} Asegurar en Google Calendar (infinityimpactagency@gmail.com)
                  </a>
                  <a href="${gCalEmbedUrl}" target="_blank" style="display: inline-block; background-color: #1e293b; color: #94a3b8; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-size: 12px; border: 1px solid #334155; margin: 4px;">
                    \u{1F441}\uFE0F Ver Calendario Online de la Agencia
                  </a>
                </div>
                <p style="margin: 0; font-size: 11px; color: #64748b;">
                  Zona Horaria configurada: America/Bogota (GMT-5)
                </p>
              </div>

              <!-- Quick action links for admin -->
              <div style="text-align: center; margin-bottom: 20px;">
                ${cleanPhone ? `<a href="${waClientLink}" target="_blank" style="display: inline-block; background-color: #10b981; color: #07090e; text-decoration: none; padding: 12px 22px; border-radius: 10px; font-size: 13px; font-weight: bold; margin: 4px;">\u{1F4AC} Contactar por WhatsApp</a>` : ""}
                <a href="${adminUrl}" target="_blank" style="display: inline-block; background-color: #06b6d4; color: #07090e; text-decoration: none; padding: 12px 22px; border-radius: 10px; font-size: 13px; font-weight: bold; margin: 4px;">
                  \u{1F510} Ver en Panel (/admind)
                </a>
              </div>

              <p style="font-size: 11px; color: #64748b; text-align: center; margin: 0;">
                Se ha enviado autom\xE1ticamente el correo de confirmaci\xF3n al cliente con el enlace oficial de verificaci\xF3n.
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

// src/adminDefaults.ts
var DEFAULT_AGENCY_CONFIG = {
  "agencyName": "Infinity Impact Agency",
  "headline": "Automatizamos el Crecimiento de tu Negocio con Inteligencia Artificial",
  "subheadline": "Agentes inteligentes para WhatsApp, captaci\xF3n automatizada de clientes de alto valor y p\xE1ginas web de alta conversi\xF3n.",
  "whatsappNumber": "+573106922638",
  "whatsappDefaultMessage": "\xA1Hola! Me comunico desde su sitio web y me gustar\xEDa hablar con un asesor.",
  "contactEmail": "infinityimpactagency@gmail.com",
  "supportHoursText": "Lunes a Viernes 08:00 a 16:00 hrs | S\xE1bados 10:00 a 14:00 hrs",
  "hoursConfig": {
    "days": [
      {
        "day": 1,
        "name": "Lunes",
        "active": true,
        "startTime": "09:00",
        "endTime": "19:00"
      },
      {
        "day": 2,
        "name": "Martes",
        "active": true,
        "startTime": "09:00",
        "endTime": "19:00"
      },
      {
        "day": 3,
        "name": "Mi\xE9rcoles",
        "active": true,
        "startTime": "09:00",
        "endTime": "19:00"
      },
      {
        "day": 4,
        "name": "Jueves",
        "active": true,
        "startTime": "09:00",
        "endTime": "19:00"
      },
      {
        "day": 5,
        "name": "Viernes",
        "active": true,
        "startTime": "09:00",
        "endTime": "19:00"
      },
      {
        "day": 6,
        "name": "S\xE1bado",
        "active": true,
        "startTime": "10:00",
        "endTime": "14:00"
      },
      {
        "day": 0,
        "name": "Domingo",
        "active": false,
        "startTime": "10:00",
        "endTime": "13:00"
      }
    ],
    "slotDurationMinutes": 45,
    "breakBetweenSlotsMinutes": 15,
    "minNoticeHours": 2,
    "timezone": "America/Bogota",
    "maxDailyBookings": 8,
    "blockedDates": []
  },
  "notifications": {
    "adminEmail": "infinityimpactagency@gmail.com",
    "adminPhone": "+573106922638",
    "notifyAdminOnBooking": true,
    "notifySoundEnabled": true,
    "sendClientConfirmationEmail": true,
    "emailSubjectTemplate": "Confirmaci\xF3n de Llamada Estrat\xE9gica: Infinity Impact Agency",
    "customMeetingLink": "https://meet.google.com/inf-agen-impact",
    "notifyGoogleChat": true,
    "chatSpaceName": "spaces/sales-leads-infinity",
    "googleCalendarId": "infinityimpactagency@gmail.com",
    "googleCalendarEmbedUrl": "https://calendar.google.com/calendar/embed?src=infinityimpactagency%40gmail.com&ctz=America%2FBogota"
  },
  "stats": {
    "activeClients": "17+",
    "leadsDelivered": "20,000+",
    "satisfactionRate": "98.4%",
    "hoursSaved": "2,200 hrs"
  }
};

// server.ts
dotenv.config();
var app = express();
var PORT = 3e3;
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.json());
var isVercel = Boolean(
  process.env.VERCEL || process.env.VERCEL_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME
);
var DATA_DIR = isVercel ? path.join("/tmp", "infinity_data") : path.join(process.cwd(), "data");
var LEADS_FILE = path.join(DATA_DIR, "leads.json");
var CONFIG_FILE = path.join(DATA_DIR, "agency_config.json");
var CONTENT_FILE = path.join(DATA_DIR, "content.json");
var LOGS_FILE = path.join(DATA_DIR, "notification_logs.json");
var WORKSPACE_TOKEN_FILE = path.join(DATA_DIR, "workspace_token.json");
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn("Notice: DATA_DIR creation check:", e);
}
var memoryLeads = [];
var memoryConfig = DEFAULT_AGENCY_CONFIG;
var memoryContent = null;
var memoryLogs = [];
var memoryWorkspaceToken = {
  token: null,
  email: "infinityimpactagency@gmail.com"
};
function getStoredContent() {
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      return JSON.parse(fs.readFileSync(CONTENT_FILE, "utf-8"));
    } else if (isVercel) {
      const bundled = path.join(process.cwd(), "data", "content.json");
      if (fs.existsSync(bundled)) {
        return JSON.parse(fs.readFileSync(bundled, "utf-8"));
      }
    }
  } catch (err) {
    console.error("Error reading content file:", err);
  }
  return memoryContent;
}
function saveStoredContent(content) {
  memoryContent = content;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), "utf-8");
  } catch (err) {
    console.warn("Notice: content saved to memory cache:", err);
  }
}
function getStoredWorkspaceAuth() {
  try {
    if (fs.existsSync(WORKSPACE_TOKEN_FILE)) {
      const data = JSON.parse(fs.readFileSync(WORKSPACE_TOKEN_FILE, "utf-8"));
      return {
        token: data.token || null,
        email: data.email || "infinityimpactagency@gmail.com"
      };
    } else if (isVercel) {
      const bundled = path.join(process.cwd(), "data", "workspace_token.json");
      if (fs.existsSync(bundled)) {
        const data = JSON.parse(fs.readFileSync(bundled, "utf-8"));
        return {
          token: data.token || null,
          email: data.email || "infinityimpactagency@gmail.com"
        };
      }
    }
  } catch (e) {
    console.error("Error reading workspace token file:", e);
  }
  return memoryWorkspaceToken;
}
function saveStoredWorkspaceAuth(token, email) {
  memoryWorkspaceToken = { token, email };
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(
      WORKSPACE_TOKEN_FILE,
      JSON.stringify({ token, email, updatedAt: Date.now() }, null, 2),
      "utf-8"
    );
  } catch (e) {
    console.warn("Notice: workspace auth saved to memory cache:", e);
  }
}
function getStoredLeads() {
  try {
    if (fs.existsSync(LEADS_FILE)) {
      const data = fs.readFileSync(LEADS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryLeads = parsed;
        return parsed;
      }
    } else if (isVercel) {
      const bundled = path.join(process.cwd(), "data", "leads.json");
      if (fs.existsSync(bundled)) {
        const data = fs.readFileSync(bundled, "utf-8");
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryLeads = parsed;
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error("Error reading leads file:", err);
  }
  return memoryLeads;
}
function saveStoredLeads(leads) {
  memoryLeads = leads;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
  } catch (err) {
    console.warn("Notice: leads saved to memory cache:", err);
  }
}
function getStoredConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === "object") {
        memoryConfig = { ...DEFAULT_AGENCY_CONFIG, ...parsed };
        return memoryConfig;
      }
    } else if (isVercel) {
      const bundled = path.join(process.cwd(), "data", "agency_config.json");
      if (fs.existsSync(bundled)) {
        const data = fs.readFileSync(bundled, "utf-8");
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === "object") {
          memoryConfig = { ...DEFAULT_AGENCY_CONFIG, ...parsed };
          return memoryConfig;
        }
      }
    }
  } catch (err) {
    console.error("Error reading config file:", err);
  }
  return memoryConfig;
}
function saveStoredConfig(config) {
  memoryConfig = config;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
  } catch (err) {
    console.warn("Notice: config saved to memory cache:", err);
  }
}
function logNotificationServer(item) {
  try {
    let logs = [];
    if (fs.existsSync(LOGS_FILE)) {
      logs = JSON.parse(fs.readFileSync(LOGS_FILE, "utf-8"));
    } else {
      logs = memoryLogs;
    }
    const newLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      ...item
    };
    logs.unshift(newLog);
    memoryLogs = logs.slice(0, 100);
    try {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(LOGS_FILE, JSON.stringify(memoryLogs, null, 2), "utf-8");
    } catch (e) {
    }
  } catch (e) {
    console.error("Error saving notification log:", e);
  }
}
var initialAuth = getStoredWorkspaceAuth();
var serverWorkspaceToken = initialAuth.token;
var serverWorkspaceEmail = initialAuth.email || "infinityimpactagency@gmail.com";
async function scheduleCallInGoogleCalendar(token, lead, config) {
  const meetingLink = config?.notifications?.customMeetingLink || "https://meet.google.com/inf-agen-impact";
  const durationMin = config?.hoursConfig?.slotDurationMinutes || 45;
  const startDateTime = `${lead.date}T${lead.timeSlot}:00`;
  const startDate = new Date(startDateTime);
  const endDate = new Date(startDate.getTime() + durationMin * 6e4);
  const timeZone = "America/Bogota";
  const agencyCalendarId = "infinityimpactagency@gmail.com";
  const eventPayload = {
    summary: `Llamada Estrat\xE9gica IA: ${lead.name} (${lead.businessName || "Empresa"}) - Infinity Impact`,
    description: `Sesi\xF3n Estrat\xE9gica de Crecimiento y Automatizaci\xF3n de Procesos con IA.

\u{1F464} Cliente: ${lead.name}
\u{1F3E2} Empresa: ${lead.businessName || "No indicada"}
\u{1F4BC} Rubro: ${lead.businessCategory || "General"}
\u{1F4F1} WhatsApp: ${lead.phone}
\u2709\uFE0F Email: ${lead.email}
\u{1F3AF} Servicio de Inter\xE9s: ${lead.serviceInterest || "Agentes de IA"}
\u{1F4F9} Sala Google Meet: ${meetingLink}
\u{1F4DD} Notas: ${lead.notes || "Ninguna"}

\u2705 Cita confirmada y sincronizada en Infinity Impact Agency.`,
    start: {
      dateTime: startDate.toISOString(),
      timeZone
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone
    },
    location: meetingLink,
    attendees: [
      { email: "infinityimpactagency@gmail.com", displayName: "Infinity Impact Agency", responseStatus: "accepted" },
      { email: lead.email, displayName: lead.name }
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        // 1 día antes
        { method: "popup", minutes: 15 }
        // 15 minutos antes
      ]
    }
  };
  let res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(agencyCalendarId)}/events?sendUpdates=all`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(eventPayload)
  });
  if (!res.ok && (res.status === 404 || res.status === 403)) {
    console.log(`[Google Calendar] Notice: Direct insert to ${agencyCalendarId} returned ${res.status}. Falling back to primary calendar.`);
    res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(eventPayload)
    });
  }
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Calendar API error ${res.status}: ${errText}`);
  }
  return await res.json();
}
async function sendViaGmailApi(token, to, subject, html) {
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
  const messageParts = [
    `From: "Infinity Impact Agency" <infinityimpactagency@gmail.com>`,
    `To: ${to}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${utf8Subject}`,
    "",
    html
  ];
  const message = messageParts.join("\r\n");
  const raw = Buffer.from(message).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ raw })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gmail API HTTP ${res.status}: ${errText}`);
  }
  return await res.json();
}
async function sendViaResend(apiKey, to, subject, html, options) {
  const fromName = options?.fromName || "Infinity Impact Agency";
  const fromEmail = options?.fromEmail || process.env.RESEND_FROM || "onboarding@resend.dev";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject,
      html
    })
  });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Resend HTTP ${res.status}: ${errorBody}`);
  }
  return await res.json();
}
function createMailTransporter(agencyConfig, forcePort) {
  const host = process.env.SMTP_HOST || agencyConfig?.notifications?.smtpHost || "smtp.gmail.com";
  const port = forcePort || (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : agencyConfig?.notifications?.smtpPort || 465);
  const user = (process.env.SMTP_USER || process.env.GMAIL_USER || agencyConfig?.notifications?.smtpUser || "infinityimpactagency@gmail.com").trim();
  const rawPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || agencyConfig?.notifications?.smtpPass;
  const pass = rawPass ? rawPass.replace(/\s+/g, "") : void 0;
  if (pass) {
    const isSecure = port === 465;
    return nodemailer.createTransport({
      host,
      port,
      secure: isSecure,
      auth: { user, pass },
      pool: false,
      connectionTimeout: 8e3,
      greetingTimeout: 8e3,
      socketTimeout: 1e4,
      tls: { rejectUnauthorized: false }
    });
  }
  return null;
}
async function sendMailWithRetry(mailOptions, agencyConfig) {
  const transporter465 = createMailTransporter(agencyConfig, 465);
  if (!transporter465) {
    throw new Error("Credenciales SMTP no configuradas (falta SMTP_PASS o GMAIL_APP_PASSWORD).");
  }
  try {
    return await transporter465.sendMail(mailOptions);
  } catch (err465) {
    console.warn("[SMTP] Puerto 465 fall\xF3 (" + err465.message + "), intentando puerto 587 STARTTLS de respaldo...");
    const transporter587 = createMailTransporter(agencyConfig, 587);
    if (transporter587) {
      return await transporter587.sendMail(mailOptions);
    }
    throw err465;
  }
}
async function dispatchBookingEmails(lead, agencyConfig, req) {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host = req.headers["x-forwarded-host"] || req.get("host") || "localhost:3000";
  const baseUrl = `${protocol}://${host}`;
  const confirmUrl = `${baseUrl}/?action=confirm_booking&id=${lead.id}&email=${encodeURIComponent(lead.email)}`;
  const adminUrl = `${baseUrl}/#/admind`;
  const meetingLink = agencyConfig.notifications.customMeetingLink || "https://meet.google.com/infinity-impact-call";
  const clientHtml = generateClientConfirmationEmailHtml({
    lead,
    agencyConfig,
    confirmUrl,
    meetingLink
  });
  const adminHtml = generateAdminNotificationEmailHtml({
    lead,
    agencyConfig,
    confirmUrl,
    meetingLink,
    adminUrl
  });
  let clientEmailSent = false;
  let adminEmailSent = false;
  let clientPreviewUrl = `/api/preview-email/${lead.id}`;
  let deliveryMethod = "none";
  const fromAddress = process.env.SMTP_FROM || `"${agencyConfig.agencyName}" <infinityimpactagency@gmail.com>`;
  const adminEmail = agencyConfig.notifications.adminEmail || "infinityimpactagency@gmail.com";
  const resendApiKey = process.env.RESEND_API_KEY || agencyConfig.notifications?.resendApiKey;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || agencyConfig.notifications?.smtpPass;
  if (serverWorkspaceToken) {
    try {
      if (lead.email) {
        await sendViaGmailApi(
          serverWorkspaceToken,
          lead.email,
          `\u2705 Confirmaci\xF3n: Tu Llamada Estrat\xE9gica con ${agencyConfig.agencyName}`,
          clientHtml
        );
        clientEmailSent = true;
      }
      if (adminEmail) {
        await sendViaGmailApi(
          serverWorkspaceToken,
          adminEmail,
          `\u{1F514} [NUEVA CITA AGENDADA] ${lead.name} - ${lead.businessName || "Nuevo Cliente"} (${lead.date} ${lead.timeSlot} hrs)`,
          adminHtml
        );
        adminEmailSent = true;
      }
      deliveryMethod = "google_workspace_api";
      logNotificationServer({
        type: "client_confirmation",
        recipient: lead.email,
        title: `Confirmaci\xF3n enviada (Workspace API) a ${lead.name}`,
        message: `Correo oficial con branding enviado desde infinityimpactagency@gmail.com a ${lead.email}`,
        status: "enviado",
        leadId: lead.id
      });
      return {
        clientEmailSent,
        adminEmailSent,
        confirmUrl,
        clientPreviewUrl,
        deliveryMethod
      };
    } catch (gmailErr) {
      console.warn("[Email Dispatch] Workspace API warning, evaluating fallbacks:", gmailErr.message);
    }
  }
  if (resendApiKey) {
    try {
      if (lead.email) {
        await sendViaResend(
          resendApiKey,
          lead.email,
          `\u2705 Confirmaci\xF3n: Tu Llamada Estrat\xE9gica con ${agencyConfig.agencyName}`,
          clientHtml,
          {
            fromName: agencyConfig.agencyName,
            fromEmail: agencyConfig.notifications?.resendFromEmail
          }
        );
        clientEmailSent = true;
      }
      if (adminEmail) {
        await sendViaResend(
          resendApiKey,
          adminEmail,
          `\u{1F514} [NUEVA CITA AGENDADA] ${lead.name} - ${lead.businessName || "Nuevo Cliente"} (${lead.date} ${lead.timeSlot} hrs)`,
          adminHtml,
          {
            fromName: agencyConfig.agencyName,
            fromEmail: agencyConfig.notifications?.resendFromEmail
          }
        );
        adminEmailSent = true;
      }
      deliveryMethod = "resend_api";
      logNotificationServer({
        type: "client_confirmation",
        recipient: lead.email,
        title: `Confirmaci\xF3n enviada (Resend API) a ${lead.name}`,
        message: `Correo oficial entregado a ${lead.email} y copia de alerta a ${adminEmail} v\xEDa Resend API.`,
        status: "enviado",
        leadId: lead.id
      });
      return {
        clientEmailSent,
        adminEmailSent,
        confirmUrl,
        clientPreviewUrl,
        deliveryMethod
      };
    } catch (resendErr) {
      console.warn("[Email Dispatch] Resend API error:", resendErr.message);
    }
  }
  if (smtpPass) {
    try {
      if (lead.email) {
        await sendMailWithRetry({
          from: fromAddress,
          to: lead.email,
          subject: `\u2705 Confirmaci\xF3n: Tu Llamada Estrat\xE9gica con ${agencyConfig.agencyName}`,
          html: clientHtml
        }, agencyConfig);
        clientEmailSent = true;
        logNotificationServer({
          type: "client_confirmation",
          recipient: lead.email,
          title: `Confirmaci\xF3n enviada (Gmail SMTP) a ${lead.name}`,
          message: `Correo oficial enviado desde infinityimpactagency@gmail.com con bot\xF3n interactivo de confirmaci\xF3n.`,
          status: "enviado",
          leadId: lead.id
        });
      }
      if (adminEmail) {
        const formatIcsDate = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        const startIso = `${lead.date}T${lead.timeSlot}:00`;
        const startDate = new Date(startIso);
        const durationMin = agencyConfig.hoursConfig?.slotDurationMinutes || 45;
        const endDate = new Date(startDate.getTime() + durationMin * 6e4);
        const icsContent = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Infinity Impact Agency//Booking System//ES",
          "CALSCALE:GREGORIAN",
          "METHOD:REQUEST",
          "BEGIN:VEVENT",
          `UID:infinity_${lead.id}@infinityimpactagency.com`,
          `DTSTAMP:${formatIcsDate(/* @__PURE__ */ new Date())}`,
          `DTSTART:${formatIcsDate(startDate)}`,
          `DTEND:${formatIcsDate(endDate)}`,
          `SUMMARY:Llamada Estrat\xE9gica IA: ${lead.name} (${lead.businessName || "Empresa"}) - Infinity Impact`,
          `DESCRIPTION:Sesi\xF3n Estrat\xE9gica de Crecimiento con IA.\\nCliente: ${lead.name}\\nEmpresa: ${lead.businessName || "No indicada"}\\nWhatsApp: ${lead.phone}\\nEmail: ${lead.email}\\nServicio: ${lead.serviceInterest || "Consultor\xEDa IA"}\\nSala Meet: ${meetingLink}`,
          `LOCATION:${meetingLink}`,
          "ORGANIZER;CN=Infinity Impact Agency:mailto:infinityimpactagency@gmail.com",
          "ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=Infinity Impact:mailto:infinityimpactagency@gmail.com",
          `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;CN=${lead.name}:mailto:${lead.email}`,
          "STATUS:CONFIRMED",
          "BEGIN:VALARM",
          "TRIGGER:-PT15M",
          "ACTION:DISPLAY",
          "DESCRIPTION:Recordatorio de Llamada Estrat\xE9gica IA",
          "END:VALARM",
          "END:VEVENT",
          "END:VCALENDAR"
        ].join("\r\n");
        await sendMailWithRetry({
          from: fromAddress,
          to: adminEmail,
          subject: `\u{1F514} [NUEVA CITA AGENDADA] ${lead.name} - ${lead.businessName || "Nuevo Cliente"} (${lead.date} ${lead.timeSlot} hrs)`,
          html: adminHtml,
          icalEvent: {
            filename: `cita-${lead.id}.ics`,
            method: "REQUEST",
            content: icsContent
          }
        }, agencyConfig);
        adminEmailSent = true;
        logNotificationServer({
          type: "admin_alert",
          recipient: adminEmail,
          title: `Alerta: Cita agendada por ${lead.name}`,
          message: `Lead ${lead.businessName || lead.name} enviado a la bandeja de ${adminEmail}.`,
          status: "enviado",
          leadId: lead.id
        });
      }
      deliveryMethod = "gmail_smtp";
    } catch (smtpErr) {
      console.error("[Email Dispatch] SMTP error:", smtpErr.message);
      logNotificationServer({
        type: "client_confirmation",
        recipient: lead.email,
        title: `Error al enviar correo (SMTP): ${lead.name}`,
        message: `Fallo SMTP: ${smtpErr.message}`,
        status: "error",
        leadId: lead.id
      });
    }
  }
  const webhookUrl = process.env.WEBHOOK_URL || agencyConfig.notifications?.webhookUrl;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "new_booking",
          agency: agencyConfig.agencyName,
          lead,
          confirmUrl,
          meetingLink,
          deliveryMethod,
          timestamp: Date.now()
        })
      });
      console.log("[Email Dispatch] Webhook notification delivered to", webhookUrl);
    } catch (whErr) {
      console.warn("[Email Dispatch] Webhook notification failed:", whErr.message);
    }
  }
  if (!clientEmailSent && !adminEmailSent) {
    console.warn("[Email Dispatch] Notice: No active SMTP_PASS or RESEND_API_KEY configured.");
    logNotificationServer({
      type: "client_confirmation",
      recipient: lead.email,
      title: `\u26A0\uFE0F Credenciales de correo no configuradas`,
      message: `La cita fue agendada pero no se pudo enviar correo en vivo porque falta SMTP_PASS o RESEND_API_KEY en Vercel o en /admind.`,
      status: "pendiente_configuracion",
      leadId: lead.id
    });
  }
  return {
    clientEmailSent,
    adminEmailSent,
    clientPreviewUrl,
    confirmUrl,
    deliveryMethod: clientEmailSent ? deliveryMethod : "none"
  };
}
app.get(["/api/health", "/health"], (req, res) => {
  res.json({ status: "ok", agency: "Infinity Impact Agency", timestamp: Date.now() });
});
app.get(["/api/leads", "/leads"], (req, res) => {
  const leads = getStoredLeads();
  res.json({ leads });
});
app.post(["/api/leads", "/leads"], async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      businessName,
      businessCategory,
      serviceInterest,
      notes,
      date,
      timeSlot
    } = req.body;
    if (!name || !email || !date || !timeSlot) {
      return res.status(400).json({ error: "Faltan campos obligatorios (nombre, email, fecha u horario)" });
    }
    const leads = getStoredLeads();
    const config = getStoredConfig();
    const newLead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      email,
      phone: phone || "",
      businessName: businessName || "",
      businessCategory: businessCategory || "General",
      serviceInterest: serviceInterest || "INFINITY GROWTH",
      notes: notes || "",
      date,
      timeSlot,
      status: "agendado",
      createdAt: Date.now(),
      sentEmail: false,
      adminNotified: false
    };
    const emailResult = await dispatchBookingEmails(newLead, config, req);
    newLead.sentEmail = emailResult.clientEmailSent;
    newLead.adminNotified = emailResult.adminEmailSent;
    leads.unshift(newLead);
    saveStoredLeads(leads);
    res.status(201).json({
      success: true,
      lead: newLead,
      emailSent: emailResult.clientEmailSent,
      adminNotified: emailResult.adminEmailSent,
      clientPreviewUrl: emailResult.clientPreviewUrl,
      confirmUrl: emailResult.confirmUrl,
      deliveryMethod: emailResult.deliveryMethod
    });
  } catch (err) {
    console.error("Error creating lead:", err);
    res.status(500).json({ error: err.message || "Error al agendar la llamada" });
  }
});
app.post(["/api/leads/:id/confirm", "/leads/:id/confirm"], async (req, res) => {
  const { id } = req.params;
  const leads = getStoredLeads();
  const leadIndex = leads.findIndex((l) => l.id === id);
  if (leadIndex === -1) {
    return res.status(404).json({ error: "Cita no encontrada" });
  }
  leads[leadIndex].status = "confirmado";
  leads[leadIndex].confirmedAt = Date.now();
  const lead = leads[leadIndex];
  const config = getStoredConfig();
  let calendarScheduled = false;
  let calendarEventResult = null;
  const activeToken = serverWorkspaceToken || getStoredWorkspaceAuth().token;
  if (activeToken) {
    try {
      calendarEventResult = await scheduleCallInGoogleCalendar(activeToken, lead, config);
      leads[leadIndex].syncedCalendar = true;
      leads[leadIndex].calendarEventId = calendarEventResult.id;
      leads[leadIndex].calendarEventLink = calendarEventResult.htmlLink;
      calendarScheduled = true;
      console.log(`[Google Calendar] Call scheduled automatically for ${lead.name} (${lead.date} ${lead.timeSlot}): ${calendarEventResult.htmlLink}`);
      logNotificationServer({
        type: "calendar_event",
        recipient: lead.email,
        title: `\u{1F4C5} Agendado en Google Calendar: ${lead.name}`,
        message: `La videollamada ha sido agendada autom\xE1ticamente en el Google Calendar de la agencia para el ${lead.date} a las ${lead.timeSlot} hrs. Sala Meet vinculada.`,
        status: "enviado",
        leadId: lead.id
      });
    } catch (calErr) {
      console.warn("[Google Calendar Sync Warning]", calErr.message);
    }
  }
  saveStoredLeads(leads);
  logNotificationServer({
    type: "client_confirmation",
    recipient: lead.email,
    title: `\u2705 Cita Confirmada por el Cliente: ${lead.name}`,
    message: `El cliente ${lead.name} (${lead.businessName || "Empresa"}) confirm\xF3 su asistencia desde el correo para el ${lead.date} a las ${lead.timeSlot} hrs.${calendarScheduled ? " (Agendada en Google Calendar)" : ""}`,
    status: "enviado",
    leadId: lead.id
  });
  res.json({
    success: true,
    message: "Cita confirmada con \xE9xito por el cliente",
    lead: leads[leadIndex],
    calendarScheduled,
    calendarLink: calendarEventResult?.htmlLink || null
  });
});
app.post(["/api/leads/:id/schedule-calendar", "/leads/:id/schedule-calendar"], async (req, res) => {
  const { id } = req.params;
  const leads = getStoredLeads();
  const leadIndex = leads.findIndex((l) => l.id === id);
  if (leadIndex === -1) {
    return res.status(404).json({ error: "Cita no encontrada" });
  }
  const lead = leads[leadIndex];
  const config = getStoredConfig();
  const token = req.body.token || serverWorkspaceToken || getStoredWorkspaceAuth().token;
  if (!token) {
    return res.status(400).json({ error: "No hay token de Google Workspace activo. Conecta tu cuenta en el panel de administraci\xF3n." });
  }
  try {
    const calResult = await scheduleCallInGoogleCalendar(token, lead, config);
    leads[leadIndex].syncedCalendar = true;
    leads[leadIndex].calendarEventId = calResult.id;
    leads[leadIndex].calendarEventLink = calResult.htmlLink;
    saveStoredLeads(leads);
    logNotificationServer({
      type: "calendar_event",
      recipient: lead.email,
      title: `\u{1F4C5} Sincronizado en Google Calendar: ${lead.name}`,
      message: `Llamada agendada exitosamente en Google Calendar para el ${lead.date} a las ${lead.timeSlot} hrs.`,
      status: "enviado",
      leadId: lead.id
    });
    res.json({ success: true, lead: leads[leadIndex], calendarLink: calResult.htmlLink });
  } catch (err) {
    console.error("Error scheduling in Google Calendar:", err);
    res.status(500).json({ error: err.message || "Error al agendar en Google Calendar" });
  }
});
app.patch(["/api/leads/:id", "/leads/:id"], (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const leads = getStoredLeads();
  const leadIndex = leads.findIndex((l) => l.id === id);
  if (leadIndex === -1) {
    return res.status(404).json({ error: "Cita no encontrada" });
  }
  leads[leadIndex] = { ...leads[leadIndex], ...updates };
  saveStoredLeads(leads);
  res.json({ success: true, lead: leads[leadIndex] });
});
app.delete(["/api/leads", "/leads"], (req, res) => {
  saveStoredLeads([]);
  res.json({ success: true, count: 0 });
});
app.delete(["/api/leads/:id", "/leads/:id"], (req, res) => {
  const { id } = req.params;
  let leads = getStoredLeads();
  leads = leads.filter((l) => l.id !== id);
  saveStoredLeads(leads);
  res.json({ success: true });
});
app.post(["/api/leads/:id/resend", "/leads/:id/resend"], async (req, res) => {
  const { id } = req.params;
  const leads = getStoredLeads();
  const lead = leads.find((l) => l.id === id);
  if (!lead) {
    return res.status(404).json({ error: "Cita no encontrada" });
  }
  const config = getStoredConfig();
  const result = await dispatchBookingEmails(lead, config, req);
  res.json({
    success: true,
    message: `Correo de confirmaci\xF3n reenviado a ${lead.email}`,
    result
  });
});
app.get(["/api/preview-email/:id", "/preview-email/:id"], (req, res) => {
  const { id } = req.params;
  const leads = getStoredLeads();
  const lead = leads.find((l) => l.id === id) || {
    id: "demo_lead",
    name: "Carlos Mendoza",
    email: "carlos@tuempresa.com",
    phone: "+56 9 1234 5678",
    businessName: "Cl\xEDnica San Lucas",
    businessCategory: "Salud / Est\xE9tica",
    serviceInterest: "INFINITY GROWTH",
    notes: "Queremos automatizar el agendamiento y confirmaci\xF3n de citas 24/7.",
    date: "2026-09-08",
    timeSlot: "11:00",
    status: "agendado",
    createdAt: Date.now()
  };
  const config = getStoredConfig();
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host = req.headers["x-forwarded-host"] || req.get("host") || "localhost:3000";
  const baseUrl = `${protocol}://${host}`;
  const confirmUrl = `${baseUrl}/?action=confirm_booking&id=${lead.id}&email=${encodeURIComponent(lead.email)}`;
  const meetingLink = config.notifications.customMeetingLink || "https://meet.google.com/infinity-impact-call";
  const html = generateClientConfirmationEmailHtml({
    lead,
    agencyConfig: config,
    confirmUrl,
    meetingLink
  });
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});
app.get(["/api/config", "/config"], (req, res) => {
  res.json({ config: getStoredConfig() });
});
app.post(["/api/workspace/sync-token", "/workspace/sync-token"], (req, res) => {
  const { token, email } = req.body;
  if (token) {
    serverWorkspaceToken = token;
    serverWorkspaceEmail = email || "infinityimpactagency@gmail.com";
    saveStoredWorkspaceAuth(token, serverWorkspaceEmail);
    console.log(`[Workspace API] Google Workspace token synced and persisted for ${serverWorkspaceEmail}`);
    res.json({ success: true, message: "Google Workspace token sincronizado para env\xEDos y Google Calendar en vivo." });
  } else {
    res.status(400).json({ error: "Token no proporcionado" });
  }
});
app.get(["/api/email-config-status", "/email-config-status"], (req, res) => {
  const config = getStoredConfig();
  const hasSmtpPass = !!(process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || config.notifications?.smtpPass);
  const hasResend = !!(process.env.RESEND_API_KEY || config.notifications?.resendApiKey);
  const hasWebhook = !!(process.env.WEBHOOK_URL || config.notifications?.webhookUrl);
  const hasWorkspaceToken = !!serverWorkspaceToken;
  const isConfigured = hasWorkspaceToken || hasResend || hasSmtpPass;
  res.json({
    senderEmail: "infinityimpactagency@gmail.com",
    adminRecipient: config.notifications?.adminEmail || "infinityimpactagency@gmail.com",
    hasSmtpPass,
    hasResend,
    hasWebhook,
    hasWorkspaceToken,
    isConfigured,
    mode: hasWorkspaceToken ? "gmail_oauth_api" : hasResend ? "resend_api" : hasSmtpPass ? "gmail_smtp_live" : "unconfigured"
  });
});
app.post(["/api/config", "/config"], (req, res) => {
  const newConfig = req.body;
  saveStoredConfig(newConfig);
  res.json({ success: true, config: newConfig });
});
app.get(["/api/content", "/content"], (req, res) => {
  res.json({ content: getStoredContent() });
});
app.post(["/api/content", "/content"], (req, res) => {
  const content = req.body;
  saveStoredContent(content);
  res.json({ success: true, content });
});
app.post(["/api/admin/save-to-code", "/admin/save-to-code"], (req, res) => {
  try {
    const { config, services, pricing } = req.body;
    if (config) {
      saveStoredConfig(config);
      const defaultsFilePath = path.join(process.cwd(), "src", "adminDefaults.ts");
      if (fs.existsSync(defaultsFilePath)) {
        const content = fs.readFileSync(defaultsFilePath, "utf-8");
        const regex = /export const DEFAULT_AGENCY_CONFIG: AgencySiteConfig = \{[\s\S]*?\n\};/;
        const replacement = `export const DEFAULT_AGENCY_CONFIG: AgencySiteConfig = ${JSON.stringify(config, null, 2)};`;
        if (regex.test(content)) {
          const updated = content.replace(regex, replacement);
          fs.writeFileSync(defaultsFilePath, updated, "utf-8");
          console.log("[Admin API] Updated src/adminDefaults.ts with new default agency configuration for Git/PR tracking.");
        }
      }
    }
    if (services || pricing) {
      saveStoredContent({ services, pricing });
    }
    res.json({
      success: true,
      message: "\xA1Configuraci\xF3n sincronizada exitosamente con los archivos del proyecto! Ahora aparecer\xE1 en tu repositorio de GitHub y en tus Pull Requests."
    });
  } catch (err) {
    console.error("Error saving to code files:", err);
    res.status(500).json({ success: false, error: err?.message || "Error guardando en archivos de c\xF3digo" });
  }
});
app.get(["/api/logs", "/logs"], (req, res) => {
  try {
    if (fs.existsSync(LOGS_FILE)) {
      const logs = JSON.parse(fs.readFileSync(LOGS_FILE, "utf-8"));
      return res.json({ logs });
    }
  } catch (e) {
    console.error(e);
  }
  res.json({ logs: [] });
});
app.post(["/api/test-email", "/test-email"], async (req, res) => {
  try {
    const config = getStoredConfig();
    const targetEmail = req.body.email || config.notifications.adminEmail || "infinityimpactagency@gmail.com";
    const resendApiKey = (process.env.RESEND_API_KEY || config.notifications?.resendApiKey)?.trim();
    const hasSmtpPass = !!(process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || config.notifications?.smtpPass);
    const hasWorkspaceToken = !!serverWorkspaceToken;
    const htmlContent = `
        <div style="background-color: #07090e; padding: 30px; font-family: sans-serif; color: #ffffff; border-radius: 12px; max-width: 550px; margin: 0 auto; border: 1px solid #1e293b;">
          <h2 style="color: #06b6d4; margin-top: 0;">\u26A1 Prueba de Env\xEDo Exitosa</h2>
          <p>Este es un correo de prueba enviado desde <strong>${config.agencyName}</strong> (infinityimpactagency@gmail.com).</p>
          <p>El sistema de reservas autom\xE1ticas est\xE1 activo y listo para notificar en vivo tanto al cliente como al administrador.</p>
          <div style="margin-top: 20px; padding: 12px; background: #121824; border-radius: 8px; font-size: 12px; color: #10b981;">
            \u2713 Destinatario: <strong>${targetEmail}</strong><br/>
            \u2713 Proveedor activo: ${hasWorkspaceToken ? "Google Workspace API" : resendApiKey ? "Resend REST API" : hasSmtpPass ? "Gmail SMTP Autenticado" : "Sin credenciales"}
          </div>
        </div>
      `;
    if (serverWorkspaceToken) {
      try {
        await sendViaGmailApi(
          serverWorkspaceToken,
          targetEmail,
          `\u{1F514} [PRUEBA EN VIVO] Sistema de Env\xEDo de ${config.agencyName}`,
          htmlContent
        );
        return res.json({
          success: true,
          deliveredLive: true,
          message: `Correo de prueba entregado en vivo a ${targetEmail} v\xEDa Google Workspace API`,
          mode: "gmail_oauth_api"
        });
      } catch (apiErr) {
        console.warn("Test send via Gmail API failed:", apiErr.message);
      }
    }
    if (resendApiKey) {
      try {
        await sendViaResend(
          resendApiKey,
          targetEmail,
          `\u{1F514} [PRUEBA EN VIVO] Sistema de Env\xEDo de ${config.agencyName}`,
          htmlContent,
          {
            fromName: config.agencyName,
            fromEmail: config.notifications?.resendFromEmail
          }
        );
        return res.json({
          success: true,
          deliveredLive: true,
          message: `Correo de prueba entregado en vivo a ${targetEmail} v\xEDa Resend API`,
          mode: "resend_api"
        });
      } catch (resendErr) {
        console.warn("Test send via Resend failed:", resendErr.message);
      }
    }
    if (hasSmtpPass) {
      try {
        const fromAddress = process.env.SMTP_FROM || `"${config.agencyName}" <infinityimpactagency@gmail.com>`;
        await sendMailWithRetry({
          from: fromAddress,
          to: targetEmail,
          subject: `\u{1F514} [PRUEBA OFICIAL] Sistema de Env\xEDo de ${config.agencyName}`,
          html: htmlContent
        }, config);
        return res.json({
          success: true,
          deliveredLive: true,
          message: `Correo de prueba entregado en vivo a ${targetEmail} v\xEDa Gmail SMTP autenticado.`,
          mode: "gmail_smtp_live"
        });
      } catch (smtpErr) {
        console.error("Test send via SMTP failed:", smtpErr.message);
        return res.status(400).json({
          success: false,
          deliveredLive: false,
          error: `Error al autenticar o enviar con Gmail SMTP: ${smtpErr.message}`,
          mode: "smtp_error"
        });
      }
    }
    return res.status(400).json({
      success: false,
      deliveredLive: false,
      error: "No hay credenciales activas en Vercel. Agrega SMTP_PASS (Contrase\xF1a de aplicaci\xF3n de Google) o RESEND_API_KEY en Vercel > Settings > Environment Variables.",
      mode: "unconfigured"
    });
  } catch (err) {
    console.error("Test email error:", err);
    res.status(500).json({ success: false, error: err.message || "Error al enviar correo de prueba" });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
if (!isVercel && process.env.NODE_ENV !== "test") {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
  });
}
var server_default = app;
export {
  app,
  server_default as default
};
