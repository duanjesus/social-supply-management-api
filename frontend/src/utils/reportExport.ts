import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import type { Donation } from "@/types/donation";
import type { Distribution } from "@/types/distribution";
import { PRODUCT_UNIT_LABELS } from "@/types/product";
import { formatDate, formatQuantity } from "@/utils/format";

interface ReportMeta {
  startDate?: string;
  endDate?: string;
  institutionName?: string;
}

function periodLabel(meta: ReportMeta): string {
  if (!meta.startDate && !meta.endDate) return "Todo o período";
  const start = meta.startDate ? formatDate(meta.startDate) : "início";
  const end = meta.endDate ? formatDate(meta.endDate) : "hoje";
  return `${start} a ${end}`;
}

function reportFileName(extension: string): string {
  return `relatorio-social-supply-${new Date().toISOString().slice(0, 10)}.${extension}`;
}

export function exportReportToPdf(
  donations: Donation[],
  distributions: Distribution[],
  meta: ReportMeta,
): void {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Relatório — Social Supply Management", 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Período: ${periodLabel(meta)}`, 14, 25);
  if (meta.institutionName) {
    doc.text(`Instituição: ${meta.institutionName}`, 14, 30);
  }

  let cursorY = meta.institutionName ? 38 : 33;

  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Doações (${donations.length})`, 14, cursorY);
  autoTable(doc, {
    startY: cursorY + 4,
    head: [["Data", "Doador", "Produto", "Quantidade"]],
    body: donations.map((donation) => [
      formatDate(donation.donationDate),
      donation.donorName,
      donation.product.name,
      `${formatQuantity(donation.quantity)} ${PRODUCT_UNIT_LABELS[donation.product.unit]}`,
    ]),
    headStyles: { fillColor: [42, 120, 214] },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  doc.setFontSize(12);
  doc.text(`Distribuições (${distributions.length})`, 14, cursorY);
  autoTable(doc, {
    startY: cursorY + 4,
    head: [["Data", "Instituição", "Produto", "Quantidade", "Responsável"]],
    body: distributions.map((distribution) => [
      formatDate(distribution.distributionDate),
      distribution.institution.name,
      distribution.product.name,
      `${formatQuantity(distribution.quantity)} ${PRODUCT_UNIT_LABELS[distribution.product.unit]}`,
      distribution.responsibleName ?? "—",
    ]),
    headStyles: { fillColor: [27, 175, 122] },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  doc.save(reportFileName("pdf"));
}

function csvEscape(value: string): string {
  if (value.includes(";") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadBlob(content: string, mimeType: string, fileName: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * "Excel" export as CSV (semicolon-delimited, UTF-8 BOM) rather than a real
 * .xlsx binary — deliberately: the .xlsx-writing libraries available on npm
 * either ship a known unpatched high-severity vulnerability (xlsx/SheetJS) or
 * drag in a large, partly-deprecated dependency tree for moderate-severity
 * transitive issues (exceljs → uuid). A semicolon-delimited CSV opens natively
 * in Excel/Sheets/LibreOffice with zero added dependencies and zero known CVEs.
 * Revisit if a lean, actively-maintained .xlsx writer becomes available.
 */
export function exportReportToCsv(donations: Donation[], distributions: Distribution[]): void {
  const lines: string[] = [];

  lines.push("Doações");
  lines.push(["Data", "Doador", "Documento", "Produto", "Quantidade", "Unidade"].join(";"));
  for (const donation of donations) {
    lines.push(
      [
        formatDate(donation.donationDate),
        donation.donorName,
        donation.donorDocument ?? "",
        donation.product.name,
        formatQuantity(donation.quantity),
        PRODUCT_UNIT_LABELS[donation.product.unit],
      ]
        .map(csvEscape)
        .join(";"),
    );
  }

  lines.push("");
  lines.push("Distribuições");
  lines.push(["Data", "Instituição", "Produto", "Quantidade", "Unidade", "Responsável"].join(";"));
  for (const distribution of distributions) {
    lines.push(
      [
        formatDate(distribution.distributionDate),
        distribution.institution.name,
        distribution.product.name,
        formatQuantity(distribution.quantity),
        PRODUCT_UNIT_LABELS[distribution.product.unit],
        distribution.responsibleName ?? "",
      ]
        .map(csvEscape)
        .join(";"),
    );
  }

  const BOM = "﻿"; // so Excel opens the UTF-8 file with accented characters intact
  downloadBlob(BOM + lines.join("\r\n"), "text/csv;charset=utf-8;", reportFileName("csv"));
}
